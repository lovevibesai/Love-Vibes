// Success Stories System
// Public success stories and testimonials

import { Env } from './index'

export interface SuccessStory {
    id: string
    user_a_name: string
    user_b_name: string
    user_a_photo: string
    user_b_photo: string
    story_text: string
    relationship_length: string // "6 months", "1 year", etc.
    wedding_fund_contributed: boolean
    is_featured: boolean
    created_at: number
    approved: boolean
}

// POST /api/success-stories/submit - Submit a success story
export async function submitSuccessStory(
    env: Env,
    userId: string,
    story: {
        partner_id: string
        story_text: string
        relationship_length: string
    }
): Promise<{ success: boolean; message: string }> {
    try {
        const now = Math.floor(Date.now() / 1000)
        const storyId = crypto.randomUUID()

        // Get user details
        const user = await env.DB.prepare('SELECT name, main_photo_url FROM Users WHERE id = ?')
            .bind(userId)
            .first()

        const partner = await env.DB.prepare('SELECT name, main_photo_url FROM Users WHERE id = ?')
            .bind(story.partner_id)
            .first()

        if (!user || !partner) {
            return { success: false, message: 'User not found' }
        }

        // Insert story (pending approval)
        await env.DB.prepare(
            `INSERT INTO SuccessStories 
      (id, user_a_id, user_b_id, user_a_name, user_b_name, user_a_photo, user_b_photo, 
       story_text, relationship_length, approved, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                storyId,
                userId,
                story.partner_id,
                user.name,
                partner.name,
                user.main_photo_url,
                partner.main_photo_url,
                story.story_text,
                story.relationship_length,
                false,
                now
            )
            .run()

        return { success: true, message: 'Story submitted for review!' }
    } catch (error) {
        console.error('Story submission failed:', error)
        return { success: false, message: 'Failed to submit story' }
    }
}

// GET /api/success-stories - Get approved success stories
export async function getSuccessStories(env: Env, limit: number = 20): Promise<SuccessStory[]> {
    const results = await env.DB.prepare(
        `SELECT * FROM SuccessStories 
     WHERE approved = TRUE 
     ORDER BY is_featured DESC, created_at DESC 
     LIMIT ?`
    )
        .bind(limit)
        .all()

    return results.results as SuccessStory[]
}
