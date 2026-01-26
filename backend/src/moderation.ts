// Content Moderation Dashboard (Admin)
// Admin panel for reviewing flagged content and user reports

import { Env } from './index'

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
        const result: any = await env.AI.run('@cf/microsoft/distilbert-base-uncased-mnli', {
            text: text
        });

        // mnli returns label scores. "toxic" is often mapped or we check for general negative sentiment
        // For simplicity with this model, we'll look for the highest probability label
        const toxicScore = result.label === 'LABEL_1' ? result.score : 0; // Depends on model mapping

        return {
            toxic: toxicScore > 0.85,
            score: toxicScore
        };
    } catch (e) {
        return { toxic: false, score: 0 };
    }
}

// GET /admin/moderation/reports - Get all pending reports
export async function getPendingReports(env: Env, adminId: string): Promise<ModerationReport[]> {
    // Verify admin status
    const admin = await env.DB.prepare('SELECT id FROM Users WHERE id = ? AND subscription_tier = ?')
        .bind(adminId, 'admin')
        .first()

    if (!admin) {
        throw new Error('Unauthorized')
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
    // Verify admin status
    const admin = await env.DB.prepare('SELECT id FROM Users WHERE id = ? AND subscription_tier = ?')
        .bind(adminId, 'admin')
        .first()

    if (!admin) {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        const now = Math.floor(Date.now() / 1000)

        // Get report details
        const report = await env.DB.prepare('SELECT reported_id FROM Reports WHERE id = ?')
            .bind(reportId)
            .first()

        if (!report) {
            return { success: false, message: 'Report not found' }
        }

        // Update report status
        await env.DB.prepare(
            'UPDATE Reports SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?'
        )
            .bind('REVIEWED', notes, adminId, now, reportId)
            .run()

        // Take action on reported user
        if (action === 'BAN_USER') {
            await env.DB.prepare('UPDATE Users SET subscription_tier = ? WHERE id = ?')
                .bind('banned', report.reported_id)
                .run()
        } else if (action === 'WARN_USER') {
            // Log warning (could send notification)
            await env.DB.prepare(
                'INSERT INTO ModerationActions (user_id, action, reason, admin_id, timestamp) VALUES (?, ?, ?, ?, ?)'
            )
                .bind(report.reported_id, 'WARNING', notes, adminId, now)
                .run()
        }

        return { success: true, message: 'Report reviewed successfully' }
    } catch (error) {
        console.error('Report review failed:', error)
        return { success: false, message: 'Failed to review report' }
    }
}

// GET /admin/moderation/stats - Get moderation statistics
export async function getModerationStats(env: Env, adminId: string): Promise<any> {
    const admin = await env.DB.prepare('SELECT id FROM Users WHERE id = ? AND subscription_tier = ?')
        .bind(adminId, 'admin')
        .first()

    if (!admin) {
        throw new Error('Unauthorized')
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

    // Get admin ID from header
    const adminId = request.headers.get('X-Auth-Token') || url.searchParams.get('admin_id');

    if (!adminId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // GET /v2/admin/moderation/reports - Get pending reports
    if (path.endsWith('/reports') && method === 'GET') {
        try {
            const reports = await getPendingReports(env, adminId);
            return new Response(JSON.stringify({ status: 'success', reports }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // POST /v2/admin/moderation/review - Review a report
    if (path.endsWith('/review') && method === 'POST') {
        try {
            const body = await request.json() as any;
            if (!body.report_id || !body.action) {
                return new Response(JSON.stringify({ error: 'Missing report_id or action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const result = await reviewReport(env, adminId, body.report_id, body.action, body.notes || '');
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 400,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid request' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // GET /v2/admin/moderation/stats - Get moderation stats
    if (path.endsWith('/stats') && method === 'GET') {
        try {
            const stats = await getModerationStats(env, adminId);
            return new Response(JSON.stringify({ status: 'success', stats }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
