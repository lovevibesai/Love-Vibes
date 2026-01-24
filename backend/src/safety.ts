import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleReportUser(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    try {
        const { reported_id, reason, details } = await request.json() as any;

        if (!reported_id || !reason) {
            return new Response('Missing fields', { status: 400 });
        }

        const reportId = crypto.randomUUID();
        const timestamp = Date.now();

        await env.DB.prepare(
            `INSERT INTO Reports (id, reporter_id, reported_id, reason, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(reportId, userId, reported_id, reason, details, timestamp).run();

        // Auto-Block on Report (Standard Safety Practice)
        await env.DB.prepare(
            `INSERT OR IGNORE INTO Blocks (blocker_id, blocked_id, timestamp) VALUES (?, ?, ?)`
        ).bind(userId, reported_id, timestamp).run();

        return new Response(JSON.stringify({ success: true, message: 'Report received' }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error(e);
        return new Response('Error processing report', { status: 500 });
    }
}

export async function handleBlockUser(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    try {
        const { blocked_id } = await request.json() as any;

        if (!blocked_id) {
            return new Response('Missing fields', { status: 400 });
        }

        const timestamp = Date.now();
        await env.DB.prepare(
            `INSERT OR IGNORE INTO Blocks (blocker_id, blocked_id, timestamp) VALUES (?, ?, ?)`
        ).bind(userId, blocked_id, timestamp).run();

        return new Response(JSON.stringify({ success: true, message: 'User blocked' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response('Error blocking user', { status: 500 });
    }
}
