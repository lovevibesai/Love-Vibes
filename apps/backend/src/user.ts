/**
 * User Module
 * Handles Profile Updates, Location Pings, and Discovery Preferences
 * Enhanced with CORS support, robust error handling, and schema synchronization
 */

import { Env } from './index';
import { verifyAuth } from './auth';
// @ts-ignore
import { S2 } from 's2-geometry';

// Helper for CORS Headers
function corsHeaders(origin: string | null) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
    };
}

/**
 * Production Ready S2 Logic
 */
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
    const origin = request.headers.get('Origin');

    // 1. Handle Preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders(origin) });
    }

    const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' };

    // 2. Verify Authentication
    let userId: string;
    try {
        const authedId = await verifyAuth(request, env);
        if (!authedId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
        userId = authedId;
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Authentication check failed' }), { status: 401, headers });
    }

    const url = new URL(request.url);

    try {
        // --- GET PROFILE ---
        if (url.pathname === '/user/profile' && request.method === 'GET') {
            const row = await env.DB.prepare(
                `SELECT id, email, name, birth_date, age, bio, gender, interested_in, job_title, company, school,
                 main_photo_url, photo_urls, video_intro_url, credits_balance, subscription_tier,
                 is_verified, verification_status, is_id_verified, trust_score, is_onboarded, onboarding_step, mode,
                 city, location, hometown, height, relationship_goals, interests, drinking, smoking,
                 exercise_frequency, diet, pets, languages, ethnicity, religion, has_children, wants_children, star_sign,
                 last_active FROM Users WHERE id = ?`
            ).bind(userId).first();

            if (!row) {
                return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers });
            }
            return new Response(JSON.stringify(row), { headers });
        }

        // --- LOCATION PING ---
        if (url.pathname === '/user/ping' && request.method === 'POST') {
            const body: any = await request.json();
            const { lat, long } = body;

            if (lat === undefined || long === undefined) {
                return new Response(JSON.stringify({ error: 'Missing lat/long' }), { status: 400, headers });
            }

            const s2CellId = latLonToCellId(lat, long);
            const timestamp = Math.floor(Date.now() / 1000);

            await env.DB.prepare(
                "UPDATE Users SET lat = ?, long = ?, s2_cell_id = ?, last_active = ? WHERE id = ?"
            ).bind(lat, long, s2CellId, timestamp, userId).run();

            // KV Update for fast proximity lookups
            if (env.GEO_KV) {
                await env.GEO_KV.put(`user_loc:${userId}`, s2CellId, { expirationTtl: 86400 });
            }

            return new Response(JSON.stringify({ success: true, cell_id: s2CellId }), { headers });
        }

        // --- PROFILE UPDATE ---
        if (url.pathname === '/user/profile' && request.method === 'PUT') {
            const body: any = await request.json();
            const allowedFields = [
                'name', 'bio', 'mode', 'video_intro_url', 'gender', 'interested_in',
                'city', 'hometown', 'height', 'relationship_goals', 'drinking',
                'smoking', 'exercise_frequency', 'diet', 'pets', 'interests',
                'languages', 'ethnicity', 'religion', 'has_children',
                'wants_children', 'star_sign', 'job_title', 'school', 'company',
                'photo_urls', 'main_photo_url', 'is_verified', 'is_onboarded', 'onboarding_step', 'subscription_tier', 'age'
            ];

            const updates = [];
            const values = [];

            for (const field of allowedFields) {
                if (body[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(body[field]);
                }
            }

            if (updates.length === 0) {
                return new Response(JSON.stringify({ error: 'No valid fields provided' }), { status: 400, headers });
            }

            values.push(userId);
            await env.DB.prepare(`UPDATE Users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

            return new Response(JSON.stringify({ success: true, message: 'Profile updated' }), { headers });
        }

        // --- DISCOVERY PREFERENCES ---
        if (url.pathname === '/user/preferences' && request.method === 'POST') {
            const body: any = await request.json();
            const allowedPrefs = [
                'distance_max', 'age_min', 'age_max', 'height_min', 'height_max',
                'show_me', 'filter_relationship_goals', 'filter_drinking',
                'filter_smoking', 'filter_education', 'filter_zodiac',
                'show_verified_only', 'show_with_video_only', 'min_trust_score'
            ];

            const updates = [];
            const values = [];

            for (const pref of allowedPrefs) {
                if (body[pref] !== undefined) {
                    updates.push(`${pref} = ?`);
                    values.push(typeof body[pref] === 'object' ? JSON.stringify(body[pref]) : body[pref]);
                }
            }

            if (updates.length === 0) {
                return new Response(JSON.stringify({ error: 'No valid preferences' }), { status: 400, headers });
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

            return new Response(JSON.stringify({ success: true, message: 'Preferences updated' }), { headers });
        }

    } catch (err: any) {
        console.error('[USER] Operation failed:', err);
        return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), { status: 404, headers });
}
