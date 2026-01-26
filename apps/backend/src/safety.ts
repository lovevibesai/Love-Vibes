import { Env } from './index';
import { verifyAuth } from './auth';
import { z } from 'zod';
import { ValidationError, AuthenticationError, AppError } from './errors';
import { logger } from './logger';

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

    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        const body = ReportSchema.parse(await request.json());
        const { reported_id, reason, details } = body;

        const reportId = crypto.randomUUID();
        const timestamp = Math.floor(Date.now() / 1000);

        await env.DB.prepare(
            `INSERT INTO Reports (id, reporter_id, reported_id, reason, details, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(reportId, userId, reported_id, reason, details, timestamp, 'PENDING').run();

        // Auto-Block on Report (Standard Safety Practice)
        await env.DB.prepare(
            `INSERT OR IGNORE INTO Blocks (blocker_id, blocked_id, timestamp) VALUES (?, ?, ?)`
        ).bind(userId, reported_id, timestamp).run();

        logger.info('user_reported', undefined, { userId, reportedId: reported_id, reason });

        return new Response(JSON.stringify({ success: true, data: { message: 'Report received' } }), {
            headers: jsonHeaders
        });

    } catch (e: any) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        throw new AppError('Report failed', 500, 'REPORT_ERROR', e);
    }
}

export async function handleBlockUser(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        const body = BlockSchema.parse(await request.json());
        const { blocked_id } = body;

        const timestamp = Math.floor(Date.now() / 1000);
        await env.DB.prepare(
            `INSERT OR IGNORE INTO Blocks (blocker_id, blocked_id, timestamp) VALUES (?, ?, ?)`
        ).bind(userId, blocked_id, timestamp).run();

        logger.info('user_blocked', undefined, { userId, blockedId: blocked_id });

        return new Response(JSON.stringify({ success: true, data: { message: 'User blocked' } }), {
            headers: jsonHeaders
        });
    } catch (e: any) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        throw new AppError('Block failed', 500, 'BLOCK_ERROR', e);
    }
}
