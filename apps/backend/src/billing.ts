/**
 * Billing Module - Revenue Architecture
 * Handles Credit Purchases and Subscriptions
 */
import { Env } from './index';
import { verifyAuth } from './auth';
import { z } from 'zod';
import { ValidationError, AuthenticationError, AppError, NotFoundError } from './errors';
import { logger } from './logger';

// Zod Schemas
const PurchaseCreditsSchema = z.object({
    package_id: z.enum(['starter', 'popular', 'premium', 'ultimate']),
    payment_token: z.string().min(1),
});

const SubscribeSchema = z.object({
    tier: z.enum(['plus', 'platinum']),
    interval: z.enum(['monthly', 'yearly']),
});

export async function handleBilling(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        // 1. Purchase Credits (POST /v2/billing/purchase-credits)
        if (path.endsWith('/purchase-credits') && request.method === 'POST') {
            const body = PurchaseCreditsSchema.parse(await request.json());
            const { package_id } = body;

            const packages: Record<string, number> = {
                'starter': 50,
                'popular': 120,
                'premium': 300,
                'ultimate': 1000
            };

            const creditsToGrant = packages[package_id];
            const timestamp = Date.now();
            const transactionId = crypto.randomUUID();

            await env.DB.batch([
                env.DB.prepare("UPDATE Users SET credits_balance = credits_balance + ? WHERE id = ?").bind(creditsToGrant, userId),
                env.DB.prepare(
                    "INSERT INTO Transactions (id, user_id, type, amount, credits_granted, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)"
                ).bind(transactionId, userId, 'credit_purchase', 0, creditsToGrant, 'COMPLETED', timestamp)
            ]);

            logger.info('credits_purchased', undefined, { userId, packageId: package_id, creditsAdded: creditsToGrant });
            return new Response(JSON.stringify({
                success: true,
                data: {
                    credits_added: creditsToGrant,
                    transaction_id: transactionId
                }
            }), { headers: jsonHeaders });
        }

        // 2. Subscribe (POST /v2/billing/subscribe)
        if (path.endsWith('/subscribe') && request.method === 'POST') {
            const body = SubscribeSchema.parse(await request.json());
            const { tier, interval } = body;

            const duration = interval === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
            const expiresAt = Date.now() + duration;

            await env.DB.prepare(
                "UPDATE Users SET subscription_tier = ?, subscription_expires_at = ? WHERE id = ?"
            ).bind(tier, expiresAt, userId).run();

            logger.info('user_subscribed', undefined, { userId, tier, interval });
            return new Response(JSON.stringify({
                success: true,
                data: {
                    tier,
                    expires_at: expiresAt
                }
            }), { headers: jsonHeaders });
        }

        // 3. User Billing Info (GET /v2/billing/info)
        if (path.endsWith('/info') && request.method === 'GET') {
            const result = await env.DB.prepare(
                "SELECT credits_balance, subscription_tier, subscription_expires_at FROM Users WHERE id = ?"
            ).bind(userId).first();

            if (!result) throw new NotFoundError('User');

            return new Response(JSON.stringify({ success: true, data: result }), {
                headers: jsonHeaders
            });
        }
    } catch (e: unknown) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        if (e instanceof AppError) throw e;
        throw new AppError('Billing operation failed', 500, 'BILLING_ERROR', e instanceof Error ? e : undefined);
    }

    throw new AppError('Route not found', 404, 'NOT_FOUND');
}

export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = env.CLOUDFLARE_API_TOKEN; // Using Cloudflare API Token as fallback or placeholder

    if (!signature) throw new AuthenticationError('Missing Stripe signature');
    if (!webhookSecret) throw new AppError('Webhook not configured', 503, 'CONFIG_ERROR');

    const body = await request.text();
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);

    if (!isValid) throw new AuthenticationError('Invalid Stripe signature');

    const event = JSON.parse(body);

    const existingEvent = await env.DB.prepare(
        'SELECT id FROM ProcessedWebhooks WHERE event_id = ?'
    ).bind(event.id).first();

    if (existingEvent) {
        return new Response(JSON.stringify({ success: true, message: 'Already processed' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

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
            default:
                logger.info('unhandled_webhook_type', undefined, { type: event.type });
        }

        await env.DB.prepare(
            'INSERT INTO ProcessedWebhooks (event_id, event_type, processed_at) VALUES (?, ?, ?)'
        ).bind(event.id, event.type, Date.now()).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: unknown) {
        logger.error('stripe_webhook_error', error instanceof Error ? error : undefined, { eventId: event.id });
        throw error;
    }
}

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
        const parts = signature.split(',').reduce((acc, part) => {
            const [key, value] = part.split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        const timestamp = parts['t'];
        const expectedSig = parts['v1'];

        if (!timestamp || !expectedSig) return false;

        const age = Date.now() / 1000 - parseInt(timestamp);
        if (age > 300) return false;

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
    } catch (_e) {
        return false;
    }
}

async function handleCheckoutComplete(env: Env, session: { client_reference_id?: string, metadata?: { credits?: string }, amount_total: number }) {
    const userId = session.client_reference_id;
    const creditsToGrant = parseInt(session.metadata?.credits || '0');

    if (userId && creditsToGrant > 0) {
        await env.DB.prepare('UPDATE Users SET credits_balance = credits_balance + ? WHERE id = ?').bind(creditsToGrant, userId).run();
        await env.DB.prepare('INSERT INTO Transactions (id, user_id, type, amount, credits_granted, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID(), userId, 'credit_purchase', session.amount_total / 100, creditsToGrant, 'COMPLETED', Date.now()).run();
    }
}

async function handleSubscriptionUpdate(env: Env, subscription: { metadata?: { user_id?: string, tier?: string }, current_period_end: number }) {
    const userId = subscription.metadata?.user_id;
    const tier = subscription.metadata?.tier || 'plus';
    const expiresAt = subscription.current_period_end * 1000;
    if (userId) {
        await env.DB.prepare('UPDATE Users SET subscription_tier = ?, subscription_expires_at = ? WHERE id = ?').bind(tier, expiresAt, userId).run();
    }
}

async function handleSubscriptionCanceled(env: Env, subscription: { metadata?: { user_id?: string } }) {
    const userId = subscription.metadata?.user_id;
    if (userId) {
        await env.DB.prepare('UPDATE Users SET subscription_tier = ?, subscription_expires_at = NULL WHERE id = ?').bind('free', userId).run();
    }
}
