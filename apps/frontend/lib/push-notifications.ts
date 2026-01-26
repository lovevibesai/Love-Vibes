// Push Notifications Service Worker Registration
// This file handles Web Push notification subscription and management


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lovevibes.thelovevibes-ai.workers.dev';

export async function registerServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered:', registration)
            return registration
        } catch (error) {
            console.error('Service Worker registration failed:', error)
            return null
        }
    }
    return null
}

export async function subscribeToPushNotifications(userId: string) {
    try {
        const registration = await navigator.serviceWorker.ready

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
            // Subscribe to push notifications
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                throw new Error('VAPID public key not configured')
            }

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
            })
        }

        // Send subscription to backend
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/v2/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'X-Auth-Token': token } : {})
            },
            body: JSON.stringify({
                user_id: userId,
                subscription: subscription.toJSON(),
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to save subscription')
        }

        return subscription
    } catch (error) {
        console.error('Push notification subscription failed:', error)
        return null
    }
}

export async function unsubscribeFromPushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
            await subscription.unsubscribe()
            console.log('Unsubscribed from push notifications')
        }
    } catch (error) {
        console.error('Failed to unsubscribe:', error)
    }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications')
        return 'denied'
    }

    if (Notification.permission === 'granted') {
        return 'granted'
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission
    }

    return Notification.permission
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

// Initialize push notifications for a user
export async function initializePushNotifications(userId: string): Promise<boolean> {
    try {
        // Request permission
        const permission = await requestNotificationPermission()
        if (permission !== 'granted') {
            console.log('Notification permission denied')
            return false
        }

        // Register service worker
        const registration = await registerServiceWorker()
        if (!registration) {
            console.error('Service worker registration failed')
            return false
        }

        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications(userId)
        if (!subscription) {
            console.error('Push subscription failed')
            return false
        }

        console.log('Push notifications initialized successfully')
        return true
    } catch (error) {
        console.error('Failed to initialize push notifications:', error)
        return false
    }
}
