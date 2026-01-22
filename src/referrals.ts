// Referral Tracking System
// Track referrals and reward users with Scenario Keys

import { Env } from './index'

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

    if (!user) throw new Error('User not found')

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

// Get referral stats for user
export async function getReferralStats(env: Env, userId: string): Promise<ReferralStats> {
    // Get user's referral code and keys
    const user = await env.DB.prepare('SELECT referral_code, scenario_keys FROM Users WHERE id = ?')
        .bind(userId)
        .first()

    if (!user) {
        throw new Error("User not found")
    }

    if (!user.referral_code) {
        const code = await generateReferralCode(env, userId)
        return {
            referral_code: code,
            total_referrals: 0,
            successful_signups: 0,
            available_keys: 0,
            referrals: [],
        }
    }

    // Get referral stats
    const stats = await env.DB.prepare(
        `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' OR status = 'premium' THEN 1 ELSE 0 END) as successful
    FROM Referrals 
    WHERE referrer_id = ?`
    )
        .bind(userId)
        .first()

    // Get referral details
    const referrals = await env.DB.prepare(
        `SELECT u.name, r.created_at, r.status
     FROM Referrals r
     JOIN Users u ON r.referred_id = u.id
     WHERE r.referrer_id = ?
     ORDER BY r.created_at DESC
     LIMIT 50`
    )
        .bind(userId)
        .all()

    return {
        referral_code: user.referral_code as string,
        total_referrals: (stats?.total as number) || 0,
        successful_signups: (stats?.successful as number) || 0,
        available_keys: (user.scenario_keys as number) || 0,
        referrals: referrals.results.map((r: any) => ({
            name: r.name,
            joined_at: r.created_at,
            status: r.status,
        })),
    }
}

// Unlock a scenario (spend a key)
export async function unlockScenario(env: Env, userId: string, scenarioType: 'intimate' | 'mystical'): Promise<{ success: boolean, keysRemaining: number }> {
    const user = await env.DB.prepare('SELECT scenario_keys FROM Users WHERE id = ?')
        .bind(userId)
        .first()

    if (!user || (user.scenario_keys as number) < 1) {
        throw new Error("Insufficient Scenario Keys")
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
