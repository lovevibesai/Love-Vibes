// Content Moderation Dashboard (Admin)
// Admin panel for reviewing flagged content and user reports

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, NotFoundError, AppError } from './errors';
import { logger } from './logger';

// Zod Schema
const ReviewReportSchema = z.object({
    report_id: z.string().uuid(),
    action: z.enum(['DISMISS', 'BAN_USER', 'WARN_USER']),
    notes: z.string().max(1000).default(''),
});

export interface ModerationReport {
    id: string
    reporter_id: string
    reported_id: string
    reported_name: string
    reason: string
    details: string
    timestamp: number
    status: 'PENDING' | 'REVIEWED' | 'DISMISSED'
    admin_notes?: string
    reviewed_by?: string
    reviewed_at?: number
    auto_flagged?: boolean
    toxic_score?: number
}

// AI Content Moderation Helper
export async function autoModerateContent(env: Env, text: string): Promise<{ toxic: boolean; score: number }> {
    try {
        const result = await env.AI.run('@cf/microsoft/distilbert-base-uncased-mnli' as unknown as Parameters<Ai['run']>[0], {
            text: text
        }) as { label: string; score: number };

        const toxicScore = result.label === 'LABEL_1' ? result.score : 0;

        return {
            toxic: toxicScore > 0.85,
            score: toxicScore
        };
    } catch (_e) {
        return { toxic: false, score: 0 };
    }
}

// GET /admin/moderation/reports - Get all pending reports
export async function getPendingReports(env: Env, adminId: string): Promise<ModerationReport[]> {
    const admin = await env.DB.prepare('SELECT id FROM Users WHERE id = ? AND subscription_tier = ?')
        .bind(adminId, 'admin')
        .first()

    if (!admin) {
        throw new AuthenticationError('Admin access required');
    }

    const results = await env.DB.prepare(
        `SELECT 
      r.id,
      r.reporter_id,
      r.reported_id,
      u.name as reported_name,
      r.reason,
      r.details,
      r.timestamp,
      r.status,
      r.admin_notes,
      r.reviewed_by,
      r.reviewed_at
    FROM Reports r
    LEFT JOIN Users u ON r.reported_id = u.id
    WHERE r.status = 'PENDING'
    ORDER BY r.timestamp DESC
    LIMIT 100`
    ).all()

    return results.results as unknown as ModerationReport[]
}

// POST /admin/moderation/review - Review a report
export async function reviewReport(
    env: Env,
    adminId: string,
    reportId: string,
    action: 'DISMISS' | 'BAN_USER' | 'WARN_USER',
    notes: string
): Promise<{ success: boolean; message: string }> {
    const admin = await env.DB.prepare('SELECT id FROM Users WHERE id = ? AND subscription_tier = ?')
        .bind(adminId, 'admin')
        .first()

    if (!admin) {
        throw new AuthenticationError('Admin access required');
    }

    try {
        const now = Math.floor(Date.now() / 1000)

        const report = await env.DB.prepare('SELECT reported_id FROM Reports WHERE id = ?')
            .bind(reportId)
            .first()

        if (!report) {
            throw new NotFoundError('Report');
        }

        await env.DB.prepare(
            'UPDATE Reports SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?'
        )
            .bind('REVIEWED', notes, adminId, now, reportId)
            .run()

        if (action === 'BAN_USER') {
            await env.DB.prepare('UPDATE Users SET subscription_tier = ? WHERE id = ?')
                .bind('banned', report.reported_id)
                .run()
        } else if (action === 'WARN_USER') {
            await env.DB.prepare(
                'INSERT INTO ModerationActions (user_id, action, reason, admin_id, timestamp) VALUES (?, ?, ?, ?, ?)'
            )
                .bind(report.reported_id, 'WARNING', notes, adminId, now)
                .run()
        }

        logger.info('report_reviewed', undefined, { adminId, reportId, action });
        return { success: true, message: 'Report reviewed successfully' }
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;
        throw new AppError('Report review failed', 500, 'REVIEW_FAILED', error instanceof Error ? error : undefined);
    }
}

// GET /admin/moderation/stats - Get moderation statistics
export async function getModerationStats(env: Env, adminId: string): Promise<Record<string, unknown> | null> {
    const admin = await env.DB.prepare('SELECT id FROM Users WHERE id = ? AND subscription_tier = ?')
        .bind(adminId, 'admin')
        .first()

    if (!admin) {
        throw new AuthenticationError('Admin access required');
    }

    const stats = await env.DB.prepare(
        `SELECT 
      COUNT(*) as total_reports,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'REVIEWED' THEN 1 ELSE 0 END) as reviewed,
      SUM(CASE WHEN status = 'DISMISSED' THEN 1 ELSE 0 END) as dismissed
    FROM Reports`
    ).first()

    return stats
}

// HTTP Handler for moderation routes
export async function handleModeration(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    const adminId = request.headers.get('X-Auth-Token') || url.searchParams.get('admin_id');

    if (!adminId) throw new AuthenticationError();

    if (path.endsWith('/reports') && method === 'GET') {
        const reports = await getPendingReports(env, adminId);
        return new Response(JSON.stringify({ success: true, data: reports }), {
            headers: jsonHeaders
        });
    }

    if (path.endsWith('/review') && method === 'POST') {
        const body = ReviewReportSchema.parse(await request.json());
        const result = await reviewReport(env, adminId, body.report_id, body.action, body.notes);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    if (path.endsWith('/stats') && method === 'GET') {
        const stats = await getModerationStats(env, adminId);
        return new Response(JSON.stringify({ success: true, data: stats }), {
            headers: jsonHeaders
        });
    }

    throw new AppError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}
