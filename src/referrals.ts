// Referral Tracking System
// Track referrals and reward users

import { Env } from './index'

export interface ReferralStats {
    referral_code: string
    total_referrals: number
    successful_signups: number
    credits_earned: number
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
        const referrer = await env.DB.prepare('SELECT id, credits_balance FROM Users WHERE referral_code = ?')
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

        // Reward referrer with credits
        const rewardCredits = 50
        await env.DB.prepare('UPDATE Users SET credits_balance = credits_balance + ? WHERE id = ?')
            .bind(rewardCredits, referrer.id)
            .run()

        return { success: true, reward: rewardCredits }
    } catch (error) {
        console.error('Referral tracking failed:', error)
        return { success: false }
    }
}

// Get referral stats for user
export async function getReferralStats(env: Env, userId: string): Promise<ReferralStats> {
    // Get user's referral code
    const user = await env.DB.prepare('SELECT referral_code FROM Users WHERE id = ?')
        .bind(userId)
        .first()

    if (!user || !user.referral_code) {
        const code = await generateReferralCode(env, userId)
        return {
            referral_code: code,
            total_referrals: 0,
            successful_signups: 0,
            credits_earned: 0,
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
        credits_earned: ((stats?.successful as number) || 0) * 50,
        referrals: referrals.results.map((r: any) => ({
            name: r.name,
            joined_at: r.created_at,
            status: r.status,
        })),
    }
}
