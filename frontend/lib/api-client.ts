/**
 * Love Vibes API Client
 * Connects Frontend to Cloudflare Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

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

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    auth: {
        login: async (phoneNumber: string) => {
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
        upload: async (file: File, type: 'photo' | 'video' = 'photo') => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

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
    }
};
