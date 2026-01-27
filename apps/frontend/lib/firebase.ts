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
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCN2Vi16pqsUI42FJnk9ewtJ8gdPllXpRk",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "lovevibes-007.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lovevibes-007",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "lovevibes-007.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "736608188330",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:736608188330:web:eca8fa6821b44ad1915dd3",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5J87QYPQ6H"
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
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "cM6EgnZR1GW-mfC1VGrhjey9ACTMsUY6eaRK6QTYKu0";

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
