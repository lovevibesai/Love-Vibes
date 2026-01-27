// Rate Limiting & Anti-Spam
// Cloudflare Workers rate limiting implementation

import { Env } from './index'

interface RateLimitConfig {
    maxRequests: number
    windowSeconds: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    'swipe': { maxRequests: 100, windowSeconds: 86400 }, // 100 swipes per day
    'message': { maxRequests: 50, windowSeconds: 86400 }, // 50 messages per day (free tier)
    'signup': { maxRequests: 3, windowSeconds: 3600 }, // 3 signups per hour per IP
    'api': { maxRequests: 100, windowSeconds: 60 }, // 100 API calls per minute
}

export async function checkRateLimit(
    env: Env,
    userId: string,
    action: keyof typeof RATE_LIMITS,
    isPremium: boolean = false
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const config = RATE_LIMITS[action]

    // Premium users get unlimited swipes and messages
    if (isPremium && (action === 'swipe' || action === 'message')) {
        return { allowed: true, remaining: 999, resetAt: 0 }
    }

    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - config.windowSeconds

    try {
        // Get current count from D1
        const result = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM RateLimits WHERE user_id = ? AND action = ? AND timestamp > ?'
        )
            .bind(userId, action, windowStart)
            .first()

        const currentCount = (result?.count as number) || 0

        if (currentCount >= config.maxRequests) {
            const resetAt = windowStart + config.windowSeconds
            return { allowed: false, remaining: 0, resetAt }
        }

        // Log this action
        await env.DB.prepare(
            'INSERT INTO RateLimits (user_id, action, timestamp) VALUES (?, ?, ?)'
        )
            .bind(userId, action, now)
            .run()

        const remaining = config.maxRequests - currentCount - 1
        const resetAt = now + config.windowSeconds

        return { allowed: true, remaining, resetAt }
    } catch (error) {
        console.error('Rate limit check failed:', error)
        // Fail open - allow the request
        return { allowed: true, remaining: config.maxRequests, resetAt: now + config.windowSeconds }
    }
}

// Cleanup old rate limit entries (run periodically)
export async function cleanupRateLimits(env: Env): Promise<void> {
    const cutoff = Math.floor(Date.now() / 1000) - 86400 // 24 hours ago
    await env.DB.prepare('DELETE FROM RateLimits WHERE timestamp < ?')
        .bind(cutoff)
        .run()
}
