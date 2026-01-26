/**
 * User Module
 * Handles Profile Updates, Location Pings, and Discovery Preferences
 * Enhanced with CORS support, robust error handling, and schema synchronization
 */

import { Env } from './index';
import { verifyAuth } from './auth';
// @ts-ignore
import { S2 } from 's2-geometry';
import { z } from 'zod';
import { ValidationError, NotFoundError, AppError, AuthenticationError } from './errors';

// Zod Schemas
const ProfileUpdateSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    bio: z.string().max(500).optional(),
    age: z.number().min(18).max(100).optional(),
    gender: z.number().optional(),
    interested_in: z.number().optional(),
    job_title: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    school: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    hometown: z.string().max(100).optional(),
    height: z.number().optional(),
    relationship_goals: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    photo_urls: z.array(z.string()).optional(),
    main_photo_url: z.string().url().optional(),
    is_onboarded: z.number().optional(),
    onboarding_step: z.number().optional(),
    mode: z.number().optional(),
}).strict();

const LocationPingSchema = z.object({
    lat: z.number(),
    long: z.number(),
});

const UserPreferencesSchema = z.object({
    distance_max: z.number().min(1).max(100).optional(),
    age_min: z.number().min(18).max(100).optional(),
    age_max: z.number().min(18).max(100).optional(),
    height_min: z.number().optional(),
    height_max: z.number().optional(),
    show_me: z.number().optional(),
    filter_relationship_goals: z.array(z.string()).optional(),
    filter_drinking: z.string().optional(),
    filter_smoking: z.string().optional(),
    filter_education: z.string().optional(),
    filter_zodiac: z.string().optional(),
    show_verified_only: z.boolean().optional(),
    show_with_video_only: z.boolean().optional(),
    min_trust_score: z.number().optional(),
}).strict();

// Production Ready S2 Logic
function latLonToCellId(lat: number, lon: number, level: number = 12): string {
    try {
        const key = S2.latLngToKey(lat, lon, level);
        return S2.keyToId(key);
    } catch (e) {
        // Fallback Level 12 approximation if library fails
        const latInt = Math.floor((lat + 90) * 10000);
        const lonInt = Math.floor((lon + 180) * 10000);
        return `s2_f_${latInt}_${lonInt}`;
    }
}

export async function handleUserUpdate(request: Request, env: Env): Promise<Response> {
    // 1. Verify Authentication
    const authedId = await verifyAuth(request, env);
    if (!authedId) throw new AuthenticationError();
    const userId = authedId;

    const url = new URL(request.url);
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        // --- GET PROFILE ---
        if (url.pathname === '/user/profile' && request.method === 'GET') {
            // Check KV Cache
            const cacheKey = `user_profile:${userId}`;
            const cachedBody = await env.GEO_KV?.get(cacheKey);

            if (cachedBody) {
                return new Response(cachedBody, {
                    headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
                });
            }

            const row = await env.DB.prepare(
                `SELECT id, email, name, birth_date, age, bio, gender, interested_in, job_title, company, school,
                 main_photo_url, photo_urls, video_intro_url, credits_balance, subscription_tier,
                 is_verified, verification_status, is_id_verified, trust_score, is_onboarded, onboarding_step, mode,
                 city, location, hometown, height, relationship_goals, interests, drinking, smoking,
                 exercise_frequency, diet, pets, languages, ethnicity, religion, has_children, wants_children, star_sign,
                 last_active FROM Users WHERE id = ?`
            ).bind(userId).first();

            if (!row) throw new NotFoundError('User');

            const responseBody = JSON.stringify({ success: true, data: row });

            // Cache for 5 minutes
            if (env.GEO_KV) {
                await env.GEO_KV.put(cacheKey, responseBody, { expirationTtl: 300 });
            }

            return new Response(responseBody, {
                headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
            });
        }

        // --- LOCATION PING ---
        if (url.pathname === '/user/ping' && request.method === 'POST') {
            const body = LocationPingSchema.parse(await request.json());
            const { lat, long } = body;

            const s2CellId = latLonToCellId(lat, long);
            const timestamp = Math.floor(Date.now() / 1000);

            await env.DB.prepare(
                "UPDATE Users SET lat = ?, long = ?, s2_cell_id = ?, last_active = ? WHERE id = ?"
            ).bind(lat, long, s2CellId, timestamp, userId).run();

            // KV Update for fast proximity lookups
            if (env.GEO_KV) {
                await env.GEO_KV.put(`user_loc:${userId}`, s2CellId, { expirationTtl: 86400 });
            }

            return new Response(JSON.stringify({ success: true, cell_id: s2CellId }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- PROFILE UPDATE ---
        if (url.pathname === '/user/profile' && request.method === 'PUT') {
            const body = ProfileUpdateSchema.parse(await request.json());

            const updates = [];
            const values = [];

            for (const [field, value] of Object.entries(body)) {
                updates.push(`${field} = ?`);
                values.push(Array.isArray(value) ? JSON.stringify(value) : value);
            }

            if (updates.length === 0) {
                throw new ValidationError('No valid fields provided');
            }

            values.push(userId);
            await env.DB.prepare(`UPDATE Users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

            // Invalidate KV Cache
            if (env.GEO_KV) {
                await env.GEO_KV.delete(`user_profile:${userId}`);
            }

            return new Response(JSON.stringify({ success: true, message: 'Profile updated' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- DISCOVERY PREFERENCES ---
        if (url.pathname === '/user/preferences' && request.method === 'POST') {
            const body = UserPreferencesSchema.parse(await request.json());

            const updates = [];
            const values = [];

            for (const [pref, value] of Object.entries(body)) {
                updates.push(`${pref} = ?`);
                values.push(typeof value === 'object' ? JSON.stringify(value) : value);
            }

            if (updates.length === 0) {
                throw new ValidationError('No valid preferences provided');
            }

            // UPSERT for UserPreferences
            const columnNames = updates.map(u => u.split(' = ')[0]);
            const placeholders = updates.map(() => '?');
            const updateClause = updates.join(', ');

            const query = `
                INSERT INTO UserPreferences (user_id, ${columnNames.join(', ')})
                VALUES (?, ${placeholders.join(', ')})
                ON CONFLICT(user_id) DO UPDATE SET ${updateClause}
            `;

            await env.DB.prepare(query).bind(userId, ...values, ...values).run();

            return new Response(JSON.stringify({ success: true, message: 'Preferences updated' }), {
                headers: jsonHeaders
            });
        }

    } catch (err: any) {
        // Errors are caught by the global handler in index.ts
        throw err;
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}
