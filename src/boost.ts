// Profile Boost System
// Boost visibility in discovery feed

import { Env } from './index'

interface BoostStatus {
    is_active: boolean
    started_at?: number
    expires_at?: number
    views_gained?: number
}

export async function activateBoost(
    env: Env,
    userId: string,
    durationMinutes: number = 30
): Promise<{ success: boolean; message: string; boost?: BoostStatus }> {
    try {
        const now = Math.floor(Date.now() / 1000)
        const expiresAt = now + (durationMinutes * 60)

        // Check if user already has active boost
        const existing = await env.DB.prepare(
            'SELECT * FROM ActiveBoosts WHERE user_id = ? AND expires_at > ?'
        )
            .bind(userId, now)
            .first()

        if (existing) {
            return { success: false, message: 'You already have an active boost' }
        }

        // Activate boost
        await env.DB.prepare(
            'INSERT INTO ActiveBoosts (user_id, started_at, expires_at, views_gained) VALUES (?, ?, ?, ?)'
        )
            .bind(userId, now, expiresAt, 0)
            .run()

        return {
            success: true,
            message: `Boost activated for ${durationMinutes} minutes!`,
            boost: {
                is_active: true,
                started_at: now,
                expires_at: expiresAt,
                views_gained: 0,
            },
        }
    } catch (error) {
        console.error('Boost activation failed:', error)
        return { success: false, message: 'Failed to activate boost' }
    }
}

export async function getBoostStatus(env: Env, userId: string): Promise<BoostStatus> {
    const now = Math.floor(Date.now() / 1000)

    const boost = await env.DB.prepare(
        'SELECT * FROM ActiveBoosts WHERE user_id = ? AND expires_at > ?'
    )
        .bind(userId, now)
        .first()

    if (!boost) {
        return { is_active: false }
    }

    return {
        is_active: true,
        started_at: boost.started_at as number,
        expires_at: boost.expires_at as number,
        views_gained: boost.views_gained as number,
    }
}

// Get best time to boost (peak hours)
export function getBestBoostTime(): { hour: number; reason: string } {
    const now = new Date()
    const hour = now.getHours()

    // Peak hours: 7-9 PM on weekdays, 12-2 PM and 7-10 PM on weekends
    const isWeekend = now.getDay() === 0 || now.getDay() === 6

    if (isWeekend) {
        if (hour >= 12 && hour <= 14) {
            return { hour: 12, reason: 'Lunch time - high activity!' }
        } else if (hour >= 19 && hour <= 22) {
            return { hour: 19, reason: 'Evening - peak activity!' }
        }
    } else {
        if (hour >= 19 && hour <= 21) {
            return { hour: 19, reason: 'Evening - peak activity!' }
        }
    }

    return { hour: 19, reason: 'Evening hours (7-9 PM) have the most activity' }
}
