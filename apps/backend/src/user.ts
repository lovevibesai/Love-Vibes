/**
 * User Module
 * Handles Profile Updates and Location Pings (Geosharding Update)
 */
import { Env } from './index';
import { verifyAuth } from './auth';
// @ts-ignore
import { S2 } from 's2-geometry';

// Production Ready S2 Logic
function latLonToCellId(lat: number, lon: number, level: number = 12): string {
    const key = S2.latLngToKey(lat, lon, level);
    return S2.keyToId(key);
}

export async function handleUserUpdate(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);

    // 1. Location Ping (POST /user/ping)
    // This updates the user's Geoshard (S2 Cell)
    if (url.pathname === '/user/ping' && request.method === 'POST') {
        const body: any = await request.json();
        const { lat, long } = body;

        if (!lat || !long) return new Response("Missing lat/long", { status: 400 });

        const s2CellId = latLonToCellId(lat, long);
        const timestamp = Date.now();

        await env.DB.prepare(
            "UPDATE Users SET lat = ?, long = ?, s2_cell_id = ?, last_active = ? WHERE id = ?"
        ).bind(lat, long, s2CellId, timestamp, userId).run();

        // Ideally updating KV here too for faster lookups
        await env.GEO_KV.put(`user_loc:${userId}`, s2CellId);

        return new Response(JSON.stringify({ status: "updated", cell_id: s2CellId }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Profile Update (PUT /user/profile)
    // Handles Love Vibes specific fields like 'mode' (Friendship/Dating)
    if (url.pathname === '/user/profile' && request.method === 'PUT') {
        const body: any = await request.json();
        // Only allow specific fields to be updated - Expanded for World Class Features
        const allowedFields = [
            'name', 'bio', 'mode', 'video_intro_url', 'gender', 'interested_in',
            'city', 'hometown', 'height', 'relationship_goals', 'drinking',
            'smoking', 'exercise_frequency', 'diet', 'pets', 'interests',
            'languages', 'ethnicity', 'religion', 'has_children',
            'wants_children', 'star_sign', 'job_title', 'school', 'company',
            'photo_urls', 'main_photo_url', 'is_verified', 'is_onboarded', 'subscription_tier'
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(body[field]);
            }
        }

        if (updates.length === 0) return new Response("No valid fields", { status: 400 });

        values.push(userId); // For WHERE clause

        await env.DB.prepare(
            `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...values).run();

        return new Response(JSON.stringify({ status: "updated" }));
    }

    // 3. Discovery Preferences (POST /user/preferences)
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

        if (updates.length === 0) return new Response("No valid preferences", { status: 400 });

        values.push(userId);

        // Use UPSERT logic for UserPreferences
        const query = `
            INSERT INTO UserPreferences (user_id, ${updates.map(u => u.split(' = ')[0]).join(', ')})
            VALUES (?, ${updates.map(() => '?').join(', ')})
            ON CONFLICT(user_id) DO UPDATE SET ${updates.join(', ')}
        `;

        const upsertParams = [userId, ...values.slice(0, -1), ...values.slice(0, -1)];

        await env.DB.prepare(query).bind(...upsertParams).run();

        return new Response(JSON.stringify({ status: "updated" }));
    }

    return new Response("Not Found", { status: 404 });
}
