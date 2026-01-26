/**
 * Admin Module - System Metrics & Dashboard
 */
import { Env } from './index';

export async function handleAdminMetrics(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const jsonHeaders = { 'Content-Type': 'application/json' };

    // Basic Admin Check (In production, replace with more robust RBAC)
    const adminToken = request.headers.get('X-Admin-Token');
    if (!adminToken || adminToken !== env.JWT_SECRET) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: jsonHeaders
        });
    }

    try {
        // 1. User Stats
        const userStats = await env.DB.prepare(
            "SELECT COUNT(*) as total_users, " +
            "SUM(CASE WHEN last_active > ? THEN 1 ELSE 0 END) as dau, " +
            "SUM(CASE WHEN subscription_tier = 'premium' THEN 1 ELSE 0 END) as premium_users " +
            "FROM Users"
        ).bind(Math.floor(Date.now() / 1000) - 86400).first();

        // 2. Match Activity
        const matchStats = await env.DB.prepare(
            "SELECT COUNT(*) as total_matches FROM Matches WHERE created_at > ?"
        ).bind(Math.floor(Date.now() / 1000) - 86400).first();

        // 3. Error Sample (Optional, from D1 if logged there, or just return placeholder for now)
        // In a real app, you might query Analytics Engine for error frequency

        return new Response(JSON.stringify({
            success: true,
            data: {
                users: userStats,
                matches: matchStats,
                system: {
                    status: 'operational',
                    uptime: process.uptime() // If supported in environment
                }
            }
        }), { headers: jsonHeaders });

    } catch (e: any) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch metrics',
            details: e.message
        }), { status: 500, headers: jsonHeaders });
    }
}
