import { Env } from './index';
import { verifyAuth } from './auth';
import { z } from 'zod';
import { ValidationError, AuthenticationError, AppError } from './errors';

const ReportSchema = z.object({
    reported_id: z.string().uuid(),
    reason: z.string().min(1).max(100),
    details: z.string().max(500).optional(),
});

const BlockSchema = z.object({
    blocked_id: z.string().uuid(),
});

export async function handleReportUser(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    try {
        const body = ReportSchema.parse(await request.json());
        const { reported_id, reason, details } = body;

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
        if (e instanceof z.ZodError) {
            throw new ValidationError(e.errors[0].message);
        }
        throw e;
    }
}

export async function handleBlockUser(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    try {
        const body = BlockSchema.parse(await request.json());
        const { blocked_id } = body;

        const timestamp = Date.now();
        await env.DB.prepare(
            `INSERT OR IGNORE INTO Blocks (blocker_id, blocked_id, timestamp) VALUES (?, ?, ?)`
        ).bind(userId, blocked_id, timestamp).run();

        return new Response(JSON.stringify({ success: true, message: 'User blocked' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        throw e;
    }
}
