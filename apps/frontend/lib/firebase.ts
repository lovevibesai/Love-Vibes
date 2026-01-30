/**
 * Firebase Configuration and Initialization
 * Hardened for Production: Supports Web and Android (Native via Capacitor)
 * Optimized for Love Vibes Authentication Flow
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
    indexedDBLocalPersistence
} from "firebase/auth";
import { getMessaging, isSupported as isMessagingSupported, getToken } from "firebase/messaging";

// Firebase configuration
// NOTE: These fallbacks ensure the app builds even if GitHub Secrets are missing.
// For true production isolation, set these variables in GitHub/Cloudflare.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with cross-platform persistence
export const auth = getAuth(app);

// Set persistence to ensure users stay logged in across sessions
// We use a combination that works for both Web and Mobile (Capacitor)
if (typeof window !== "undefined") {
    setPersistence(auth, indexedDBLocalPersistence).catch(() => {
        setPersistence(auth, browserLocalPersistence);
    });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Initialize Analytics
 * Only runs in the browser and if supported
 */
export const initAnalytics = async () => {
    if (typeof window !== "undefined") {
        const supported = await isAnalyticsSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
};

/**
 * Initialize Cloud Messaging (Push Notifications)
 * Includes VAPID key and basic token retrieval logic
 */
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const initMessaging = async () => {
    if (typeof window !== "undefined") {
        const supported = await isMessagingSupported();
        if (supported) {
            const messaging = getMessaging(app);

            // Optional: Request permission and get token automatically
            try {
                const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
                if (currentToken) {
                    // console.log("FCM Token:", currentToken);
                    // You would typically send this token to your backend here
                }
            } catch (err) {
                console.warn("Messaging initialization error:", err);
            }

            return messaging;
        }
    }
    return null;
};

// Helper to check if running in a Native/Capacitor environment
export const isNative = () => {
    return typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
};

export { app };
