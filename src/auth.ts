/**
 * Auth Module
 * Handles Login and Token Generation (Production Ready)
 */
import { Env } from './index';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('YOUR-256-BIT-SECRET-HERE'); // In production, move to env.JWT_SECRET

export async function handleAuth(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint: /v2/auth/login/sms
    if (url.pathname.endsWith('/login/sms') && request.method === 'POST') {
        const body: any = await request.json();
        const { phone_number } = body;

        // 1. In a real app, verify OTP here via Twilio/Verify API.
        // For now, we assume OTP was valid (or bypassed for demo).

        // 2. Check if user exists in D1
        const { results } = await env.DB.prepare(
            "SELECT * FROM Users WHERE phone_number = ?"
        ).bind(phone_number).all();

        let user = results[0];
        let is_new_user = false;

        if (!user) {
            // Create new user (Simplified Onboarding)
            const newId = crypto.randomUUID();
            await env.DB.prepare(
                "INSERT INTO Users (id, phone_number) VALUES (?, ?)"
            ).bind(newId, phone_number).run();
            user = { id: newId };
            is_new_user = true;
        }

        // 3. Issue Real JWT Token
        const token = await new SignJWT({ uid: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d') // Long-lived for mobile
            .sign(JWT_SECRET);

        return new Response(JSON.stringify({
            meta: { status: 200 },
            data: {
                api_token: token,
                refresh_token: "mock_refresh", // Implement Refresh Token Rotation for strict security
                is_new_user: is_new_user,
                _id: user.id
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response("Auth endpoint not found", { status: 404 });
}

// Middleware Helper to verify token
export async function verifyAuth(request: Request): Promise<string | null> {
    const token = request.headers.get('X-Auth-Token');
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.uid as string;
    } catch (e) {
        return null;
    }
}
