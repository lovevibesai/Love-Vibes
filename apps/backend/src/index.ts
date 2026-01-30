/**
 * Love Vibes Backend - Main Entry Point
 */

import { handleAuth } from './auth';
import { handleFeed } from './feed';
import { handleSwipe } from './swipe';
import { handleUserUpdate } from './user';
import { handleGifting } from './gifting';
import { handleBilling, handleStripeWebhook } from './billing';
import { handleChatAI } from './chat';
import { handleReportUser, handleBlockUser } from './safety';
import { handleMedia } from './media';
import { getPrompts, saveUserPrompts, getUserPrompts } from './prompts';
import { getReferralStats, unlockScenario } from './referrals';
import { handleVibeWindows } from './vibe-windows';
import { handleChemistry } from './chemistry';
import { handleVoiceMatching } from './voice-matching';
import { handleProximity } from './proximity';
import { handleBoost } from './boost';
import { handleMutualFriends } from './mutual-friends';
import { handleNotifications } from './notifications';
import { handleRewind } from './rewind';
import { handleSuccessStories } from './success-stories';
import { handleRecovery } from './recovery';
import { handleModeration } from './moderation';
import { handleAdminMetrics } from './admin';
import { logger } from './logger';
import { handleApiError, AppError, ValidationError } from './errors';

export { ChatRoom, MatchLobby } from './durable_objects';

export interface Env {
    DB: D1Database;
    GEO_KV: KVNamespace;
    MEDIA_BUCKET: R2Bucket;
    CHAT_ROOM: DurableObjectNamespace;
    MATCH_LOBBY: DurableObjectNamespace;
    LV_AI: AnalyticsEngineDataset;
    AI: Ai; // Cloudflare Workers AI
    CLOUDFLARE_ACCOUNT_ID?: string;
    CLOUDFLARE_API_TOKEN?: string;
    JWT_SECRET?: string;
    RP_ID?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
}

/**
 * Structured Analytics Helper
 * Maps JSON data to Analytics Engine blobs/doubles for cost efficiency
 */
export function trackEvent(env: Env, eventName: string, data: Record<string, unknown>) {
    try {
        const blobs: string[] = [eventName]; // index 0 is always event name
        const doubles: number[] = [];

        // Example mapping: 
        // blobs: [event_name, user_id, device_type]
        // doubles: [timestamp, value/amount]

        if (data.userId) blobs.push(String(data.userId));
        if (data.type) blobs.push(String(data.type));

        doubles.push(Date.now());
        if (typeof data.amount === 'number') doubles.push(data.amount);

        // Use type assertion to avoid missing property error in some worker-types versions
        (env.LV_AI as any).writeData({ blobs, doubles });
    } catch (e) {
        console.error("Analytics Error:", e);
    }
}

export default {
    async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const startTime = Date.now();
        const requestId = crypto.randomUUID();

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token, CF-Turnstile-Response',
            'Access-Control-Max-Age': '86400',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            logger.info('request_start', undefined, {
                requestId,
                method: request.method,
                path: url.pathname,
                ip: request.headers.get('cf-connecting-ip')
            });

            const response = await handleRequest(request, env);

            // Create a new response with the same body and status, but with CORS headers
            const newResponse = new Response(response.body, response);
            Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));

            const duration = Date.now() - startTime;
            logger.info('request_end', undefined, {
                requestId,
                status: response.status,
                duration
            });

            return newResponse;
        } catch (e: unknown) {
            const duration = Date.now() - startTime;
            logger.error('request_error', e, {
                requestId,
                path: url.pathname,
                duration
            });

            const response = handleApiError(e);

            // Add CORS to error response too
            const newResponse = new Response(response.body, response);
            Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
            return newResponse;
        }
    },
};

/**
 * CRITICAL: Verify all required secrets are present
 * Call this at the start of auth-related operations
 */
function verifySecrets(env: Env): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    if (!env.JWT_SECRET) missing.push('JWT_SECRET');
    if (!env.DB) missing.push('DB (D1 Database)');
    if (!env.MEDIA_BUCKET) missing.push('MEDIA_BUCKET (R2)');
    if (!env.CHAT_ROOM) missing.push('CHAT_ROOM (Durable Object)');
    
    // Optional but recommended for full functionality
    if (!env.CLOUDFLARE_API_TOKEN) missing.push('CLOUDFLARE_API_TOKEN (Turnstile/Stream)');
    // if (!env.RESEND_API_KEY) missing.push('RESEND_API_KEY (Email)'); // Made optional to prevent startup crash if Stripe key is used

    return { valid: missing.length === 0, missing };
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    // HEALTH CHECK ENDPOINT - Critical for monitoring
    if (path === '/health' || path === '/v2/health') {
        const secrets = verifySecrets(env);

        // Test database read/write separately
        let dbRead = 'ok';
        let dbWrite = 'ok';

        if (env.DB) {
            try {
                await env.DB.prepare('SELECT 1').first();
            } catch (_e) {
                dbRead = 'error';
            }

            try {
                // We should have a dedicated HealthCheck table for this
                await env.DB.prepare(
                    'INSERT OR REPLACE INTO HealthCheck (id, timestamp) VALUES (1, ?)'
                ).bind(Date.now()).run();
            } catch (_e) {
                dbWrite = 'error';
            }
        } else {
            dbRead = 'missing';
            dbWrite = 'missing';
        }

        // Check external reachability
        let googleAuth = 'untested';
        try {
            // Use GET instead of HEAD, and expect 400 (Bad Request) which means we reached the service
            const googleRes = await fetch('https://oauth2.googleapis.com/tokeninfo', {
                method: 'GET',
                headers: { 'User-Agent': 'LoveVibes/1.0 HealthCheck' }
            });
            googleAuth = googleRes.ok || googleRes.status === 400 ? 'ok' : 'error';
        } catch (_e) {
            console.error('Health Check External Error:', _e);
            googleAuth = 'error';
        }

        const allHealthy = secrets.valid && dbRead === 'ok' && googleAuth === 'ok';
        const status = allHealthy ? 'healthy' : 'degraded';

        return new Response(JSON.stringify({
            success: true,
            status,
            timestamp: new Date().toISOString(),
            version: '1.1.0',
            checks: {
                secrets: secrets.valid ? 'ok' : `missing: ${secrets.missing.join(', ')}`,
                database: {
                    read: dbRead,
                    write: dbWrite
                },
                storage: env.MEDIA_BUCKET ? 'ok' : 'missing',
                durableObjects: env.CHAT_ROOM ? 'ok' : 'missing',
                external: {
                    googleAuth
                }
            }
        }), {
            status: allHealthy ? 200 : 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 1. Auth Routes
    if (path.startsWith('/v2/auth')) {
        // Verify critical secrets before auth operations
        const secrets = verifySecrets(env);
        if (!secrets.valid) {
            logger.error('config_error', 'Missing secrets', { missing: secrets.missing });
            throw new AppError('Service configuration error', 503, 'CONFIG_ERROR');
        }
        return await handleAuth(request, env);
    }

    // 2. Core Feed (Recommendation Engine)
    if (path.startsWith('/v2/recs/core')) {
        return await handleFeed(request, env);
    }

    // 3. Stripe Webhook (NO AUTH - server-to-server, signature verified internally)
    if (path === '/v2/billing/webhook' && method === 'POST') {
        return await handleStripeWebhook(request, env);
    }

    // 4. Billing & Monetization
    if (path.startsWith('/v2/billing')) {
        return await handleBilling(request, env);
    }

    // 4. User Actions (Swipes)
    if (path === '/like' || path === '/pass') {
        return await handleSwipe(request, env);
    }

    // 5. User Updates (Location Ping, Profile)
    if (path.startsWith('/user')) {
        return await handleUserUpdate(request, env);
    }

    // 6. Love Vibes Specific (Gifting)
    if (path.startsWith('/v2/gift')) {
        return await handleGifting(request, env);
    }

    // 7. Chat AI (Icebreakers)
    if (path.startsWith('/v2/chat')) {
        return await handleChatAI(request, env);
    }

    // 8. Safety & Trust
    if (path === '/v2/safety/report' && method === 'POST') {
        return await handleReportUser(request, env);
    }
    if (path === '/v2/safety/block' && method === 'POST') {
        return await handleBlockUser(request, env);
    }

    // 9. Media Uploads (R2)
    if (path.startsWith('/v2/media')) {
        return await handleMedia(request, env);
    }

    // 10. Profile Prompts
    if (path === '/v2/prompts' && method === 'GET') {
        const prompts = await getPrompts(env);
        return new Response(JSON.stringify({ success: true, data: prompts }), {
            headers: jsonHeaders
        });
    }
    if (path === '/v2/user/prompts' && method === 'POST') {
        const body = await request.json() as { user_id: string; prompts: any[] };
        const result = await saveUserPrompts(env, body.user_id, body.prompts);
        return new Response(JSON.stringify({ success: true, data: result }), {
            headers: jsonHeaders
        });
    }
    if (path.startsWith('/v2/user/') && path.endsWith('/prompts') && method === 'GET') {
        const userId = path.split('/')[3];
        const prompts = await getUserPrompts(env, userId);
        return new Response(JSON.stringify({ success: true, data: prompts }), {
            headers: jsonHeaders
        });
    }

    // 11. Referral System (The Resonance Circle)
    if (path === '/v2/referrals/stats' && method === 'GET') {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        if (!userId) throw new ValidationError('Missing userId');

        const stats = await getReferralStats(env, userId);
        return new Response(JSON.stringify({ success: true, data: stats }), {
            headers: jsonHeaders
        });
    }
    if (path === '/v2/referrals/unlock' && method === 'POST') {
        const body = await request.json() as { userId: string; scenarioType: string };
        if (!body.userId || !body.scenarioType) throw new ValidationError('Missing userId or scenarioType');

        const result = await unlockScenario(env, body.userId, body.scenarioType as "intimate" | "mystical");
        return new Response(JSON.stringify({ success: true, data: result }), {
            headers: jsonHeaders
        });
    }

    // 12. Vibe Windows
    if (path.startsWith('/v2/vibe-windows')) {
        return await handleVibeWindows(request, env);
    }

    // 13. Chemistry Test
    if (path.startsWith('/v2/chemistry')) {
        return await handleChemistry(request, env);
    }

    // 14. Voice Matching
    if (path.startsWith('/v2/voice')) {
        return await handleVoiceMatching(request, env);
    }

    // 15. Proximity Alerts
    if (path.startsWith('/v2/proximity')) {
        return await handleProximity(request, env);
    }

    // 16. Profile Boost
    if (path.startsWith('/v2/boost')) {
        return await handleBoost(request, env);
    }

    // 17. Mutual Friends & Social
    if (path.startsWith('/v2/social')) {
        return await handleMutualFriends(request, env);
    }

    // 18. Push Notifications
    if (path.startsWith('/v2/notifications')) {
        return await handleNotifications(request, env);
    }

    // 19. Rewind Feature
    if (path.startsWith('/v2/rewind')) {
        return await handleRewind(request, env);
    }

    // 20. Success Stories
    if (path.startsWith('/v2/success-stories')) {
        return await handleSuccessStories(request, env);
    }

    // 21. Account Recovery
    if (path.startsWith('/v2/recovery')) {
        return await handleRecovery(request, env);
    }

    // 22. Admin Moderation
    if (path.startsWith('/v2/admin/moderation')) {
        return await handleModeration(request, env);
    }

    // 23. Admin Metrics
    if (path === '/v2/admin/metrics') {
        return await handleAdminMetrics(request, env);
    }

    // 8. Durable Object Routes (Chat / WebSocket)
    if (path.startsWith('/ws/chat')) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }
        const matchId = url.searchParams.get('match_id');
        if (!matchId) return new Response("Missing match_id", { status: 400 });

        const id = env.CHAT_ROOM.idFromName(matchId);
        const stub = env.CHAT_ROOM.get(id);
        return stub.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
}
