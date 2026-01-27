// Referral Tracking System
// Track referrals and reward users with Scenario Keys

import { Env } from './index'
import { AppError, NotFoundError } from './errors';
import { logger } from './logger';

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

    const firstName = (user.name as string || 'USER').split(' ')[0].toUpperCase()
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code = `${firstName}${randomChars}`

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
        const referrer = await env.DB.prepare('SELECT id FROM Users WHERE referral_code = ?')
            .bind(referralCode)
            .first()

        if (!referrer) return { success: false }

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

        logger.info('referral_tracked', undefined, { referrerId: referrer.id, newUserId, reward: keysReward });
        return { success: true, reward: keysReward }
    } catch (error) {
        logger.error('referral_tracking_failed', error);
        return { success: false }
    }
}

export async function getReferralStats(env: Env, userId: string): Promise<ReferralStats> {
    try {
        const user = await env.DB.prepare('SELECT referral_code, scenario_keys FROM Users WHERE id = ?')
            .bind(userId)
            .first()

        if (!user) throw new NotFoundError('User');

        let referralCode = user.referral_code as string;
        if (!referralCode) {
            referralCode = await generateReferralCode(env, userId);
        }

        const stats = await env.DB.prepare(
            `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' OR status = 'premium' THEN 1 ELSE 0 END) as successful
        FROM Referrals 
        WHERE referrer_id = ?`
        ).bind(userId).first() || { total: 0, successful: 0 };

        const referralsResult = await env.DB.prepare(
            `SELECT u.name, r.created_at, r.status
         FROM Referrals r
         JOIN Users u ON r.referred_id = u.id
         WHERE r.referrer_id = ?
         ORDER BY r.created_at DESC
         LIMIT 50`
        ).bind(userId).all();

        const referralsList = referralsResult.results || [];

        return {
            referral_code: referralCode,
            total_referrals: (stats.total as number) || 0,
            successful_signups: (stats.successful as number) || 0,
            available_keys: (user.scenario_keys as number) || 0,
            referrals: (referralsList as Record<string, unknown>[]).map((r) => ({
                name: String(r.name),
                joined_at: Number(r.created_at),
                status: r.status as 'signed_up' | 'active' | 'premium',
            })),
        }
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch referral stats', 500, 'REFERRAL_STATS_ERROR', error instanceof Error ? error : undefined);
    }
}

// Unlock a scenario (spend a key)
export async function unlockScenario(env: Env, userId: string, scenarioType: 'intimate' | 'mystical'): Promise<{ success: boolean, keysRemaining: number }> {
    const user = await env.DB.prepare('SELECT scenario_keys FROM Users WHERE id = ?')
        .bind(userId)
        .first()

    if (!user || (user.scenario_keys as number) < 1) {
        throw new AppError("Insufficient Scenario Keys", 402, 'INSUFFICIENT_KEYS');
    }

    const newKeys = (user.scenario_keys as number) - 1;

    await env.DB.prepare('UPDATE Users SET scenario_keys = ? WHERE id = ?')
        .bind(newKeys, userId)
        .run()

    logger.info('scenario_unlocked', undefined, { userId, scenarioType, keysRemaining: newKeys });

    return {
        success: true,
        keysRemaining: newKeys
    }
}
