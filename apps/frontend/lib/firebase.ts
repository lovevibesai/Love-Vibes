/**
 * Firebase Configuration and Initialization
 * Supported for both Web and Android (Native via Capacitor)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCN2Vi16pqsUI42FJnk9ewtJ8gdPllXpRk",
    authDomain: "lovevibes-007.firebaseapp.com",
    projectId: "lovevibes-007",
    storageBucket: "lovevibes-007.firebasestorage.app",
    messagingSenderId: "736608188330",
    appId: "1:736608188330:web:eca8fa6821b44ad1915dd3",
    measurementId: "G-5J87QYPQ6H"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (only if supported in the current environment)
export const initAnalytics = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
};

export { app };
