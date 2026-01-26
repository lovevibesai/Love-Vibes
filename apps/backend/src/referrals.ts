// Referral Tracking System
// Track referrals and reward users with Scenario Keys

import { Env } from './index'
import { z } from 'zod';
import { ValidationError, AppError, NotFoundError } from './errors';

// Zod Schema
const UnlockScenarioSchema = z.object({
    userId: z.string().uuid(),
    scenarioType: z.enum(['intimate', 'mystical']),
});

export interface ReferralStats {
    referral_code: string
    total_referrals: number
    successful_signups: number
    available_keys: number
    referrals: Array<{
        name: string
        joined_at: number
        status: 'signed_up' | 'active' | 'premium'
    }>
}

// Generate unique referral code for user
export async function generateReferralCode(env: Env, userId: string): Promise<string> {
    const user = await env.DB.prepare('SELECT name FROM Users WHERE id = ?')
        .bind(userId)
        .first()

    if (!user) throw new NotFoundError('User')

    // Generate code: FIRSTNAME + 4 random chars
    const firstName = (user.name as string).split(' ')[0].toUpperCase()
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code = `${firstName}${randomChars}`

    // Save code
    await env.DB.prepare('UPDATE Users SET referral_code = ? WHERE id = ?')
        .bind(code, userId)
        .run()

    return code
}

// Track referral signup
export async function trackReferral(
    env: Env,
    referralCode: string,
    newUserId: string
): Promise<{ success: boolean; reward?: number }> {
    try {
        // Find referrer
        const referrer = await env.DB.prepare('SELECT id, scenario_keys FROM Users WHERE referral_code = ?')
            .bind(referralCode)
            .first()

        if (!referrer) {
            return { success: false }
        }

        const now = Math.floor(Date.now() / 1000)

        // Log referral
        await env.DB.prepare(
            'INSERT INTO Referrals (referrer_id, referred_id, status, created_at) VALUES (?, ?, ?, ?)'
        )
            .bind(referrer.id, newUserId, 'signed_up', now)
            .run()

        // Reward referrer with 3 Scenario Keys
        const keysReward = 3
        await env.DB.prepare('UPDATE Users SET scenario_keys = scenario_keys + ? WHERE id = ?')
            .bind(keysReward, referrer.id)
            .run()

        return { success: true, reward: keysReward }
    } catch (error) {
        console.error('Referral tracking failed:', error)
        return { success: false }
    }
}

export async function getReferralStats(env: Env, userId: string): Promise<ReferralStats> {
    try {
        if (!env.DB) throw new AppError("Database not bound", 503, 'CONFIG_ERROR');

        // Get user's referral code and keys
        const user = await env.DB.prepare('SELECT referral_code, scenario_keys FROM Users WHERE id = ?')
            .bind(userId)
            .first()

        if (!user) {
            // Return default stats for users who might not be fully initialized in DB but have valid token
            return {
                referral_code: "INIT-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
                total_referrals: 0,
                successful_signups: 0,
                available_keys: 0,
                referrals: [],
            }
        }

        if (!user.referral_code) {
            try {
                const code = await generateReferralCode(env, userId)
                return {
                    referral_code: code,
                    total_referrals: 0,
                    successful_signups: 0,
                    available_keys: 0,
                    referrals: [],
                }
            } catch (e) {
                // If code generation fails (e.g. read-only DB), return fallback
                return {
                    referral_code: "GEN-ERR",
                    total_referrals: 0,
                    successful_signups: 0,
                    available_keys: 0,
                    referrals: [],
                }
            }
        }

        // Get referral stats
        let stats: any = { total: 0, successful: 0 };
        try {
            stats = await env.DB.prepare(
                `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'active' OR status = 'premium' THEN 1 ELSE 0 END) as successful
            FROM Referrals 
            WHERE referrer_id = ?`
            )
                .bind(userId)
                .first() || { total: 0, successful: 0 };
        } catch (e) {
            console.warn("Referrals table stats query failed", e);
        }

        // Get referral details
        let referralsList: any[] = [];
        try {
            const referralsResult = await env.DB.prepare(
                `SELECT u.name, r.created_at, r.status
             FROM Referrals r
             JOIN Users u ON r.referred_id = u.id
             WHERE r.referrer_id = ?
             ORDER BY r.created_at DESC
             LIMIT 50`
            )
                .bind(userId)
                .all();

            if (referralsResult && referralsResult.results) {
                referralsList = referralsResult.results;
            } else if (Array.isArray(referralsResult)) {
                // Handle case where client returns array directly
                referralsList = referralsResult;
            }
        } catch (e) {
            console.warn("Referrals list query failed", e);
        }

        return {
            referral_code: user.referral_code as string,
            total_referrals: (stats?.total as number) || 0,
            successful_signups: (stats?.successful as number) || 0,
            available_keys: (user.scenario_keys as number) || 0,
            referrals: referralsList.map((r: any) => ({
                name: r.name,
                joined_at: r.created_at,
                status: r.status,
            })),
        }
    } catch (error) {
        console.error("Critical error in getReferralStats:", error);
        // Fallback to prevent 500 error on client
        return {
            referral_code: "VIBE-ERR",
            total_referrals: 0,
            successful_signups: 0,
            available_keys: 0,
            referrals: [],
        }
    }
}

// Unlock a scenario (spend a key)
export async function unlockScenario(env: Env, userId: string, scenarioType: 'intimate' | 'mystical'): Promise<{ success: boolean, keysRemaining: number }> {
    // Note: In handleRequest, we parse this with UnlockScenarioSchema
    const user = await env.DB.prepare('SELECT scenario_keys FROM Users WHERE id = ?')
        .bind(userId)
        .first()

    if (!user || (user.scenario_keys as number) < 1) {
        throw new AppError("Insufficient Scenario Keys", 402, 'INSUFFICIENT_KEYS');
    }

    // Deduct key
    await env.DB.prepare('UPDATE Users SET scenario_keys = scenario_keys - 1 WHERE id = ?')
        .bind(userId)
        .run()

    // In a real implementation, we would create a "ScenarioSession" record here

    return {
        success: true,
        keysRemaining: (user.scenario_keys as number) - 1
    }
}
