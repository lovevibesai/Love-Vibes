/**
 * Love Vibes API Client
 * Connects Frontend to Cloudflare Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://love-vibes-backend.thelovevibes-ai.workers.dev';

// Helper to get Token
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
}

// Helper for Fetch Wrapper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Auth-Token': token } : {}),
        ...options.headers,
    };

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(id);

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

export const api = {
    auth: {
        getRegisterOptions: async (userId?: string, email?: string) => {
            return apiRequest(`/v2/auth/register/options?user_id=${userId || ''}&email=${email || ''}`);
        },
        verifyRegister: async (userId: string, email: string, response: any) => {
            return apiRequest('/v2/auth/register/verify', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, email, response }),
            });
        },
        loginEmail: async (email: string) => {
            return apiRequest('/v2/auth/login/email', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        },
        // Google Login
        loginGoogle: async (idToken: string) => {
            const res = await apiRequest('/v2/auth/login/google', {
                method: 'POST',
                body: JSON.stringify({ id_token: idToken }),
            });
            if (res.token) {
                localStorage.setItem('auth_token', res.token);
                if (res.user?.id) localStorage.setItem('user_id', res.user.id);
            }
            return res;
        },
        // Passkey Login
        getLoginOptions: async () => {
            return apiRequest('/v2/auth/login/passkey/options');
        },
        verifyLoginPasskey: async (response: any) => {
            const res = await apiRequest('/v2/auth/login/passkey/verify', {
                method: 'POST',
                body: JSON.stringify({ response }),
            });
            if (res.success && res.token) {
                localStorage.setItem('auth_token', res.token);
                if (res.user?.id) localStorage.setItem('user_id', res.user.id);
            }
            return res;
        },
        verifyEmailOTP: async (email: string, otp: string) => {
            const res = await apiRequest('/v2/auth/login/email/verify', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
            });
            if (res.success && res.token) {
                localStorage.setItem('auth_token', res.token);
            }
            return res;
        },
        loginLegacy: async (phoneNumber: string) => {
            const res = await apiRequest('/v2/auth/login/sms', {
                method: 'POST',
                body: JSON.stringify({ phone_number: phoneNumber }),
            });
            // Save Token
            if (res.data?.api_token) {
                localStorage.setItem('auth_token', res.data.api_token);
                localStorage.setItem('user_id', res.data._id);
            }
            return res.data;
        },
        logout: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
        }
    },

    feed: {
        getRecs: async (lat: number, long: number, radius = 50) => {
            return apiRequest(`/v2/recs/core?lat=${lat}&long=${long}&radius=${radius}`);
        },
    },

    actions: {
        like: async (targetId: string) => {
            return apiRequest(`/like?id=${targetId}`);
        },
        pass: async (targetId: string) => {
            return apiRequest(`/pass?id=${targetId}`);
        },
    },

    user: {
        ping: async (lat: number, long: number) => {
            return apiRequest('/user/ping', {
                method: 'POST',
                body: JSON.stringify({ lat, long })
            })
        },
        updateProfile: async (data: any) => {
            return apiRequest('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            })
        },
        getProfile: async () => {
            return apiRequest('/user/profile');
        }
    },
    vibeWindows: {
        setStatus: async (windows: Array<{ day_of_week: number; start_hour: number }>) => {
            return apiRequest('/v2/vibe-windows/set', {
                method: 'POST',
                body: JSON.stringify({ windows })
            });
        },
        getStatus: async () => {
            return apiRequest('/v2/vibe-windows/status');
        }
    },
    chemistry: {
        startTest: async (matchId: string, targetId: string) => {
            return apiRequest('/v2/chemistry/start', {
                method: 'POST',
                body: JSON.stringify({ match_id: matchId, target_id: targetId })
            });
        },
        submitData: async (testId: string, heartRateData: Array<{ timestamp: number; bpm: number }>) => {
            return apiRequest('/v2/chemistry/submit', {
                method: 'POST',
                body: JSON.stringify({ test_id: testId, heart_rate_data: heartRateData })
            });
        },
        getResults: async (testId: string) => {
            return apiRequest(`/v2/chemistry/results/${testId}`);
        }
    },
    voice: {
        uploadProfile: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/v2/voice/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    ...(token ? { 'X-Auth-Token': token } : {}),
                }
            });
            return response.json();
        },
        getFeed: async () => {
            return apiRequest('/v2/voice/feed');
        },
        swipe: async (targetId: string, action: 'LIKE' | 'PASS') => {
            return apiRequest('/v2/voice/swipe', {
                method: 'POST',
                body: JSON.stringify({ target_id: targetId, action })
            });
        }
    },
    proximity: {
        toggle: async (enabled: boolean) => {
            return apiRequest('/v2/proximity/enable', {
                method: 'POST',
                body: JSON.stringify({ enabled })
            });
        },
        updateLocation: async (lat: number, long: number) => {
            return apiRequest('/v2/proximity/update', {
                method: 'POST',
                body: JSON.stringify({ lat, long })
            });
        },
        respond: async (alertId: string, response: 'accepted' | 'declined') => {
            return apiRequest('/v2/proximity/respond', {
                method: 'POST',
                body: JSON.stringify({ alert_id: alertId, response })
            });
        }
    },
    boost: {
        activate: async (durationMinutes: number = 30) => {
            return apiRequest('/v2/boost/activate', {
                method: 'POST',
                body: JSON.stringify({ duration_minutes: durationMinutes })
            });
        },
        getStatus: async () => {
            return apiRequest('/v2/boost/status');
        }
    },
    social: {
        importContacts: async (contacts: Array<{ phone: string; name: string }>) => {
            return apiRequest('/v2/social/import', {
                method: 'POST',
                body: JSON.stringify({ contacts })
            });
        },
        getMutualFriends: async (targetId: string) => {
            return apiRequest(`/v2/social/mutual/${targetId}`);
        },
        requestIntro: async (targetId: string, mutualFriendId: string) => {
            return apiRequest('/v2/social/request-intro', {
                method: 'POST',
                body: JSON.stringify({ target_id: targetId, mutual_friend_id: mutualFriendId })
            });
        },
        respondIntro: async (requestId: string, response: 'approved' | 'declined', message?: string) => {
            return apiRequest('/v2/social/respond-intro', {
                method: 'POST',
                body: JSON.stringify({ request_id: requestId, response, message })
            });
        }
    },
    safety: {
        reportUser: async (reportedId: string, reason: string, details: string) => {
            return apiRequest('/v2/safety/report', {
                method: 'POST',
                body: JSON.stringify({
                    reported_id: reportedId,
                    reason,
                    details
                })
            });
        },
        blockUser: async (blockedId: string) => {
            return apiRequest('/v2/safety/block', {
                method: 'POST',
                body: JSON.stringify({
                    blocked_id: blockedId
                })
            });
        }
    },
    billing: {
        purchaseCredits: async (packageId: string) => {
            return apiRequest('/v2/billing/purchase-credits', {
                method: 'POST',
                body: JSON.stringify({ package_id: packageId })
            });
        },
        subscribe: async (tier: 'plus' | 'platinum', interval: 'monthly' | 'yearly') => {
            return apiRequest('/v2/billing/subscribe', {
                method: 'POST',
                body: JSON.stringify({ tier, interval })
            });
        },
        getInfo: async () => {
            return apiRequest('/v2/billing/info');
        }
    },
    chat: {
        getIcebreakers: async (withUserId: string) => {
            return apiRequest(`/v2/chat/icebreakers?with_user_id=${withUserId}`);
        }
    },
    media: {
        getVideoUploadUrl: async () => {
            return apiRequest('/v2/media/video-upload-url');
        },
        upload: async (file: File, type: 'photo' | 'video' = 'photo', streamUid?: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            if (streamUid) {
                formData.append('stream_uid', streamUid);
            }

            // Note: When sending FormData, the browser automatically sets 
            // the correct Content-Type with boundary. We must NOT set it manually.
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/v2/media/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    ...(token ? { 'X-Auth-Token': token } : {}),
                }
            });

            if (!response.ok) {
                throw new Error(`Media Upload Error: ${response.statusText}`);
            }

            return response.json();
        }
    },
    prompts: {
        getAll: async () => {
            return apiRequest('/v2/prompts');
        },
        saveResponses: async (userId: string, prompts: Array<{ prompt_id: string; response_text: string; display_order: number }>) => {
            return apiRequest('/v2/user/prompts', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, prompts })
            });
        },
        getUserPrompts: async (userId: string) => {
            return apiRequest(`/v2/user/${userId}/prompts`);
        }
    },
    referrals: {
        getStats: async (userId: string) => {
            return apiRequest(`/v2/referrals/stats?userId=${userId}`);
        },
        unlock: async (userId: string, scenarioType: 'intimate' | 'mystical') => {
            return apiRequest('/v2/referrals/unlock', {
                method: 'POST',
                body: JSON.stringify({ userId, scenarioType })
            });
        }
    }
};
