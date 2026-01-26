// Profile Boost System
// Boost visibility in discovery feed

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError } from './errors';
import { logger } from './logger';

// Zod Schema
const ActivateBoostSchema = z.object({
    duration_minutes: z.number().int().min(1).max(240).default(30),
});

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
): Promise<{ success: boolean; data?: BoostStatus; error?: string }> {
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
            throw new AppError('You already have an active boost', 409, 'BOOST_ALREADY_ACTIVE');
        }

        // Activate boost
        await env.DB.prepare(
            'INSERT INTO ActiveBoosts (user_id, started_at, expires_at, views_gained) VALUES (?, ?, ?, ?)'
        )
            .bind(userId, now, expiresAt, 0)
            .run()

        logger.info('boost_activated', undefined, { userId, durationMinutes });
        return {
            success: true,
            data: {
                is_active: true,
                started_at: now,
                expires_at: expiresAt,
                views_gained: 0,
            },
        }
    } catch (error: any) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to activate boost', 500, 'BOOST_ACTIVATION_FAILED', error);
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

export async function handleBoost(request: Request, env: Env): Promise<Response> {
    const { verifyAuth } = await import('./auth');
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        const userId = await verifyAuth(request, env);
        if (!userId) throw new AuthenticationError();

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        if (path === '/v2/boost/activate' && method === 'POST') {
            let body;
            try {
                body = ActivateBoostSchema.parse(await request.json());
            } catch (error: any) {
                throw new ValidationError('Invalid request body', error);
            }
            const result = await activateBoost(env, userId, body.duration_minutes);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        if (path === '/v2/boost/status' && method === 'GET') {
            const result = await getBoostStatus(env, userId);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        return new Response(JSON.stringify({ success: false, error: 'Route not found' }), {
            status: 404,
            headers: jsonHeaders
        });
    } catch (error: any) {
        logger.error('handle_boost_error', error, { path: request.url, method: request.method });
        let status = 500;
        let message = 'Internal Server Error';
        let code = 'INTERNAL_SERVER_ERROR';

        if (error instanceof AuthenticationError) {
            status = 401;
            message = error.message;
            code = error.code;
        } else if (error instanceof ValidationError) {
            status = 400;
            message = error.message;
            code = error.code;
        } else if (error instanceof AppError) {
            status = error.status;
            message = error.message;
            code = error.code;
        }

        return new Response(JSON.stringify({ success: false, error: message, code: code }), {
            status: status,
            headers: jsonHeaders
        });
    }
}
