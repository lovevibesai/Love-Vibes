// Account Recovery
// Password reset and account recovery flows

import { Env } from './index'
import * as jose from 'jose'

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

        // Store reset token
        await env.DB.prepare(
            'INSERT INTO PasswordResetTokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)'
        )
            .bind(user.id, resetToken, expiresAt, Math.floor(Date.now() / 1000))
            .run()

        // TODO: Send email with reset link
        // const resetLink = `https://lovevibes.app/reset-password?token=${resetToken}`
        // await sendEmail(email, 'Password Reset', resetLink)

        return { success: true, message: 'If an account exists, a reset link has been sent' }
    } catch (error) {
        console.error('Password reset request failed:', error)
        return { success: false, message: 'Failed to process request' }
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
            return { success: false, message: 'Invalid or expired reset token' }
        }

        // Hash new password (use bcrypt in production)
        const passwordHash = await hashPassword(newPassword)

        // Update password
        await env.DB.prepare('UPDATE Users SET password_hash = ? WHERE id = ?')
            .bind(passwordHash, resetRecord.user_id)
            .run()

        // Delete used token
        await env.DB.prepare('DELETE FROM PasswordResetTokens WHERE token = ?')
            .bind(token)
            .run()

        return { success: true, message: 'Password reset successfully' }
    } catch (error) {
        console.error('Password reset failed:', error)
        return { success: false, message: 'Failed to reset password' }
    }
}

async function hashPassword(password: string): Promise<string> {
    // Simple hash for demo - use bcrypt in production
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}
