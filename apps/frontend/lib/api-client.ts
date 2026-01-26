/**
 * Love Vibes API Client
 * Connects Frontend to Cloudflare Backend
 * Enhanced for robust error handling and endpoint synchronization
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://love-vibes-backend.thelovevibes-ai.workers.dev';

// Types for API Responses
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    token?: string;
    user_id?: string;
    is_new_user?: boolean;
}

// Helper to get Token
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
}

// Helper to handle unauthorized responses
function handleUnauthorized() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        // Optional: Redirect to login
        // window.location.href = '/login';
    }
}

// Helper for Fetch Wrapper
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Auth-Token': token } : {}),
        ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s for WebAuthn

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 401) {
            handleUnauthorized();
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage = data.error || data.message || `API Error: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return data as T;
    } catch (e: any) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw e;
    }
}

export const api = {
    auth: {
        // Passkey Registration
        getRegisterOptions: async (userId?: string, email?: string) => {
            return apiRequest(`/v2/auth/register/options?user_id=${userId || ''}&email=${email || ''}`);
        },
        verifyRegister: async (userId: string, email: string, response: any, challengeId?: string) => {
            const res = await apiRequest('/v2/auth/register/verify', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, email, response, challengeId }),
            });
            if (res.success && res.token) {
                localStorage.setItem('auth_token', res.token);
                if (res.user_id) localStorage.setItem('user_id', res.user_id);
            }
            return res;
        },

        // Passkey Login (Synchronized with backend paths)
        getLoginOptions: async (email?: string) => {
            return apiRequest(`/v2/auth/login/options${email ? `?email=${email}` : ''}`);
        },
        verifyLoginPasskey: async (response: any, challengeId?: string) => {
            const res = await apiRequest('/v2/auth/login/verify', {
                method: 'POST',
                body: JSON.stringify({ response, challengeId }),
            });
            if (res.success && res.token) {
                localStorage.setItem('auth_token', res.token);
                if (res.user_id) localStorage.setItem('user_id', res.user_id);
            }
            return res;
        },

        // Email OTP Flow
        loginEmail: async (email: string) => {
            return apiRequest('/v2/auth/login/email', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        },
        verifyEmailOTP: async (email: string, otp: string) => {
            const res = await apiRequest('/v2/auth/login/email/verify', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
            });
            if (res.success && res.token) {
                localStorage.setItem('auth_token', res.token);
                if (res.user_id) localStorage.setItem('user_id', res.user_id);
            }
            return res;
        },

        // Google Login
        loginGoogle: async (idToken: string) => {
            const res = await apiRequest('/v2/auth/login/google', {
                method: 'POST',
                body: JSON.stringify({ id_token: idToken }),
            });
            if (res.success && res.token) {
                localStorage.setItem('auth_token', res.token);
                if (res.user_id) localStorage.setItem('user_id', res.user_id);
            }
            return res;
        },

        logout: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_data');
            localStorage.removeItem('is_onboarded');
            localStorage.removeItem('current_screen');
        }
    },

    user: {
        getProfile: async () => {
            return apiRequest('/user/profile');
        },
        updateProfile: async (data: any) => {
            return apiRequest('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        ping: async (lat: number, long: number) => {
            return apiRequest('/user/ping', {
                method: 'POST',
                body: JSON.stringify({ lat, long })
            });
        }
    },

    feed: {
        getRecs: async (lat: number, long: number, radius = 50) => {
            return apiRequest(`/v2/recs/core?lat=${lat}&long=${long}&radius=${radius}`);
        },
    },

    actions: {
        like: async (targetId: string) => {
            return apiRequest(`/like?id=${targetId}`, { method: 'POST' });
        },
        pass: async (targetId: string) => {
            return apiRequest(`/pass?id=${targetId}`, { method: 'POST' });
        },
    },

    media: {
        upload: async (file: File, type: 'photo' | 'video' = 'photo') => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const token = getAuthToken();
            const response = await fetch(`${API_URL}/v2/media/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    ...(token ? { 'X-Auth-Token': token } : {}),
                    // Content-Type is set automatically by the browser for FormData
                }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || `Upload Error: ${response.statusText}`);
            }

            return response.json();
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
    },
    chemistry: {
        startTest: async (matchId: string, targetId: string) => {
            return apiRequest('/v2/chemistry/start', {
                method: 'POST',
                body: JSON.stringify({ matchId, targetId })
            });
        },
        submitData: async (testId: string, readings: any[]) => {
            return apiRequest('/v2/chemistry/data', {
                method: 'POST',
                body: JSON.stringify({ testId, readings })
            });
        },
        getResults: async (testId: string) => {
            return apiRequest(`/v2/chemistry/results?testId=${testId}`);
        }
    },
    proximity: {
        updateLocation: async (lat: number, long: number) => {
            return apiRequest('/user/ping', {
                method: 'POST',
                body: JSON.stringify({ lat, long })
            });
        },
        toggle: async (enabled: boolean) => {
            return apiRequest('/v2/proximity/toggle', {
                method: 'POST',
                body: JSON.stringify({ enabled })
            });
        }
    }
};
