// Push Notifications Infrastructure
// Web Push API integration for re-engagement

import { Env } from './index'

export interface PushSubscription {
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
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<{ success: boolean; message: string }> {
    try {
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

        return { success: true, message: 'Subscribed to push notifications' }
    } catch (error) {
        console.error('Push subscription failed:', error)
        return { success: false, message: 'Failed to subscribe' }
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
        // Get user's push subscription
        const sub = await env.DB.prepare(
            'SELECT endpoint, p256dh, auth FROM PushSubscriptions WHERE user_id = ?'
        )
            .bind(userId)
            .first()

        if (!sub) {
            return { success: false }
        }

        // Send push using Web Push API
        // Note: In production, use web-push library with VAPID keys
        const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192.png',
            badge: notification.badge || '/badge-72.png',
            data: notification.data,
        })

        // TODO: Implement actual Web Push send
        // await webpush.sendNotification(sub, payload)

        return { success: true }
    } catch (error) {
        console.error('Push notification failed:', error)
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
