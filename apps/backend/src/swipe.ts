/**
 * Swipe Module
 * Handles Likes, Passes, and Match Detection
 */
import { Env } from './index';
import { verifyAuth } from './auth';
import { z } from 'zod';
import { ValidationError, AuthenticationError, AppError } from './errors';
import { notifyNewMatch } from './notifications';

const SwipeSchema = z.object({
    id: z.string().uuid(),
});

export async function handleSwipe(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env); // Actor
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const targetId = url.searchParams.get('id');
    const type = url.pathname === '/like' ? 'LIKE' : 'PASS';

    // Validate using Zod (even if from query params)
    const validation = SwipeSchema.safeParse({ id: targetId });
    if (!validation.success) {
        throw new ValidationError("Missing or invalid target ID");
    }

    // 1. Record the Swipe
    const timestamp = Date.now();
    await env.DB.prepare(
        "INSERT OR REPLACE INTO Swipes (actor_id, target_id, type, timestamp) VALUES (?, ?, ?, ?)"
    ).bind(userId, targetId, type, timestamp).run();

    let matchData = null;

    // 2. If LIKE, check for Mutual Match
    if (type === 'LIKE') {
        const { results } = await env.DB.prepare(
            "SELECT * FROM Swipes WHERE actor_id = ? AND target_id = ? AND type = 'LIKE'"
        ).bind(targetId, userId).all();

        if (results.length > 0) {
            // ITS A MATCH!
            const matchId = crypto.randomUUID();

            // Create Match Record
            await env.DB.prepare(
                "INSERT INTO Matches (id, user_a_id, user_b_id, created_at) VALUES (?, ?, ?, ?)"
            ).bind(matchId, userId, targetId, timestamp).run();

            // Create Chat Room Durable Object ID
            const doId = env.CHAT_ROOM.newUniqueId();
            await env.DB.prepare(
                "UPDATE Matches SET chat_room_do_id = ? WHERE id = ?"
            ).bind(doId.toString(), matchId).run();

            // Get user names for notification
            const [currentUser, targetUser] = await Promise.all([
                env.DB.prepare("SELECT name FROM Users WHERE id = ?").bind(userId).first(),
                env.DB.prepare("SELECT name FROM Users WHERE id = ?").bind(targetId).first()
            ]);

            // Send push notifications to both users
            await Promise.all([
                notifyNewMatch(env, userId, (targetUser?.name as string) || 'Someone'),
                notifyNewMatch(env, targetId as string, (currentUser?.name as string) || 'Someone')
            ]);

            matchData = {
                match_id: matchId,
                is_match: true,
                chat_room_id: doId.toString()
            };
        }
    }

    return new Response(JSON.stringify({
        success: true,
        data: {
            swiped: true,
            match: matchData
        }
    }), { headers: { 'Content-Type': 'application/json' } });
}
