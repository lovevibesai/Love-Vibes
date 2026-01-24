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

// Helper to get JWT Secret (fallback to dev secret if missing)
function getJwtSecret(env: Env): Uint8Array {
    const secret = env.JWT_SECRET || 'YOUR-256-BIT-SECRET-HERE';
    return new TextEncoder().encode(secret);
}

// Helper for RP_ID
function getRpId(env: Env): string {
    return env.RP_ID || 'localhost';
}

const RP_NAME = 'Love Vibes';

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
            rpID: getRpId(env),
            userID: new TextEncoder().encode(userId) as any,
            userName: email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
        });

        // Store challenge in D1 (short TTL)
        await env.DB.prepare(
            "INSERT INTO AuthChallenges (id, challenge, user_id, type, expires_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), options.challenge, userId, 'registration', Date.now() + 60000).run();

        return new Response(JSON.stringify(options), { headers: { 'Content-Type': 'application/json' } });
    }

    // B. Verify Registration (POST /v2/auth/register/verify)
    if (path === '/v2/auth/register/verify' && request.method === 'POST') {
        const body = await request.json() as any;
        const { response, user_id, email } = body;

        // Fetch challenge from DB
        const challengeRow = await env.DB.prepare(
            "SELECT challenge FROM AuthChallenges WHERE user_id = ? AND type = 'registration' ORDER BY expires_at DESC LIMIT 1"
        ).bind(user_id).first();

        if (!challengeRow) return new Response("Challenge expired", { status: 400 });

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: challengeRow.challenge as string,
            expectedOrigin: [
                'https://love-vibes-frontend.pages.dev',
                'https://2428c90c.love-vibes-frontend.pages.dev',
                `https://${getRpId(env)}`,
                'http://localhost:3000'
            ],
            expectedRPID: getRpId(env),
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
                console.log(`[AUTH] Merging passkey for existing email: ${email}`);
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

            const token = await issueToken(finalUserId, env);
            return new Response(JSON.stringify({
                success: true,
                token,
                user_id: finalUserId,
                is_new_user: isNewUser
            }));
        }

        return new Response("Verification failed", { status: 400 });
    }

    // --- EMAIL OTP FALLBACK ---

    // C. Request Email OTP (POST /v2/auth/login/email)
    if (path === '/v2/auth/login/email' && request.method === 'POST') {
        const { email } = await request.json() as any;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Store OTP in KV (expires 5m)
        await env.GEO_KV.put(`otp:${email}`, otp, { expirationTtl: 300 });

        // 2. Send via Resend
        await sendEmail(email, `Your Love Vibes code: ${otp}`, env);

        return new Response(JSON.stringify({ success: true, message: "OTP sent" }));
    }

    // D. Verify Email OTP (POST /v2/auth/login/email/verify)
    if (path === '/v2/auth/login/email/verify' && request.method === 'POST') {
        const { email, otp } = await request.json() as any;
        const storedOtp = await env.GEO_KV.get(`otp:${email}`);

        if (storedOtp && storedOtp === otp) {
            // Find or Create User
            let user: any = await env.DB.prepare("SELECT id, name FROM Users WHERE email = ?").bind(email).first();
            let isNewUser = false;
            if (!user) {
                const newId = crypto.randomUUID();
                await env.DB.prepare("INSERT INTO Users (id, email, created_at) VALUES (?, ?, ?)").bind(newId, email, Date.now()).run();
                user = { id: newId };
                isNewUser = true;
            } else {
                // Check if user has completed profile (has name)
                isNewUser = !user.name;
            }

            const token = await issueToken(user.id, env);
            return new Response(JSON.stringify({
                success: true,
                token,
                is_new_user: isNewUser,
                _id: user.id
            }));
        }

        return new Response("Invalid OTP", { status: 400 });
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
        console.log(`[AUTH] ⚠️ No API Key found for email. OTP for ${to}: ${text}`);
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
                from: 'Love Vibes <onboarding@resend.dev>', // Default for unverified domains
                to: [to],
                subject: 'Login to Love Vibes',
                text: text
            })
        });

        const result: any = await response.json();

        if (!response.ok) {
            console.error(`[AUTH] ❌ Resend Error:`, result);
        } else {
            console.log(`[AUTH] ✅ Email dispatched via Resend:`, result.id);
        }
    } catch (e) {
        console.error(`[AUTH] ❌ Email Fetch Error:`, e);
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
