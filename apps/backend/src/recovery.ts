// Account Recovery
// Password reset and account recovery flows

import { Env } from './index'
import { z } from 'zod';
import { AppError } from './errors';
import { logger } from './logger';

// Zod Schemas
const RequestResetSchema = z.object({
    email: z.string().email(),
});

const ResetPasswordSchema = z.object({
    token: z.string().uuid(),
    new_password: z.string().min(8).max(100),
});

// PBKDF2 Password Hashing (Cloudflare Workers compatible)
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        passwordKey,
        KEY_LENGTH * 8
    );

    // Format: iterations$salt$hash (all base64)
    const saltB64 = btoa(String.fromCharCode(...salt));
    const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    return `${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [iterations, saltB64, hashB64] = storedHash.split('$');
        if (!iterations || !saltB64 || !hashB64) return false;

        const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
        const expectedHash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));

        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const computedHash = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: parseInt(iterations),
                hash: 'SHA-256',
            },
            passwordKey,
            KEY_LENGTH * 8
        );

        const computedArray = new Uint8Array(computedHash);
        if (computedArray.length !== expectedHash.length) return false;

        let result = 0;
        for (let i = 0; i < computedArray.length; i++) {
            result |= computedArray[i] ^ expectedHash[i];
        }
        return result === 0;
    } catch (_e) {
        return false;
    }
}

// Send password reset email via Resend
async function sendPasswordResetEmail(env: Env, email: string, resetToken: string): Promise<boolean> {
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
        logger.warn('password_reset_email_skipped', 'RESEND_API_KEY not configured', { email });
        return false;
    }

    const resetLink = `https://love-vibes-frontend.pages.dev/reset-password?token=${resetToken}`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Love Vibes <noreply@lovevibes.app>',
                to: [email],
                subject: 'Reset Your Love Vibes Password',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #D4AF37;">Love Vibes</h1>
                        <h2>Password Reset Request</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <a href="${resetLink}" style="display: inline-block; background-color: #D4AF37; color: #1A0814; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
                            Reset Password
                        </a>
                        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border: 1px solid #eee; margin: 24px 0;">
                        <p style="color: #999; font-size: 12px;">Love Vibes - Elite connections, your way</p>
                    </div>
                `
            })
        });

        const result = await response.json() as { id: string };

        if (!response.ok) {
            logger.error('password_reset_email_failed', result, { email });
            return false;
        }

        logger.info('password_reset_email_sent', undefined, { email, messageId: result.id });
        return true;
    } catch (e: unknown) {
        logger.error('password_reset_email_error', e instanceof Error ? e : undefined, { email });
        return false;
    }
}

export async function requestPasswordReset(env: Env, email: string): Promise<{ success: boolean; message: string }> {
    try {
        // Check if user exists
        const user = await env.DB.prepare('SELECT id, email FROM Users WHERE email = ?')
            .bind(email)
            .first()

        if (!user) {
            // Don't reveal if email exists
            return { success: true, message: 'If an account exists, a reset link has been sent' }
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = crypto.randomUUID()
        const expiresAt = Math.floor(Date.now() / 1000) + 3600

        // Delete any existing tokens for this user
        await env.DB.prepare('DELETE FROM PasswordResetTokens WHERE user_id = ?')
            .bind(user.id)
            .run()

        // Store reset token
        await env.DB.prepare(
            'INSERT INTO PasswordResetTokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)'
        )
            .bind(user.id, resetToken, expiresAt, Math.floor(Date.now() / 1000))
            .run()

        // Send email with reset link
        await sendPasswordResetEmail(env, email, resetToken);

        return { success: true, message: 'If an account exists, a reset link has been sent' }
    } catch (error: unknown) {
        throw new AppError('Password reset request failed', 500, 'RESET_REQUEST_FAILED', error instanceof Error ? error : undefined);
    }
}

export async function resetPassword(
    env: Env,
    token: string,
    newPassword: string
): Promise<{ success: boolean; message: string }> {
    try {
        const now = Math.floor(Date.now() / 1000)

        // Verify token
        const resetRecord = await env.DB.prepare(
            'SELECT user_id, expires_at FROM PasswordResetTokens WHERE token = ? AND expires_at > ?'
        )
            .bind(token, now)
            .first()

        if (!resetRecord) {
            throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
        }

        // Hash new password with PBKDF2
        const passwordHash = await hashPassword(newPassword)

        // Update password
        await env.DB.prepare('UPDATE Users SET password_hash = ? WHERE id = ?')
            .bind(passwordHash, resetRecord.user_id)
            .run()

        // Delete used token
        await env.DB.prepare('DELETE FROM PasswordResetTokens WHERE token = ?')
            .bind(token)
            .run()

        logger.info('password_reset_success', undefined, { userId: resetRecord.user_id });
        return { success: true, message: 'Password reset successfully' }
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to reset password', 500, 'RESET_FAILED', error instanceof Error ? error : undefined);
    }
}

// HTTP Handler for recovery routes
export async function handleRecovery(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        // POST /v2/recovery/request - Request password reset
        if (path.endsWith('/request') && method === 'POST') {
            const body = RequestResetSchema.parse(await request.json());
            const result = await requestPasswordReset(env, body.email);
            return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }

        // POST /v2/recovery/reset - Reset password with token
        if (path.endsWith('/reset') && method === 'POST') {
            const body = ResetPasswordSchema.parse(await request.json());
            const result = await resetPassword(env, body.token, body.new_password);
            return new Response(JSON.stringify(result), { headers: jsonHeaders });
        }
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            throw new AppError(e.errors[0].message, 400, 'VALIDATION_ERROR');
        }
        throw e;
    }

    throw new AppError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}
