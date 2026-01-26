// API Integration Helper for Love Vibes
// This file provides typed API calls to the backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lovevibes.thelovevibes-ai.workers.dev'

// Generic API call helper
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
}

// Profile Prompts
export const promptsAPI = {
    getPrompts: () => apiCall<any[]>('/api/prompts'),
    saveResponses: (userId: string, responses: any[]) =>
        apiCall('/api/prompts/responses', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, responses }),
        }),
}

// Boost System
export const boostAPI = {
    activate: (userId: string) =>
        apiCall('/api/boost/activate', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        }),
    getStatus: (userId: string) => apiCall(`/api/boost/status?user_id=${userId}`),
}

// Rewind Feature
export const rewindAPI = {
    undo: (userId: string) =>
        apiCall('/api/rewind', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        }),
}

// Success Stories
export const successStoriesAPI = {
    getStories: () => apiCall<any[]>('/api/success-stories'),
    submit: (story: any) =>
        apiCall('/api/success-stories', {
            method: 'POST',
            body: JSON.stringify(story),
        }),
}

// Referrals
export const referralsAPI = {
    getStats: (userId: string) => apiCall(`/api/referrals/stats?user_id=${userId}`),
    getReferrals: (userId: string) => apiCall(`/api/referrals?user_id=${userId}`),
}

// Vibe Windows
export const vibeWindowsAPI = {
    set: (userId: string, windows: any[]) =>
        apiCall('/api/vibe-windows/set', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, windows }),
        }),
    getActive: () => apiCall('/api/vibe-windows/active'),
}

// Voice Matching
export const voiceAPI = {
    upload: (userId: string, audioBlob: Blob) => {
        const formData = new FormData()
        formData.append('audio', audioBlob)
        formData.append('user_id', userId)

        return fetch(`${API_BASE}/api/voice/upload`, {
            method: 'POST',
            body: formData,
        }).then(r => r.json())
    },
    getFeed: (userId: string) => apiCall(`/api/voice/feed?user_id=${userId}`),
    swipe: (actorId: string, targetId: string, type: 'LIKE' | 'PASS') =>
        apiCall('/api/voice/swipe', {
            method: 'POST',
            body: JSON.stringify({ actor_id: actorId, target_id: targetId, type }),
        }),
}

// Proximity Alerts
export const proximityAPI = {
    enable: (userId: string) =>
        apiCall('/api/proximity/enable', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        }),
    updateLocation: (userId: string, lat: number, long: number) =>
        apiCall('/api/proximity/update-location', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, lat, long }),
        }),
    getNearby: (userId: string) => apiCall(`/api/proximity/nearby-matches?user_id=${userId}`),
}

// Mutual Friends
export const mutualFriendsAPI = {
    importContacts: (userId: string, contacts: string[]) =>
        apiCall('/api/social/import-contacts', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, contacts }),
        }),
    getMutualFriends: (userId: string, targetId: string) =>
        apiCall(`/api/social/mutual-friends?user_id=${userId}&target_id=${targetId}`),
    requestIntro: (requesterId: string, targetId: string, mutualFriendId: string) =>
        apiCall('/api/social/request-intro', {
            method: 'POST',
            body: JSON.stringify({ requester_id: requesterId, target_id: targetId, mutual_friend_id: mutualFriendId }),
        }),
}

// Chemistry Test
export const chemistryAPI = {
    startTest: (matchId: string) =>
        apiCall('/api/chemistry/start-test', {
            method: 'POST',
            body: JSON.stringify({ match_id: matchId }),
        }),
    submitData: (testId: string, userId: string, heartRateData: number[]) =>
        apiCall('/api/chemistry/submit-data', {
            method: 'POST',
            body: JSON.stringify({ test_id: testId, user_id: userId, heart_rate_data: heartRateData }),
        }),
    getResults: (testId: string) => apiCall(`/api/chemistry/results?test_id=${testId}`),
}

// Account Recovery
export const recoveryAPI = {
    requestReset: (email: string) =>
        apiCall('/api/recovery/request', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
    verifyToken: (token: string) => apiCall(`/api/recovery/verify?token=${token}`),
    resetPassword: (token: string, newPassword: string) =>
        apiCall('/api/recovery/reset', {
            method: 'POST',
            body: JSON.stringify({ token, new_password: newPassword }),
        }),
}

// Moderation
export const moderationAPI = {
    getReports: () => apiCall<any[]>('/api/moderation/reports'),
    takeAction: (reportId: string, action: 'dismiss' | 'warn' | 'ban', adminId: string) =>
        apiCall('/api/moderation/action', {
            method: 'POST',
            body: JSON.stringify({ report_id: reportId, action, admin_id: adminId }),
        }),
}

// Push Notifications
export const notificationsAPI = {
    subscribe: (userId: string, subscription: PushSubscription) =>
        apiCall('/api/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, subscription }),
        }),
    updateSettings: (userId: string, settings: any) =>
        apiCall('/api/notifications/settings', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, ...settings }),
        }),
}

export const loveVibesAPI = {
    prompts: promptsAPI,
    boost: boostAPI,
    rewind: rewindAPI,
    successStories: successStoriesAPI,
    referrals: referralsAPI,
    vibeWindows: vibeWindowsAPI,
    voice: voiceAPI,
    proximity: proximityAPI,
    mutualFriends: mutualFriendsAPI,
    chemistry: chemistryAPI,
    recovery: recoveryAPI,
    moderation: moderationAPI,
    notifications: notificationsAPI,
}
