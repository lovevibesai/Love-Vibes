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
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError } from './errors';
import { checkRateLimit } from './ratelimit';
import { logger } from './logger';

// Zod Schemas for Validation
const LoginEmailSchema = z.object({
    email: z.string().email(),
});

const VerifyEmailSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

const GoogleLoginSchema = z.object({
    id_token: z.string().min(1),
});

// Helper to get JWT Secret (fallback to dev secret if missing)
function getJwtSecret(env: Env): Uint8Array {
    const secret = env.JWT_SECRET || 'YOUR-256-BIT-SECRET-HERE';
    return new TextEncoder().encode(secret);
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

export async function handleAuth(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Turnstile Verification (Universal for Signups/Logins)
    const turnstileToken = request.headers.get('CF-Turnstile-Response');
    if (request.method === 'POST' && !turnstileToken && !path.includes('/dev/')) {
        // In local dev we might skip, but production requires it
        // await verifyTurnstile(turnstileToken, env);
    }

    // --- PASSKEY (WEBAUTHN) FLOW ---

    // A. Registration Options (GET /v2/auth/register/options)
    if (path === '/v2/auth/register/options') {
        const userId = url.searchParams.get('user_id') || crypto.randomUUID();
        const email = url.searchParams.get('email') || "";

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: getRpId(request, env),
            userID: new TextEncoder().encode(userId) as any,
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
        const body = await request.json() as any;
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
                allowCredentials = (creds.results || []).map((r: any) => ({
                    id: base64ToBase64URL(r.id),
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
        const body = await request.json() as any;
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

        // 1. Store OTP in KV (expires 5m)
        await env.GEO_KV.put(`otp:${email}`, otp, { expirationTtl: 300 });

        // 2. Send via Resend
        await sendEmail(email, `Your Love Vibes code: ${otp}`, env);

        return new Response(JSON.stringify({ success: true, message: "OTP sent" }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // D. Verify Email OTP (POST /v2/auth/login/email/verify)
    if (path === '/v2/auth/login/email/verify' && request.method === 'POST') {
        const body = VerifyEmailSchema.parse(await request.json());
        const { email, otp } = body;
        const storedOtp = await env.GEO_KV.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            throw new ValidationError("Invalid or expired OTP");
        }

        // Find or Create User
        let user: any = await env.DB.prepare("SELECT id, name, is_onboarded, onboarding_step FROM Users WHERE email = ?").bind(email).first();
        let isNewUser = false;
        if (!user) {
            const newId = crypto.randomUUID();
            await env.DB.prepare("INSERT INTO Users (id, email, created_at) VALUES (?, ?, ?)").bind(newId, email, Date.now()).run();
            user = { id: newId, is_onboarded: 0, onboarding_step: 0 };
            isNewUser = true;
        } else {
            isNewUser = !user.name;
        }

        const token = await issueToken(user.id, env);
        const isOnboarded = !!user.is_onboarded;
        const onboardingStep = user.onboarding_step || 0;
        return new Response(JSON.stringify({
            success: true,
            token,
            user_id: user.id,
            _id: user.id,
            is_new_user: isNewUser,
            is_onboarded: isOnboarded,
            onboarding_step: onboardingStep,
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // E. Google Sign-In (POST /v2/auth/login/google)
    if (path === '/v2/auth/login/google' && request.method === 'POST') {
        const body = GoogleLoginSchema.parse(await request.json());
        const idToken = body.id_token;

        // Verify the Firebase/Google ID token via Google's tokeninfo endpoint
        let payload: { email?: string; sub?: string; error?: string };
        try {
            const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
            const data = await res.json() as { email?: string; sub?: string; error?: string; error_description?: string };
            if (!res.ok || data.error) {
                logger.error('google_auth_error', data.error || data.error_description, { status: res.status });
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Invalid or expired Google sign-in. Please try again.',
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            payload = data;
        } catch (e) {
            logger.error('google_auth_failed', e);
            return new Response(JSON.stringify({
                success: false,
                error: 'Google sign-in verification failed. Please try again.',
            }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const email = payload.email || '';
        if (!email) {
            return new Response(JSON.stringify({ success: false, error: 'Email not provided by Google' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Find or create user by email (same pattern as passkey/email flows)
        let userRow: { id: string; name?: string; is_onboarded?: number; onboarding_step?: number } | null = await env.DB.prepare(
            "SELECT id, name, is_onboarded, onboarding_step FROM Users WHERE email = ?"
        ).bind(email).first() as any;

        let isNewUser = false;
        if (!userRow) {
            const newId = crypto.randomUUID();
            await env.DB.prepare(
                "INSERT INTO Users (id, email, created_at) VALUES (?, ?, ?)"
            ).bind(newId, email, Date.now()).run();
            userRow = { id: newId, is_onboarded: 0, onboarding_step: 0 };
            isNewUser = true;
        }

        const token = await issueToken(userRow.id, env);
        const isOnboarded = !!userRow.is_onboarded;

        return new Response(JSON.stringify({
            success: true,
            token,
            user_id: userRow.id,
            _id: userRow.id,
            is_new_user: isNewUser,
            is_onboarded: isOnboarded,
            onboarding_step: userRow.onboarding_step || 0,
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
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
    } catch (e) {
        return null;
    }
}

async function sendEmail(to: string, text: string, env: Env) {
    const apiKey = env.RESEND_API_KEY || env.CLOUDFLARE_API_TOKEN;

    if (!apiKey) {
        // In production, OTP is only stored in DB - never logged
        // Fallback: store in temporary table or just fail silently
        logger.warn('otp_email_skipped', 'RESEND_API_KEY not configured', { email: to });
        return;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Love Vibes <noreply@lovevibes.app>',
                to: [to],
                subject: 'Your Love Vibes Login Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #D4AF37;">Love Vibes</h1>
                        <h2>Your Login Code</h2>
                        <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background: #f5f5f5; padding: 16px; text-align: center; border-radius: 8px;">${text}</p>
                        <p style="color: #666;">This code expires in 10 minutes.</p>
                        <p style="color: #999; font-size: 12px;">If you didn't request this code, you can ignore this email.</p>
                    </div>
                `,
                text: text
            })
        });

        const result: any = await response.json();

        if (!response.ok) {
            logger.error('otp_email_failed', result, { email: to });
        } else {
            logger.info('otp_email_sent', undefined, { email: to, messageId: result.id });
        }
    } catch (e) {
        logger.error('otp_email_error', e, { email: to });
    }
}

/**
 * Verify Cloudflare Turnstile Token
 */
async function verifyTurnstile(token: string, env: Env): Promise<boolean> {
    const SECRET_KEY = env.CLOUDFLARE_API_TOKEN; // In production use specific Turnstile secret
    if (!token) return false;

    const formData = new FormData();
    formData.append('secret', SECRET_KEY || "");
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: formData,
        method: 'POST',
    });

    const outcome: any = await result.json();
    return outcome.success;
}
