/**
 * Swipe Module
 * Handles Likes, Passes, and Match Detection
 */
import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleSwipe(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env); // Actor
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const targetId = url.searchParams.get('id');
    const type = url.pathname === '/like' ? 'LIKE' : 'PASS';

    if (!targetId) return new Response("Missing target ID", { status: 400 });

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

            matchData = {
                match_id: matchId,
                is_match: true,
                chat_room_id: doId.toString()
            };
        }
    }

    return new Response(JSON.stringify({
        meta: { status: 200 },
        data: {
            swiped: true,
            match: matchData
        }
    }), { headers: { 'Content-Type': 'application/json' } });
}
