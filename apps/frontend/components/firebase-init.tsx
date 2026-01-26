"use client"

import React from "react"

export function FirebaseInit() {
    React.useEffect(() => {
        import('@/lib/firebase').then(({ initAnalytics }) => {
            initAnalytics();
        });
    }, []);
    return null;
}
