// Mutual Friend Introduction Protocol
// Leverage real social graphs for trusted introductions

import { Env } from './index'

export interface MutualFriendInfo {
    friend_id: string
    friend_name: string
    connection_type: string
}

// POST /api/social/import-contacts - Import hashed contacts
export async function importContacts(
    env: Env,
    userId: string,
    contacts: Array<{ phone: string; name: string }>
): Promise<{ success: boolean; imported_count: number }> {
    const now = Math.floor(Date.now() / 1000)
    let imported = 0

    try {
        for (const contact of contacts) {
            // Hash phone number for privacy
            const hash = await hashPhoneNumber(contact.phone)

            await env.DB.prepare(
                `INSERT OR IGNORE INTO SocialConnections (user_id, friend_hash, connection_type, friend_name, created_at) 
         VALUES (?, ?, ?, ?, ?)`
            )
                .bind(userId, hash, 'phone', contact.name, now)
                .run()

            imported++
        }

        return { success: true, imported_count: imported }
    } catch (error) {
        console.error('Contact import failed:', error)
        return { success: false, imported_count: 0 }
    }
}

// GET /api/social/mutual-friends/:targetId - Find mutual connections
export async function findMutualFriends(
    env: Env,
    userId: string,
    targetId: string
): Promise<MutualFriendInfo[]> {
    // Find users who are connected to both userId and targetId
    const results = await env.DB.prepare(
        `SELECT DISTINCT u.id, u.name, sc1.connection_type
     FROM SocialConnections sc1
     JOIN SocialConnections sc2 ON sc1.friend_hash = sc2.friend_hash
     JOIN Users u ON u.id = sc1.user_id
     WHERE sc1.user_id != ? 
     AND sc2.user_id != ?
     AND sc1.user_id = sc2.user_id
     AND (
       (sc1.friend_hash IN (SELECT friend_hash FROM SocialConnections WHERE user_id = ?)) AND
       (sc2.friend_hash IN (SELECT friend_hash FROM SocialConnections WHERE user_id = ?))
     )
     LIMIT 10`
    )
        .bind(userId, targetId, userId, targetId)
        .all()

    return results.results.map((r: any) => ({
        friend_id: r.id,
        friend_name: r.name,
        connection_type: r.connection_type,
    }))
}

// POST /api/social/request-intro - Request introduction from mutual friend
export async function requestIntroduction(
    env: Env,
    requesterId: string,
    targetId: string,
    mutualFriendId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const now = Math.floor(Date.now() / 1000)
        const requestId = crypto.randomUUID()

        // Get requester and target names
        const requester = await env.DB.prepare('SELECT name FROM Users WHERE id = ?')
            .bind(requesterId)
            .first()
        const target = await env.DB.prepare('SELECT name FROM Users WHERE id = ?')
            .bind(targetId)
            .first()

        if (!requester || !target) {
            return { success: false, message: 'User not found' }
        }

        // Create introduction request
        await env.DB.prepare(
            `INSERT INTO IntroductionRequests (id, requester_id, target_id, mutual_friend_id, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
        )
            .bind(requestId, requesterId, targetId, mutualFriendId, 'pending', now)
            .run()

        // Send notification to mutual friend
        // await sendPushNotification(mutualFriendId, ...)

        return { success: true, message: 'Introduction request sent!' }
    } catch (error) {
        console.error('Introduction request failed:', error)
        return { success: false, message: 'Failed to send request' }
    }
}

// POST /api/social/respond-intro - Friend responds to introduction request
export async function respondToIntroduction(
    env: Env,
    requestId: string,
    friendId: string,
    response: 'approved' | 'declined',
    message?: string
): Promise<{ success: boolean; match_created?: boolean }> {
    try {
        const now = Math.floor(Date.now() / 1000)

        // Get request details
        const request = await env.DB.prepare(
            'SELECT requester_id, target_id FROM IntroductionRequests WHERE id = ? AND mutual_friend_id = ?'
        )
            .bind(requestId, friendId)
            .first()

        if (!request) {
            return { success: false }
        }

        // Update request status
        await env.DB.prepare(
            'UPDATE IntroductionRequests SET status = ?, friend_message = ?, responded_at = ? WHERE id = ?'
        )
            .bind(response, message || '', now, requestId)
            .run()

        if (response === 'approved') {
            // Create instant match
            const matchId = crypto.randomUUID()
            await env.DB.prepare(
                'INSERT INTO Matches (id, user_a_id, user_b_id, created_at) VALUES (?, ?, ?, ?)'
            )
                .bind(matchId, request.requester_id, request.target_id, now)
                .run()

            // Send notifications to both users
            // await sendPushNotification(request.requester_id, ...)
            // await sendPushNotification(request.target_id, ...)

            return { success: true, match_created: true }
        }

        return { success: true, match_created: false }
    } catch (error) {
        console.error('Introduction response failed:', error)
        return { success: false }
    }
}

async function hashPhoneNumber(phone: string): Promise<string> {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalized = phone.replace(/\D/g, '')

    // Hash with SHA-256
    const encoder = new TextEncoder()
    const data = encoder.encode(normalized)
    const hash = await crypto.subtle.digest('SHA-256', data)

    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}
