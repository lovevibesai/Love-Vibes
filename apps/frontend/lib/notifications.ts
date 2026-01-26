/**
 * Push Notifications Helper
 * Handles Firebase Cloud Messaging setup and token management
 */

import { getToken, onMessage } from "firebase/messaging";
import { initMessaging, VAPID_KEY } from "./firebase";

export async function requestNotificationPermission(): Promise<string | null> {
    try {
        // Check if notifications are supported
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied");
            return null;
        }

        // Get FCM token
        const messaging = await initMessaging();
        if (!messaging) {
            console.log("Messaging not supported");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
        });

        if (token) {
            console.log("FCM Token:", token);
            // TODO: Send token to backend to save for this user
            // await api.notifications.registerToken(token);
            return token;
        } else {
            console.log("No registration token available");
            return null;
        }
    } catch (error) {
        console.error("Error getting notification permission:", error);
        return null;
    }
}

export async function setupForegroundNotifications() {
    try {
        const messaging = await initMessaging();
        if (!messaging) return;

        // Handle foreground messages
        onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);

            // Show notification manually when app is in foreground
            if (payload.notification) {
                new Notification(payload.notification.title || "Love Vibes", {
                    body: payload.notification.body,
                    icon: "/logo.png",
                    badge: "/logo.png",
                });
            }
        });
    } catch (error) {
        console.error("Error setting up foreground notifications:", error);
    }
}

export function checkNotificationPermission(): NotificationPermission {
    if (!("Notification" in window)) {
        return "denied";
    }
    return Notification.permission;
}
