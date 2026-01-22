/**
 * Love Vibes Backend - Main Entry Point
 */

import { handleAuth } from './auth';
import { handleFeed } from './feed';
import { handleSwipe } from './swipe';
import { handleUserUpdate } from './user';
import { handleGifting } from './gifting';
import { handleBilling } from './billing';
import { handleChatAI } from './chat';
import { handleReportUser, handleBlockUser } from './safety';
import { handleMedia } from './media';
import { getPrompts, saveUserPrompts, getUserPrompts } from './prompts';
import { getReferralStats, unlockScenario } from './referrals';

export { ChatRoom, MatchLobby } from './durable_objects';

export interface Env {
    DB: D1Database;
    GEO_KV: KVNamespace;
    MEDIA_BUCKET: R2Bucket;
    CHAT_ROOM: DurableObjectNamespace;
    MATCH_LOBBY: DurableObjectNamespace;
    LV_AI: AnalyticsEngineDataset;
    AI: any; // Cloudflare Workers AI
    CLOUDFLARE_ACCOUNT_ID?: string;
    CLOUDFLARE_API_TOKEN?: string;
    JWT_SECRET?: string;
    RP_ID?: string;
}

/**
 * Structured Analytics Helper
 * Maps JSON data to Analytics Engine blobs/doubles for cost efficiency
 */
export function trackEvent(env: Env, eventName: string, data: Record<string, any>) {
    try {
        const blobs: string[] = [eventName]; // index 0 is always event name
        const doubles: number[] = [];

        // Example mapping: 
        // blobs: [event_name, user_id, device_type]
        // doubles: [timestamp, value/amount]

        if (data.userId) blobs.push(data.userId);
        if (data.type) blobs.push(data.type);

        doubles.push(Date.now());
        if (data.amount) doubles.push(data.amount);

        void (env.LV_AI as any).writeData({ blobs, doubles });
    } catch (e) {
        console.error("Analytics Error:", e);
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token, CF-Turnstile-Response',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            const response = await handleRequest(request, env);

            // Clone response to add headers
            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders
            });

        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    },
};

async function handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. Auth Routes
    if (path.startsWith('/v2/auth')) {
        return await handleAuth(request, env);
    }

    // 2. Core Feed (Recommendation Engine)
    if (path.startsWith('/v2/recs/core')) {
        return await handleFeed(request, env);
    }

    // 3. Billing & Monetization
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
        return new Response(JSON.stringify(prompts), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    if (path === '/v2/user/prompts' && method === 'POST') {
        const body = await request.json() as any;
        const result = await saveUserPrompts(env, body.user_id, body.prompts);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    if (path.startsWith('/v2/user/') && path.endsWith('/prompts') && method === 'GET') {
        const userId = path.split('/')[3];
        const prompts = await getUserPrompts(env, userId);
        return new Response(JSON.stringify(prompts), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 11. Referral System (The Resonance Circle)
    if (path === '/v2/referrals/stats' && method === 'GET') {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        if (!userId) return new Response('Missing userId', { status: 400 });

        const stats = await getReferralStats(env, userId);
        return new Response(JSON.stringify(stats), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    if (path === '/v2/referrals/unlock' && method === 'POST') {
        const body = await request.json() as any; // { userId, scenarioType }
        if (!body.userId || !body.scenarioType) return new Response('Missing params', { status: 400 });

        const result = await unlockScenario(env, body.userId, body.scenarioType);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
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
