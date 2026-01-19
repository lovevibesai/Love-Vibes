// Proximity Alerts - Live Location Meetup System
// Real-time meetup triggers when matched users are nearby

import { Env } from './index'

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

        return {
            success: true,
            message: enabled ? 'Proximity alerts enabled' : 'Proximity alerts disabled',
        }
    } catch (error) {
        console.error('Failed to update proximity settings:', error)
        return { success: false, message: 'Failed to update settings' }
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
            // Create proximity alerts
            const alerts = await createProximityAlerts(env, userId, nearbyMatches)
            return { success: true, nearby_matches: alerts }
        }

        return { success: true }
    } catch (error) {
        console.error('Location update failed:', error)
        return { success: false }
    }
}

async function findNearbyMatches(
    env: Env,
    userId: string,
    userLat: number,
    userLong: number
): Promise<Array<{ user_id: string; distance: number; lat: number; long: number }>> {
    // Get user's matches who have proximity enabled
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

    for (const match of matches.results as any[]) {
        const distance = calculateDistance(userLat, userLong, match.current_lat, match.current_long)
        if (distance <= 500) {
            // Within 500 meters
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
    const expiresAt = now + 1800 // 30 minutes

    const alerts: ProximityAlert[] = []

    for (const match of nearbyMatches) {
        // Get match details
        const matchUser = await env.DB.prepare('SELECT name, main_photo_url FROM Users WHERE id = ?')
            .bind(match.user_id)
            .first()

        if (!matchUser) continue

        // Find nearby venue (mock for now - integrate with Google Places API)
        const venue = await findNearbyVenue(match.lat, match.long)

        // Create alert
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

        alerts.push({
            id: alertId,
            match_name: matchUser.name as string,
            match_photo: matchUser.main_photo_url as string,
            distance_meters: match.distance,
            venue_name: venue.name,
            venue_address: venue.address,
            venue_type: venue.type,
            expires_at: expiresAt,
        })

        // Send push notification
        // await sendPushNotification(match.user_id, ...)
    }

    return alerts
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
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
    // TODO: Integrate with Google Places API
    // For now, return mock venue
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

        return { success: true, message: response === 'accepted' ? 'Meetup confirmed!' : 'Declined' }
    } catch (error) {
        console.error('Failed to respond to alert:', error)
        return { success: false, message: 'Failed to respond' }
    }
}
