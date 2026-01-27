// API Integration Helper for Love Vibes
// This file provides typed API calls to the backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lovevibes.thelovevibes-ai.workers.dev'

// Get auth token from storage
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('lv_jwt') || null
    }
    return null
}

// Generic API call helper with auth
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options?.headers as Record<string, string>,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
}

// Profile Prompts
export const promptsAPI = {
    getPrompts: () => apiCall<any[]>('/v2/prompts'),
    saveResponses: (responses: any[]) =>
        apiCall('/v2/prompts/responses', {
            method: 'POST',
            body: JSON.stringify({ responses }),
        }),
}

// Boost System
export const boostAPI = {
    activate: (durationMinutes: number = 30) =>
        apiCall('/v2/boost/activate', {
            method: 'POST',
            body: JSON.stringify({ duration_minutes: durationMinutes }),
        }),
    getStatus: () => apiCall('/v2/boost/status'),
}

// Rewind Feature
export const rewindAPI = {
    undo: (isPremium: boolean = false) =>
        apiCall('/v2/rewind', {
            method: 'POST',
            body: JSON.stringify({ is_premium: isPremium }),
        }),
}

// Success Stories
export const successStoriesAPI = {
    getStories: (limit: number = 20) => apiCall<any[]>(`/v2/success-stories?limit=${limit}`),
    submit: (partnerId: string, storyText: string, relationshipLength: string) =>
        apiCall('/v2/success-stories', {
            method: 'POST',
            body: JSON.stringify({
                partner_id: partnerId,
                story_text: storyText,
                relationship_length: relationshipLength
            }),
        }),
}

// Referrals
export const referralsAPI = {
    getStats: () => apiCall('/v2/referrals/stats'),
    getReferrals: () => apiCall('/v2/referrals'),
}

// Vibe Windows
export const vibeWindowsAPI = {
    set: (windows: Array<{ day_of_week: number; start_hour: number }>) =>
        apiCall('/v2/vibe-windows/set', {
            method: 'POST',
            body: JSON.stringify({ windows }),
        }),
    getStatus: () => apiCall('/v2/vibe-windows/status'),
}

// Voice Matching
export const voiceAPI = {
    upload: (audioBlob: Blob) => {
        const formData = new FormData()
        formData.append('file', audioBlob, 'voice.webm')

        const token = getAuthToken()
        const headers: Record<string, string> = {}
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return fetch(`${API_BASE}/v2/voice/upload`, {
            method: 'POST',
            headers,
            body: formData,
        }).then(r => r.json())
    },
    getFeed: () => apiCall('/v2/voice/feed'),
    swipe: (targetId: string, action: 'LIKE' | 'PASS') =>
        apiCall('/v2/voice/swipe', {
            method: 'POST',
            body: JSON.stringify({ target_id: targetId, action }),
        }),
}

// Proximity Alerts
export const proximityAPI = {
    enable: (enabled: boolean) =>
        apiCall('/v2/proximity/enable', {
            method: 'POST',
            body: JSON.stringify({ enabled }),
        }),
    updateLocation: (lat: number, long: number) =>
        apiCall('/v2/proximity/update', {
            method: 'POST',
            body: JSON.stringify({ lat, long }),
        }),
    respond: (alertId: string, response: 'accepted' | 'declined') =>
        apiCall('/v2/proximity/respond', {
            method: 'POST',
            body: JSON.stringify({ alert_id: alertId, response }),
        }),
}

// Mutual Friends
export const mutualFriendsAPI = {
    importContacts: (phoneNumbers: string[]) =>
        apiCall('/v2/mutual-friends/import', {
            method: 'POST',
            body: JSON.stringify({ phone_numbers: phoneNumbers }),
        }),
    getMutualFriends: (targetId: string) =>
        apiCall(`/v2/mutual-friends/find?target_id=${targetId}`),
    requestIntro: (targetId: string, mutualFriendId: string, message?: string) =>
        apiCall('/v2/mutual-friends/request', {
            method: 'POST',
            body: JSON.stringify({ target_id: targetId, mutual_friend_id: mutualFriendId, message }),
        }),
    respondToIntro: (requestId: string, action: 'approve' | 'decline') =>
        apiCall('/v2/mutual-friends/respond', {
            method: 'POST',
            body: JSON.stringify({ request_id: requestId, action }),
        }),
}

// Chemistry Test
export const chemistryAPI = {
    startTest: (matchId: string) =>
        apiCall('/v2/chemistry/start', {
            method: 'POST',
            body: JSON.stringify({ match_id: matchId }),
        }),
    submitAnswers: (testId: string, answers: Record<string, any>) =>
        apiCall('/v2/chemistry/submit', {
            method: 'POST',
            body: JSON.stringify({ test_id: testId, answers }),
        }),
    getResults: (testId: string) => apiCall(`/v2/chemistry/results?test_id=${testId}`),
}

// Account Recovery
export const recoveryAPI = {
    requestReset: (email: string) =>
        apiCall('/v2/recovery/request', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
    resetPassword: (token: string, newPassword: string) =>
        apiCall('/v2/recovery/reset', {
            method: 'POST',
            body: JSON.stringify({ token, new_password: newPassword }),
        }),
}

// Moderation (Admin)
export const moderationAPI = {
    getReports: () => apiCall<any[]>('/v2/admin/moderation/reports'),
    getStats: () => apiCall('/v2/admin/moderation/stats'),
    reviewReport: (reportId: string, action: 'DISMISS' | 'BAN_USER' | 'WARN_USER', notes: string = '') =>
        apiCall('/v2/admin/moderation/review', {
            method: 'POST',
            body: JSON.stringify({ report_id: reportId, action, notes }),
        }),
}

// Push Notifications
export const notificationsAPI = {
    subscribe: (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
        apiCall('/v2/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription }),
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
