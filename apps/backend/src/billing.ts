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

/**
 * STRIPE WEBHOOK HANDLER
 * CRITICAL: Verifies webhook signature to prevent spoofing/replay attacks
 * 
 * Endpoint: POST /v2/billing/webhook
 * Called from index.ts BEFORE auth verification (webhooks are server-to-server)
 */
export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = (env as any).STRIPE_WEBHOOK_SECRET;

    // CRITICAL: Reject unsigned webhooks
    if (!signature) {
        console.error('SECURITY: Stripe webhook missing signature');
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!webhookSecret) {
        console.error('CRITICAL: STRIPE_WEBHOOK_SECRET not configured');
        return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const body = await request.text();

    // Verify Stripe signature (simplified - use stripe library in production)
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);

    if (!isValid) {
        console.error('SECURITY: Invalid Stripe webhook signature - possible spoofing attempt');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const event = JSON.parse(body);

    // Idempotency: Check if we've already processed this event
    const existingEvent = await env.DB.prepare(
        'SELECT id FROM ProcessedWebhooks WHERE event_id = ?'
    ).bind(event.id).first();

    if (existingEvent) {
        console.log(`Webhook ${event.id} already processed - skipping (idempotent)`);
        return new Response(JSON.stringify({ received: true, idempotent: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Process the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutComplete(env, event.data.object);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(env, event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(env, event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(env, event.data.object);
                break;
            default:
                console.log(`Unhandled webhook event type: ${event.type}`);
        }

        // Mark event as processed (prevents double-processing on retry)
        await env.DB.prepare(
            'INSERT INTO ProcessedWebhooks (event_id, event_type, processed_at) VALUES (?, ?, ?)'
        ).bind(event.id, event.type, Date.now()).run();

    } catch (error: any) {
        console.error(`Webhook processing error: ${error.message}`);
        // Return 500 to trigger Stripe retry
        return new Response(JSON.stringify({ error: 'Processing failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Verify Stripe webhook signature using HMAC-SHA256
 */
async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
        // Parse Stripe signature header: t=timestamp,v1=signature
        const parts = signature.split(',').reduce((acc, part) => {
            const [key, value] = part.split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        const timestamp = parts['t'];
        const expectedSig = parts['v1'];

        if (!timestamp || !expectedSig) return false;

        // Check timestamp (reject if > 5 minutes old)
        const age = Date.now() / 1000 - parseInt(timestamp);
        if (age > 300) {
            console.error('Stripe webhook timestamp too old - possible replay attack');
            return false;
        }

        // Compute expected signature
        const signedPayload = `${timestamp}.${payload}`;
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
        const computedSig = Array.from(new Uint8Array(signatureBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return computedSig === expectedSig;
    } catch (e) {
        console.error('Signature verification error:', e);
        return false;
    }
}

// Webhook event handlers
async function handleCheckoutComplete(env: Env, session: any) {
    const userId = session.client_reference_id;
    const creditsToGrant = parseInt(session.metadata?.credits || '0');

    if (userId && creditsToGrant > 0) {
        await env.DB.prepare(
            'UPDATE Users SET credits_balance = credits_balance + ? WHERE id = ?'
        ).bind(creditsToGrant, userId).run();

        await env.DB.prepare(
            'INSERT INTO Transactions (id, user_id, type, amount, credits_granted, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), userId, 'credit_purchase', session.amount_total / 100, creditsToGrant, 'COMPLETED', Date.now()).run();
    }
}

async function handleSubscriptionUpdate(env: Env, subscription: any) {
    const userId = subscription.metadata?.user_id;
    const tier = subscription.metadata?.tier || 'plus';
    const expiresAt = subscription.current_period_end * 1000;

    if (userId) {
        await env.DB.prepare(
            'UPDATE Users SET subscription_tier = ?, subscription_expires_at = ? WHERE id = ?'
        ).bind(tier, expiresAt, userId).run();
    }
}

async function handleSubscriptionCanceled(env: Env, subscription: any) {
    const userId = subscription.metadata?.user_id;

    if (userId) {
        await env.DB.prepare(
            'UPDATE Users SET subscription_tier = ?, subscription_expires_at = NULL WHERE id = ?'
        ).bind('free', userId).run();
    }
}

async function handlePaymentFailed(env: Env, invoice: any) {
    const userId = invoice.subscription_details?.metadata?.user_id;

    if (userId) {
        // Log payment failure for follow-up
        console.error(`Payment failed for user ${userId}`);
        // Could send notification, downgrade access, etc.
    }
}
