// Undo/Rewind Feature
// Allow users to undo their last swipe

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError } from './errors';
import { logger } from './logger';
import { verifyAuth } from './auth';

// Zod Schema
const RewindSchema = z.object({
    is_premium: z.boolean().default(false),
});

interface SwipeHistory {
    actor_id: string
    target_id: string
    type: string
    timestamp: number
}

// Store last 10 swipes in memory per user session
const swipeHistory = new Map<string, SwipeHistory[]>()

export function recordSwipe(userId: string, targetId: string, type: string): void {
    if (!swipeHistory.has(userId)) {
        swipeHistory.set(userId, [])
    }

    const history = swipeHistory.get(userId)!
    history.unshift({
        actor_id: userId,
        target_id: targetId,
        type,
        timestamp: Date.now(),
    })

    // Keep only last 10 swipes
    if (history.length > 10) {
        history.pop()
    }
}

export async function undoLastSwipe(
    env: Env,
    userId: string,
    isPremium: boolean
): Promise<{ success: boolean; message: string; profile?: any }> {
    const history = swipeHistory.get(userId)

    if (!history || history.length === 0) {
        throw new AppError('No swipes to undo', 400, 'NO_SWIPES_TO_UNDO');
    }

    // Check rewind limit for free users
    if (!isPremium) {
        const today = new Date().toDateString()

        const rewindCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM RewindHistory WHERE user_id = ? AND date = ?'
        )
            .bind(userId, today)
            .first()

        if ((rewindCount?.count as number) >= 1) {
            throw new AppError('Free users get 1 rewind per day. Upgrade for unlimited!', 402, 'REWIND_LIMIT_REACHED');
        }
    }

    try {
        const lastSwipe = history.shift()!

        // Delete the swipe from database
        await env.DB.prepare('DELETE FROM Swipes WHERE actor_id = ? AND target_id = ?')
            .bind(lastSwipe.actor_id, lastSwipe.target_id)
            .run()

        // If it was a match, delete the match too
        if (lastSwipe.type === 'LIKE') {
            await env.DB.prepare(
                'DELETE FROM Matches WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)'
            )
                .bind(userId, lastSwipe.target_id, lastSwipe.target_id, userId)
                .run()
        }

        // Log rewind for free users
        if (!isPremium) {
            const today = new Date().toDateString()
            await env.DB.prepare(
                'INSERT INTO RewindHistory (user_id, date, timestamp) VALUES (?, ?, ?)'
            )
                .bind(userId, today, Math.floor(Date.now() / 1000))
                .run()
        }

        // Get the profile to show again
        const profile = await env.DB.prepare('SELECT * FROM Users WHERE id = ?')
            .bind(lastSwipe.target_id)
            .first()

        logger.info('swipe_undone', undefined, { userId, targetId: lastSwipe.target_id });
        return { success: true, message: 'Swipe undone', profile }
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to undo swipe', 500, 'UNDO_FAILED', error);
    }
}

// HTTP Handler for rewind routes
export async function handleRewind(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    if (method === 'POST') {
        const body = RewindSchema.parse(await request.json());
        const result = await undoLastSwipe(env, userId, body.is_premium);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    throw new AppError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}
