// Proximity Alerts - Live Location Meetup System
// Real-time meetup triggers when matched users are nearby

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError, NotFoundError } from './errors';
import { logger } from './logger';
import { verifyAuth } from './auth';

// Zod Schemas
const EnableProximitySchema = z.object({
    enabled: z.boolean(),
});

const UpdateLocationSchema = z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
});

const RespondAlertSchema = z.object({
    alert_id: z.string().uuid(),
    response: z.enum(['accepted', 'declined']),
});

export interface ProximityAlert {
    id: string
    match_name: string
    match_photo: string
    distance_meters: number
    venue_name: string
    venue_address: string
    venue_type: string
    expires_at: number
}

// POST /api/proximity/enable - Opt-in to proximity tracking
export async function enableProximity(
    env: Env,
    userId: string,
    enabled: boolean
): Promise<{ success: boolean; message: string }> {
    try {
        const now = Math.floor(Date.now() / 1000)

        await env.DB.prepare(
            `INSERT INTO ProximitySettings (user_id, enabled, last_updated) 
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) 
       DO UPDATE SET enabled = ?, last_updated = ?`
        )
            .bind(userId, enabled, now, enabled, now)
            .run()

        logger.info('proximity_toggled', undefined, { userId, enabled });
        return {
            success: true,
            message: enabled ? 'Proximity alerts enabled' : 'Proximity alerts disabled',
        }
    } catch (error: any) {
        throw new AppError('Failed to enable/disable proximity', 500, 'PROXIMITY_UPDATE_FAILED', error);
    }
}

// POST /api/proximity/update-location - Update current location
export async function updateLocation(
    env: Env,
    userId: string,
    lat: number,
    long: number
): Promise<{ success: boolean; nearby_matches?: ProximityAlert[] }> {
    const now = Math.floor(Date.now() / 1000)

    try {
        // Update user's location
        await env.DB.prepare(
            'UPDATE ProximitySettings SET current_lat = ?, current_long = ?, last_updated = ? WHERE user_id = ? AND enabled = TRUE'
        )
            .bind(lat, long, now, userId)
            .run()

        // Find nearby matched users
        const nearbyMatches = await findNearbyMatches(env, userId, lat, long)

        if (nearbyMatches.length > 0) {
            const alerts = await createProximityAlerts(env, userId, nearbyMatches)
            return { success: true, nearby_matches: alerts }
        }

        return { success: true }
    } catch (error: any) {
        throw new AppError('Failed to update location', 500, 'LOCATION_UPDATE_FAILED', error);
    }
}

async function findNearbyMatches(
    env: Env,
    userId: string,
    userLat: number,
    userLong: number
): Promise<Array<{ user_id: string; distance: number; lat: number; long: number }>> {
    const matches = await env.DB.prepare(
        `SELECT DISTINCT 
       CASE 
         WHEN m.user_a_id = ? THEN m.user_b_id 
         ELSE m.user_a_id 
       END as match_id,
       ps.current_lat,
       ps.current_long
     FROM Matches m
     JOIN ProximitySettings ps ON (
       (m.user_a_id = ? AND ps.user_id = m.user_b_id) OR
       (m.user_b_id = ? AND ps.user_id = m.user_a_id)
     )
     WHERE (m.user_a_id = ? OR m.user_b_id = ?)
     AND ps.enabled = TRUE
     AND ps.current_lat IS NOT NULL
     AND ps.current_long IS NOT NULL
     AND ps.last_updated > ?`
    )
        .bind(userId, userId, userId, userId, userId, Math.floor(Date.now() / 1000) - 3600) // Within last hour
        .all()

    const nearby: Array<{ user_id: string; distance: number; lat: number; long: number }> = []

    for (const match of (matches.results || []) as any[]) {
        const distance = calculateDistance(userLat, userLong, match.current_lat, match.current_long)
        if (distance <= 500) {
            nearby.push({
                user_id: match.match_id,
                distance: Math.round(distance),
                lat: match.current_lat,
                long: match.current_long,
            })
        }
    }

    return nearby
}

async function createProximityAlerts(
    env: Env,
    userId: string,
    nearbyMatches: Array<{ user_id: string; distance: number; lat: number; long: number }>
): Promise<ProximityAlert[]> {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 1800

    const alerts: ProximityAlert[] = []

    for (const match of nearbyMatches) {
        const matchUser = await env.DB.prepare('SELECT name, main_photo_url FROM Users WHERE id = ?')
            .bind(match.user_id)
            .first()

        if (!matchUser) continue

        const venue = await findNearbyVenue(match.lat, match.long)

        const alertId = crypto.randomUUID()
        await env.DB.prepare(
            `INSERT INTO ProximityAlerts 
       (id, user_a_id, user_b_id, distance_meters, venue_name, venue_address, venue_type, status, created_at, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                alertId,
                userId,
                match.user_id,
                match.distance,
                venue.name,
                venue.address,
                venue.type,
                'sent',
                now,
                expiresAt
            )
            .run()

        const alert = {
            id: alertId,
            match_name: matchUser.name as string,
            match_photo: matchUser.main_photo_url as string,
            distance_meters: match.distance,
            venue_name: venue.name,
            venue_address: venue.address,
            venue_type: venue.type,
            expires_at: expiresAt,
        };
        alerts.push(alert)
        logger.info('proximity_alert_created', undefined, { alertId, userId, matchId: match.user_id });
    }

    return alerts
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

async function findNearbyVenue(lat: number, long: number): Promise<{
    name: string
    address: string
    type: string
}> {
    return {
        name: 'Starbucks',
        address: '123 Main St',
        type: 'cafe',
    }
}

// POST /api/proximity/respond - Accept/decline meetup
export async function respondToProximityAlert(
    env: Env,
    alertId: string,
    userId: string,
    response: 'accepted' | 'declined'
): Promise<{ success: boolean; message: string }> {
    try {
        await env.DB.prepare('UPDATE ProximityAlerts SET status = ? WHERE id = ? AND user_b_id = ?')
            .bind(response, alertId, userId)
            .run()

        logger.info('proximity_response', undefined, { alertId, userId, response });
        return { success: true, message: response === 'accepted' ? 'Meetup confirmed!' : 'Declined' }
    } catch (error: any) {
        throw new AppError('Failed to respond to proximity alert', 500, 'PROXIMITY_RESPOND_FAILED', error);
    }
}

export async function handleProximity(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        if (path === '/v2/proximity/enable' && method === 'POST') {
            const body = EnableProximitySchema.parse(await request.json());
            const result = await enableProximity(env, userId, body.enabled);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        if (path === '/v2/proximity/update' && method === 'POST') {
            const body = UpdateLocationSchema.parse(await request.json());
            const result = await updateLocation(env, userId, body.lat, body.long);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        if (path === '/v2/proximity/respond' && method === 'POST') {
            const body = RespondAlertSchema.parse(await request.json());
            const result = await respondToProximityAlert(env, body.alert_id, userId, body.response);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }
    } catch (e: any) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        throw e;
    }

    throw new NotFoundError("Proximity route");
}
