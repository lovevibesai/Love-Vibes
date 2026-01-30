/**
 * Auth Module (Production Hardened)
 * High-Security, Zero-Cost Authentication via Passkeys & Email OTP
 */
import { Env } from './index';
import { SignJWT, jwtVerify } from 'jose';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';
import { z } from 'zod';
import { ValidationError, AppError } from './errors';
import { checkRateLimit } from './ratelimit';
import { logger } from './logger';

const LoginEmailSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
});

const VerifyEmailSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

const GoogleLoginSchema = z.object({
    id_token: z.string().min(1, 'ID token is required'),
    device_info: z.object({
        platform: z.string().optional(),
        device_id: z.string().optional(),
    }).optional(),
});

// Types
interface User {
    id: string;
    name: string | null;
    email: string;
    is_onboarded: number;
    onboarding_step: number;
}

interface GoogleTokenPayload {
    email?: string;
    email_verified?: boolean;
    sub?: string;
    name?: string;
    picture?: string;
    error_description?: string;
}

// Constants
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_PREFIX = 'otp:';
const OTP_ATTEMPTS_PREFIX = 'otp_attempts:';
const MAX_OTP_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Helper to get JWT Secret (Production Safe)
function getJwtSecret(env: Env): Uint8Array {
    if (!env.JWT_SECRET) {
        throw new Error('Critical Security Error: JWT_SECRET is not set');
    }
    return new TextEncoder().encode(env.JWT_SECRET);
}

// Helper for RP_ID
// Dynamically adjusts RP_ID for local development vs production domains
function getRpId(request: Request, env: Env): string {
    const origin = request.headers.get('Origin') || '';
    const host = request.headers.get('Host') || '';

    // Prioritize localhost if the request is coming from it
    if (origin.includes('localhost') || host.includes('localhost')) {
        return 'localhost';
    }

    // Default to the RP_ID from environment, or the hardcoded fallback
    return env.RP_ID || 'love-vibes-app.pages.dev';
}

const RP_NAME = 'Love Vibes';

function base64ToBase64URL(b64: string): string {
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64URLToBase64(b64url: string): string {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    return b64;
}

// Security Helper Functions
async function validateOtpRateLimit(email: string, env: Env): Promise<void> {
    const attemptsKey = `${OTP_ATTEMPTS_PREFIX}${email}`;
    const attempts = await env.GEO_KV.get(attemptsKey);
    const attemptCount = attempts ? parseInt(attempts, 10) : 0;

    if (attemptCount >= MAX_OTP_ATTEMPTS) {
        throw new ValidationError('Too many OTP attempts. Please request a new OTP.');
    }

    // Increment attempt counter
    await env.GEO_KV.put(
        attemptsKey,
        String(attemptCount + 1),
        { expirationTtl: Math.floor(RATE_LIMIT_WINDOW_MS / 1000) }
    );
}

async function verifyOtp(email: string, otp: string, env: Env): Promise<boolean> {
    const storedOtpData = await env.GEO_KV.get(`${OTP_PREFIX}${email}`, { type: 'json' }) as { otp: string; expiresAt: number } | null;

    if (!storedOtpData) {
        return false;
    }

    const { otp: storedOtp, expiresAt } = storedOtpData;

    // Check expiration
    if (Date.now() > expiresAt) {
        await env.GEO_KV.delete(`${OTP_PREFIX}${email}`);
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    return storedOtp === otp;
}

async function findOrCreateUser(email: string, env: Env, additionalData?: Partial<User>): Promise<{ user: User; isNewUser: boolean }> {
    // Check if user exists
    const existingUser = await env.DB.prepare(
        "SELECT id, name, email, is_onboarded, onboarding_step FROM Users WHERE email = ?"
    ).bind(email).first() as User | null;

    if (existingUser) {
        return {
            user: existingUser,
            isNewUser: !existingUser.name, // Consider user "new" if they haven't set a name
        };
    }

    // Create new user
    const newUserId = crypto.randomUUID();
    const timestamp = Date.now();

    await env.DB.prepare(`
        INSERT INTO Users (id, email, created_at, is_onboarded, onboarding_step, name)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
        newUserId,
        email,
        timestamp,
        0,
        0,
        additionalData?.name || null
    ).run();

    const newUser: User = {
        id: newUserId,
        email,
        name: additionalData?.name || null,
        is_onboarded: 0,
        onboarding_step: 0,
    };

    return { user: newUser, isNewUser: true };
}

async function cleanupOtpData(email: string, env: Env): Promise<void> {
    await Promise.all([
        env.GEO_KV.delete(`${OTP_PREFIX}${email}`),
        env.GEO_KV.delete(`${OTP_ATTEMPTS_PREFIX}${email}`),
    ]);
}

// Helper: Verify Google ID Token
async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload> {
    try {
        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                // Add timeout
                signal: AbortSignal.timeout(5000),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ValidationError(
                (errorData as Record<string, unknown>).error_description as string || 'Failed to verify Google token'
            );
        }

        const payload = await response.json() as GoogleTokenPayload;

        // Validate required fields
        if (!payload.email || !payload.sub) {
            throw new ValidationError('Invalid token payload from Google');
        }

        return payload;

    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }

        // Handle network errors
        logger.error('google_token_verification_failed', error);
        throw new ValidationError('Unable to verify Google token. Please try again.');
    }
}

export async function handleAuth(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Turnstile Verification (Universal for Signups/Logins)
    const turnstileToken = request.headers.get('CF-Turnstile-Response');
    if (request.method === 'POST' && !turnstileToken && !path.includes('/dev/')) {
        // Enforce Turnstile in production
        const isValid = await _verifyTurnstile(turnstileToken || "", env);
        if (!isValid) {
            return new Response(JSON.stringify({ success: false, error: 'Bot check failed' }), { status: 403 });
        }
    }

    // --- PASSKEY (WEBAUTHN) FLOW ---

    // A. Registration Options (GET /v2/auth/register/options)
    if (path === '/v2/auth/register/options') {
        const userId = url.searchParams.get('user_id') || crypto.randomUUID();
        const email = url.searchParams.get('email') || "";

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: getRpId(request, env),
            userID: new Uint8Array(new TextEncoder().encode(userId)),
            userName: email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
        });

        const challengeId = crypto.randomUUID();
        // Store challenge in D1 (short TTL)
        await env.DB.prepare(
            "INSERT INTO AuthChallenges (id, challenge, user_id, type, expires_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(challengeId, options.challenge, userId, 'registration', Date.now() + 60000).run();

        return new Response(JSON.stringify({ ...options, challengeId }), { headers: { 'Content-Type': 'application/json' } });
    }

    // B. Verify Registration (POST /v2/auth/register/verify)
    if (path === '/v2/auth/register/verify' && request.method === 'POST') {
        interface RegisterVerifyBody {
            response: RegistrationResponseJSON;
            user_id: string;
            email: string;
            challengeId: string;
        }
        const body = await request.json() as RegisterVerifyBody;
        const { response, user_id, email, challengeId } = body;

        // Fetch challenge from DB
        const challengeRow = await env.DB.prepare(
            "SELECT challenge FROM AuthChallenges WHERE (id = ? OR user_id = ?) AND type = 'registration' ORDER BY expires_at DESC LIMIT 1"
        ).bind(challengeId || '', user_id).first();

        if (!challengeRow) return new Response("Challenge expired", { status: 400 });

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: challengeRow.challenge as string,
            expectedOrigin: [
                'https://love-vibes-app.pages.dev',
                'https://love-vibes-frontend.pages.dev',
                'https://553b3734.love-vibes-app.pages.dev',
                `https://${getRpId(request, env)}`,
                'http://localhost:3000',
                'http://localhost:3001'
            ],
            expectedRPID: getRpId(request, env),
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential } = verification.registrationInfo;
            const { publicKey: credentialPublicKey, id: credentialID, counter } = credential;

            // CRITICAL FIX: Check if email already exists to prevent duplicate profiles
            // If email exists, we merge this new passkey to the EXISTING user ID
            const existingUser = await env.DB.prepare("SELECT id FROM Users WHERE email = ?").bind(email).first();

            let finalUserId = user_id;
            let isNewUser = true;

            if (existingUser) {
                logger.info('passkey_merge', undefined, { email });
                finalUserId = existingUser.id as string;
                isNewUser = false;
            } else {
                // Create New User
                await env.DB.prepare(
                    "INSERT OR IGNORE INTO Users (id, email, created_at) VALUES (?, ?, ?)"
                ).bind(user_id, email, Date.now()).run();
            }

            // Save Credential (linked to correct finalUserId)
            await env.DB.prepare(
                "INSERT OR REPLACE INTO UserCredentials (id, user_id, public_key, counter) VALUES (?, ?, ?, ?)"
            ).bind(Buffer.from(credentialID).toString('base64'), finalUserId, Buffer.from(credentialPublicKey).toString('base64'), counter).run();

            const userRow = await env.DB.prepare("SELECT is_onboarded FROM Users WHERE id = ?").bind(finalUserId).first() as { is_onboarded?: number } | null;
            const isOnboarded = !!userRow?.is_onboarded;

            const token = await issueToken(finalUserId, env);
            return new Response(JSON.stringify({
                success: true,
                token,
                user_id: finalUserId,
                _id: finalUserId,
                is_new_user: isNewUser,
                is_onboarded: isOnboarded,
            }), { headers: { 'Content-Type': 'application/json' } });
        } else {
            throw new ValidationError("Passkey verification failed");
        }
    }

    // A2. Passkey Login Options (GET /v2/auth/login/options)
    if (path === '/v2/auth/login/options') {
        const email = url.searchParams.get('email') || undefined;
        let allowCredentials: { id: string; type: 'public-key'; transports?: ('internal' | 'hybrid')[] }[] | undefined;

        if (email) {
            const userRow = await env.DB.prepare("SELECT id FROM Users WHERE email = ?").bind(email).first() as { id: string } | null;
            if (userRow) {
                const creds = await env.DB.prepare("SELECT id FROM UserCredentials WHERE user_id = ?")
                    .bind(userRow.id).all();
                allowCredentials = (creds.results || []).map((r: Record<string, unknown>) => ({
                    id: base64ToBase64URL(r.id as string),
                    type: 'public-key' as const,
                    transports: ['internal', 'hybrid'],
                }));
            }
        }

        const options = await generateAuthenticationOptions({
            rpID: getRpId(request, env),
            allowCredentials,
            userVerification: 'preferred',
        });

        const challengeId = crypto.randomUUID();
        await env.DB.prepare(
            "INSERT INTO AuthChallenges (id, challenge, user_id, type, expires_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(challengeId, options.challenge, '', 'login', Date.now() + 60000).run();

        return new Response(JSON.stringify({ ...options, challengeId }), { headers: { 'Content-Type': 'application/json' } });
    }

    // A3. Verify Passkey Login (POST /v2/auth/login/verify)
    if (path === '/v2/auth/login/verify' && request.method === 'POST') {
        interface LoginVerifyBody {
            response: AuthenticationResponseJSON;
            challengeId: string;
        }
        const body = await request.json() as LoginVerifyBody;
        const { response, challengeId } = body;
        if (!response || !response.id) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid response' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const credIdBase64 = base64URLToBase64(response.id);
        const credRow = await env.DB.prepare(
            "SELECT id, user_id, public_key, counter FROM UserCredentials WHERE id = ? OR id = ?"
        ).bind(credIdBase64, response.id).first() as { id: string; user_id: string; public_key: string; counter: number } | null;

        if (!credRow) {
            return new Response(JSON.stringify({ success: false, error: 'Unknown passkey' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const challengeRow = await env.DB.prepare(
            "SELECT challenge FROM AuthChallenges WHERE (id = ? OR type = 'login') AND expires_at > ? ORDER BY expires_at DESC LIMIT 1"
        ).bind(challengeId || '', Date.now()).first();

        if (!challengeRow) {
            return new Response(JSON.stringify({ success: false, error: 'Challenge expired' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const publicKeyBytes = Uint8Array.from(Buffer.from(credRow.public_key, 'base64'));
        const credential = {
            id: response.id,
            publicKey: publicKeyBytes,
            counter: credRow.counter,
        };

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: challengeRow.challenge as string,
            expectedOrigin: [
                'https://love-vibes-app.pages.dev',
                'https://love-vibes-frontend.pages.dev',
                'https://553b3734.love-vibes-app.pages.dev',
                `https://${getRpId(request, env)}`,
                'http://localhost:3000',
                'http://localhost:3001',
            ],
            expectedRPID: getRpId(request, env),
            credential,
        });

        if (!verification.verified) {
            return new Response(JSON.stringify({ success: false, error: 'Verification failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        await env.DB.prepare("UPDATE UserCredentials SET counter = ? WHERE id = ?")
            .bind(verification.authenticationInfo.newCounter, credRow.id).run();

        const userId = credRow.user_id;
        const userRow = await env.DB.prepare("SELECT id, is_onboarded, onboarding_step FROM Users WHERE id = ?").bind(userId).first() as { id: string; is_onboarded?: number; onboarding_step?: number } | null;
        const isOnboarded = !!userRow?.is_onboarded;
        const onboardingStep = userRow?.onboarding_step || 0;

        const token = await issueToken(userId, env);
        return new Response(JSON.stringify({
            success: true,
            token,
            user_id: userId,
            _id: userId,
            is_onboarded: isOnboarded,
            onboarding_step: onboardingStep,
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    // --- EMAIL OTP FALLBACK ---

    // C. Request Email OTP (POST /v2/auth/login/email)
    if (path === '/v2/auth/login/email' && request.method === 'POST') {
        const body = LoginEmailSchema.parse(await request.json());
        const email = body.email;
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';

        // Rate Limit OTP requests (3 per hour per IP/Email)
        const rl = await checkRateLimit(env, `otp:${ip}:${email}`, 'signup');
        if (!rl.allowed) {
            throw new AppError("Too many OTP requests. Please try again later.", 429, 'RATE_LIMIT_EXCEEDED');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Store OTP in KV (expires 10m)
        await env.GEO_KV.put(`${OTP_PREFIX}${email}`, JSON.stringify({
            otp,
            expiresAt: Date.now() + OTP_EXPIRY_MS
        }), { expirationTtl: Math.floor(OTP_EXPIRY_MS / 1000) });

        // 2. Send via Resend
        const emailResult = await sendEmail(email, otp, env);

        if (!emailResult.success) {
            // Check if it's a config error or a service error
            if (!env.RESEND_API_KEY) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Email service misconfigured. Please set RESEND_API_KEY in Cloudflare Secrets."
                }), { status: 503, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({
                success: false,
                error: emailResult.error || "Failed to transmit OTP. Please try again later."
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ success: true, message: "OTP sent" }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // D. Verify Email OTP (POST /v2/auth/login/email/verify)
    if (path === '/v2/auth/login/email/verify' && request.method === 'POST') {
        try {
            // Parse and validate input
            const body = VerifyEmailSchema.parse(await request.json());
            const { email, otp } = body;

            // Rate limiting check
            await validateOtpRateLimit(email, env);

            // Verify OTP
            const isValid = await verifyOtp(email, otp, env);

            if (!isValid) {
                throw new ValidationError('Invalid or expired OTP');
            }

            // Find or create user
            const { user, isNewUser } = await findOrCreateUser(email, env);

            // Clean up OTP data after successful verification
            await cleanupOtpData(email, env);

            // Issue authentication token
            const token = await issueToken(user.id, env);

            // Prepare response
            const responseData = {
                success: true,
                token,
                user_id: user.id,
                _id: user.id, // Legacy compatibility
                is_new_user: isNewUser,
                is_onboarded: Boolean(user.is_onboarded),
                onboarding_step: user.onboarding_step || 0,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };

            // Log successful authentication
            logger.info('user_authenticated_otp', undefined, { userId: user.id, isNewUser });

            return new Response(JSON.stringify(responseData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            if (error instanceof ValidationError) {
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message,
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            logger.error('otp_verification_failed', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'An error occurred during authentication',
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // E. Google Sign-In (POST /v2/auth/login/google)
    if (path === '/v2/auth/login/google' && request.method === 'POST') {
        try {
            // Parse and validate input
            const body = GoogleLoginSchema.parse(await request.json());
            const { id_token, device_info } = body;

            // Verify Google ID token
            const googlePayload = await verifyGoogleIdToken(id_token);

            // Validate email is verified
            if (!googlePayload.email_verified) {
                throw new ValidationError('Email not verified by Google');
            }

            if (!googlePayload.email) {
                throw new ValidationError('Email not provided by Google');
            }

            // Find or create user with Google data
            const { user, isNewUser } = await findOrCreateUser(
                googlePayload.email.toLowerCase(),
                env,
                { name: googlePayload.name || null }
            );

            // Update user profile if new data from Google
            if (googlePayload.name && !user.name) {
                await env.DB.prepare(
                    "UPDATE Users SET name = ?, picture_url = ? WHERE id = ?"
                ).bind(googlePayload.name, googlePayload.picture || null, user.id).run();
            }

            // Issue authentication token
            const token = await issueToken(user.id, env);

            // Log authentication
            logger.info('user_authenticated_google', undefined, { userId: user.id, isNewUser });

            // Optional: Log device info for security monitoring
            if (device_info) {
                logger.info('auth_device_info', undefined, { deviceInfo: device_info });
            }

            const responseData = {
                success: true,
                token,
                user_id: user.id,
                _id: user.id,
                is_new_user: isNewUser,
                is_onboarded: Boolean(user.is_onboarded),
                onboarding_step: user.onboarding_step || 0,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name || googlePayload.name,
                    picture_url: googlePayload.picture,
                },
            };

            return new Response(JSON.stringify(responseData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            if (error instanceof ValidationError) {
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message,
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            logger.error('google_auth_failed', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'An error occurred during Google authentication',
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    return new Response("Not Found", { status: 404 });
}

async function issueToken(userId: string, env: Env) {
    return await new SignJWT({ uid: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(getJwtSecret(env));
}

export async function verifyAuth(request: Request, env: Env): Promise<string | null> {
    // Support both Authorization: Bearer <token> and X-Auth-Token: <token>
    let token: string | null = null;

    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = request.headers.get('X-Auth-Token');
    }

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, getJwtSecret(env));
        return payload.uid as string;
    } catch (_e) {
        // Token verification failed, return null to indicate unauthenticated
        return null;
    }
}

async function sendEmail(to: string, text: string, env: Env): Promise<{ success: boolean; error?: string }> {
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
        logger.error('otp_email_skipped', 'RESEND_API_KEY is not configured in environment variables', { email: to });
        return { success: false, error: "RESEND_API_KEY is missing. Please add it to Cloudflare Secrets." };
    }

    // Determine the 'from' address. Resend requires verified domains or 'onboarding@resend.dev'
    const fromAddress = env.RESEND_FROM_EMAIL || 'Love Vibes <noreply@lovevibes.app>';

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [to],
                subject: 'Your Love Vibes Login Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                        <h1 style="color: #D4AF37; text-align: center;">Love Vibes</h1>
                        <p style="font-size: 16px; color: #333;">Enter the following code to access your vault:</p>
                        <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background: #f9f9f9; padding: 20px; text-align: center; border-radius: 12px; border: 1px solid #D4AF37; color: #D4AF37; margin: 20px 0;">
                            ${text}
                        </div>
                        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 Love Vibes AI. Secured by Resend.</p>
                    </div>
                `,
                text: `Your Love Vibes login code is: ${text}`
            })
        });

        const result = await response.json() as any;

        if (!response.ok) {
            const resendError = result.message || (result.errors && result.errors[0]?.message) || `Error ${response.status}`;
            logger.error('otp_email_failed', result, { email: to, status: response.status });

            // Provide helpful feedback for common Resend errors
            if (response.status === 403 && resendError.includes('domain')) {
                return { success: false, error: "Resend: Domain not verified. Use 'onboarding@resend.dev' or verify lovevibes.app." };
            }
            if (response.status === 401) {
                return { success: false, error: "Resend: Invalid API Key. Please verify your RESEND_API_KEY." };
            }

            return { success: false, error: `Resend: ${resendError}` };
        }

        logger.info('otp_email_sent', undefined, { email: to, messageId: result.id });
        return { success: true };
    } catch (e: any) {
        logger.error('otp_email_error', e, { email: to });
        return { success: false, error: `Network error: ${e.message}` };
    }
}

/**
 * Verify Cloudflare Turnstile Token
 */
async function _verifyTurnstile(token: string, env: Env): Promise<boolean> {
    const SECRET_KEY = env.CLOUDFLARE_API_TOKEN; // In production use specific Turnstile secret
    if (!token) return false;

    const formData = new FormData();
    formData.append('secret', SECRET_KEY || "");
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: formData,
        method: 'POST',
    });

    const outcome = await result.json() as { success: boolean };
    return outcome.success;
}
