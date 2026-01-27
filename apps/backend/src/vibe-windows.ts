// Vibe Windows - Scheduled Matching System
// Time-boxed matching creates scarcity and focused attention

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError } from './errors';
import { logger } from './logger';
import { verifyAuth } from './auth';

// Zod Schemas
const VibeWindowSchema = z.object({
    day_of_week: z.number().int().min(0).max(6),
    start_hour: z.number().int().min(0).max(23),
});

const SetVibeWindowsSchema = z.object({
    windows: z.array(VibeWindowSchema).max(2),
});

export interface VibeWindow {
    day_of_week: number
    start_hour: number
    duration_minutes: number
    is_active: boolean
}

export interface ActiveWindowInfo {
    is_in_window: boolean
    current_window?: VibeWindow
    next_window?: { starts_in_seconds: number; day: string; time: string }
    users_online_now: number
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// POST /api/vibe-windows/set - Set user's vibe windows
export async function setVibeWindows(
    env: Env,
    userId: string,
    windowsRaw: unknown
): Promise<{ success: boolean; message: string }> {
    try {
        const { windows } = SetVibeWindowsSchema.parse(windowsRaw);
        const now = Math.floor(Date.now() / 1000)

        // Delete existing windows
        await env.DB.prepare('DELETE FROM VibeWindows WHERE user_id = ?').bind(userId).run()

        // Insert new windows
        for (const window of windows) {
            await env.DB.prepare(
                'INSERT INTO VibeWindows (user_id, day_of_week, start_hour, duration_minutes, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(userId, window.day_of_week, window.start_hour, 60, true, now).run()
        }

        logger.info('vibe_windows_updated', undefined, { userId, count: windows.length });
        return { success: true, message: 'Vibe windows updated!' }
    } catch (error: unknown) {
        if (error instanceof z.ZodError) throw new ValidationError(error.errors[0].message);
        throw new AppError('Failed to set vibe windows', 500, 'VIBE_UPDATE_FAILED', error instanceof Error ? error : undefined);
    }
}

// GET /api/vibe-windows/status - Check if user is in active window
export async function getVibeWindowStatus(env: Env, userId: string): Promise<ActiveWindowInfo> {
    const now = new Date()
    const currentDay = now.getDay()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const windows = await env.DB.prepare('SELECT * FROM VibeWindows WHERE user_id = ? AND is_active = TRUE').bind(userId).all()

    if (!windows.results || windows.results.length === 0) {
        return { is_in_window: false, users_online_now: 0 }
    }

    const currentWindow = windows.results.find((w: Record<string, unknown>) => {
        if (w.day_of_week !== currentDay) return false
        const windowEnd = Number(w.start_hour) + Math.floor(Number(w.duration_minutes) / 60)
        return currentHour >= Number(w.start_hour) && currentHour < windowEnd
    })

    if (currentWindow) {
        const onlineCount = await getActiveUsersCount(env, currentDay, currentHour)
        return {
            is_in_window: true,
            current_window: currentWindow as unknown as VibeWindow,
            users_online_now: onlineCount,
        }
    }

    const nextWindow = findNextWindow(windows.results as unknown as VibeWindow[], currentDay, currentHour, currentMinute)

    return { is_in_window: false, next_window: nextWindow, users_online_now: 0 }
}

function findNextWindow(windows: VibeWindow[], currentDay: number, currentHour: number, currentMinute: number): { starts_in_seconds: number; day: string; time: string } | undefined {
    let minDiff = Infinity
    let nextWindow: VibeWindow | undefined

    for (const window of windows) {
        let dayDiff = window.day_of_week - currentDay
        if (dayDiff < 0) dayDiff += 7
        if (dayDiff === 0 && window.start_hour <= currentHour) dayDiff = 7

        const totalMinutes = dayDiff * 24 * 60 + (window.start_hour - currentHour) * 60 - currentMinute
        if (totalMinutes > 0 && totalMinutes < minDiff) {
            minDiff = totalMinutes
            nextWindow = window
        }
    }

    if (!nextWindow) return undefined

    return {
        starts_in_seconds: minDiff * 60,
        day: DAYS[nextWindow.day_of_week],
        time: `${nextWindow.start_hour}:00`,
    }
}

async function getActiveUsersCount(env: Env, day: number, hour: number): Promise<number> {
    const result = await env.DB.prepare(
        `SELECT COUNT(DISTINCT user_id) as count 
     FROM VibeWindows 
     WHERE day_of_week = ? 
     AND start_hour <= ? 
     AND (start_hour + duration_minutes / 60) > ? 
     AND is_active = TRUE`
    ).bind(day, hour, hour).first()

    return (result?.count as number) || 0
}

export async function handleVibeWindows(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        if (path === '/v2/vibe-windows/set' && method === 'POST') {
            const body = await request.json();
            const result = await setVibeWindows(env, userId, body);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        if (path === '/v2/vibe-windows/status' && method === 'GET') {
            const result = await getVibeWindowStatus(env, userId);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }
    } catch (e: unknown) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        throw e;
    }

    throw new AppError('Route not found', 404, 'NOT_FOUND');
}
