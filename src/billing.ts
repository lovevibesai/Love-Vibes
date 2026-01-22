/**
 * Billing Module - Revenue Architecture
 * Handles Credit Purchases and Subscriptions
 */
import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleBilling(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Purchase Credits (POST /v2/billing/purchase-credits)
    if (path === '/v2/billing/purchase-credits' && request.method === 'POST') {
        const body: any = await request.json();
        const { package_id, payment_token } = body;

        // In production, validate payment_token with Stripe/Apple/Google
        // For this blueprint, we simulate high-integrity success

        const packages: Record<string, number> = {
            'starter': 50,
            'popular': 120,
            'premium': 300,
            'ultimate': 1000
        };

        const creditsToGrant = packages[package_id] || 0;
        if (creditsToGrant === 0) return new Response("Invalid package", { status: 400 });

        const timestamp = Date.now();
        const transactionId = crypto.randomUUID();

        await env.DB.batch([
            env.DB.prepare("UPDATE Users SET credits_balance = credits_balance + ? WHERE id = ?").bind(creditsToGrant, userId),
            env.DB.prepare(
                "INSERT INTO Transactions (id, user_id, type, amount, credits_granted, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(transactionId, userId, 'credit_purchase', 0, creditsToGrant, 'COMPLETED', timestamp)
        ]);

        return new Response(JSON.stringify({
            status: "success",
            credits_added: creditsToGrant,
            transaction_id: transactionId
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Subscribe (POST /v2/billing/subscribe)
    if (path === '/v2/billing/subscribe' && request.method === 'POST') {
        const body: any = await request.json();
        const { tier, interval } = body; // tier: 'plus', 'platinum' | interval: 'monthly', 'yearly'

        if (!['plus', 'platinum'].includes(tier)) return new Response("Invalid tier", { status: 400 });

        const duration = interval === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
        const expiresAt = Date.now() + duration;

        await env.DB.prepare(
            "UPDATE Users SET subscription_tier = ?, subscription_expires_at = ? WHERE id = ?"
        ).bind(tier, expiresAt, userId).run();

        return new Response(JSON.stringify({
            status: "success",
            tier,
            expires_at: expiresAt
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 3. User Billing Info (GET /v2/billing/info)
    if (path === '/v2/billing/info' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
            "SELECT credits_balance, subscription_tier, subscription_expires_at FROM Users WHERE id = ?"
        ).bind(userId).all();

        return new Response(JSON.stringify(results[0]), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response("Not Found", { status: 404 });
}
