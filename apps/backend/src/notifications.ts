// Push Notifications Infrastructure
// Web Push API integration for re-engagement

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError } from './errors';
import { logger } from './logger';
import { verifyAuth } from './auth';

// Zod Schema
const PushSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
    }),
});

export interface PushSubscriptionResponse {
    user_id: string
    endpoint: string
    p256dh: string
    auth: string
    created_at: number
}

// POST /api/notifications/subscribe - Save push subscription
export async function subscribeToPush(
    env: Env,
    userId: string,
    subscriptionRaw: any
): Promise<{ success: boolean; message: string }> {
    try {
        const subscription = PushSubscriptionSchema.parse(subscriptionRaw);
        const now = Math.floor(Date.now() / 1000)

        // Delete old subscriptions for this user
        await env.DB.prepare('DELETE FROM PushSubscriptions WHERE user_id = ?')
            .bind(userId)
            .run()

        // Save new subscription
        await env.DB.prepare(
            'INSERT INTO PushSubscriptions (user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, now)
            .run()

        logger.info('push_subscribed', undefined, { userId, endpoint: subscription.endpoint });
        return { success: true, message: 'Subscribed to push notifications' }
    } catch (error: any) {
        if (error instanceof z.ZodError) throw new ValidationError(error.errors[0].message);
        throw new AppError('Failed to subscribe to push', 500, 'SUBSCRIBE_ERROR', error);
    }
}

// Send push notification to user
export async function sendPushNotification(
    env: Env,
    userId: string,
    notification: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: any
    }
): Promise<{ success: boolean }> {
    try {
        const sub = await env.DB.prepare(
            'SELECT endpoint, p256dh, auth FROM PushSubscriptions WHERE user_id = ?'
        )
            .bind(userId)
            .first()

        if (!sub) return { success: false }

        // Real Delivery would require VAPID signing using web-crypto
        // This is ready to be hooked into a Cloudflare Worker service for Web Push
        // For now, we record the intent and trigger the internal logger
        logger.info('push_notification_dispatched', undefined, {
            userId,
            endpoint: sub.endpoint,
            title: notification.title
        });

        return { success: true }
    } catch (error: any) {
        logger.error('push_failed', error, { userId });
        return { success: false }
    }
}

// Notification triggers
export async function notifyNewMatch(env: Env, userId: string, matchName: string): Promise<void> {
    await sendPushNotification(env, userId, {
        title: '💕 New Match!',
        body: `You matched with ${matchName}!`,
        data: { type: 'match', screen: 'matches' },
    })
}

export async function notifyNewMessage(
    env: Env,
    userId: string,
    senderName: string,
    message: string
): Promise<void> {
    await sendPushNotification(env, userId, {
        title: `💬 ${senderName}`,
        body: message.substring(0, 100),
        data: { type: 'message', screen: 'chat' },
    })
}

export async function notifyProfileView(env: Env, userId: string): Promise<void> {
    await sendPushNotification(env, userId, {
        title: '👀 Someone viewed your profile',
        body: 'See who checked you out!',
        data: { type: 'view', screen: 'profile' },
    })
}

export async function handleNotifications(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        if (path === '/v2/notifications/subscribe' && method === 'POST') {
            const body = await request.json() as any;
            const result = await subscribeToPush(env, userId, body.subscription);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }
    } catch (e: any) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        throw e;
    }

    throw new AppError('Route not found', 404, 'NOT_FOUND');
}
