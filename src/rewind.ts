// Undo/Rewind Feature
// Allow users to undo their last swipe

import { Env } from './index'

interface SwipeHistory {
    actor_id: string
    target_id: string
    type: string
    timestamp: number
}

// Store last 10 swipes in memory per user session
const swipeHistory = new Map<string, SwipeHistory[]>()

export function recordSwipe(userId: string, targetId: string, type: string): void {
    if (!swipeHistory.has(userId)) {
        swipeHistory.set(userId, [])
    }

    const history = swipeHistory.get(userId)!
    history.unshift({
        actor_id: userId,
        target_id: targetId,
        type,
        timestamp: Date.now(),
    })

    // Keep only last 10 swipes
    if (history.length > 10) {
        history.pop()
    }
}

export async function undoLastSwipe(
    env: Env,
    userId: string,
    isPremium: boolean
): Promise<{ success: boolean; message: string; profile?: any }> {
    const history = swipeHistory.get(userId)

    if (!history || history.length === 0) {
        return { success: false, message: 'No swipes to undo' }
    }

    // Check rewind limit for free users
    if (!isPremium) {
        const today = new Date().toDateString()
        const rewindKey = `rewind:${userId}:${today}`

        const rewindCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM RewindHistory WHERE user_id = ? AND date = ?'
        )
            .bind(userId, today)
            .first()

        if ((rewindCount?.count as number) >= 1) {
            return { success: false, message: 'Free users get 1 rewind per day. Upgrade for unlimited!' }
        }
    }

    try {
        const lastSwipe = history.shift()!

        // Delete the swipe from database
        await env.DB.prepare('DELETE FROM Swipes WHERE actor_id = ? AND target_id = ?')
            .bind(lastSwipe.actor_id, lastSwipe.target_id)
            .run()

        // If it was a match, delete the match too
        if (lastSwipe.type === 'LIKE') {
            await env.DB.prepare(
                'DELETE FROM Matches WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)'
            )
                .bind(userId, lastSwipe.target_id, lastSwipe.target_id, userId)
                .run()
        }

        // Log rewind for free users
        if (!isPremium) {
            const today = new Date().toDateString()
            await env.DB.prepare(
                'INSERT INTO RewindHistory (user_id, date, timestamp) VALUES (?, ?, ?)'
            )
                .bind(userId, today, Math.floor(Date.now() / 1000))
                .run()
        }

        // Get the profile to show again
        const profile = await env.DB.prepare('SELECT * FROM Users WHERE id = ?')
            .bind(lastSwipe.target_id)
            .first()

        return { success: true, message: 'Swipe undone', profile }
    } catch (error) {
        console.error('Undo swipe failed:', error)
        return { success: false, message: 'Failed to undo swipe' }
    }
}
