// Profile Prompts API
// Handles prompt library and user responses

import { Env } from './index'

export interface ProfilePrompt {
    id: string
    prompt_text: string
    category: string
    is_active: boolean
}

export interface UserPromptResponse {
    user_id: string
    prompt_id: string
    response_text: string
    display_order: number
    created_at: number
    updated_at: number
}

// GET /api/prompts - Get all available prompts
export async function getPrompts(env: Env): Promise<ProfilePrompt[]> {
    const results = await env.DB.prepare(
        'SELECT id, prompt_text, category, is_active FROM ProfilePrompts WHERE is_active = TRUE ORDER BY category, id'
    ).all()

    return results.results as ProfilePrompt[]
}

// POST /api/user/prompts - Save user's prompt responses
export async function saveUserPrompts(
    env: Env,
    userId: string,
    prompts: Array<{ prompt_id: string; response_text: string; display_order: number }>
): Promise<{ success: boolean; message: string }> {
    if (prompts.length !== 3) {
        return { success: false, message: 'Must select exactly 3 prompts' }
    }

    const now = Math.floor(Date.now() / 1000)

    try {
        // Delete existing responses
        await env.DB.prepare('DELETE FROM UserPromptResponses WHERE user_id = ?').bind(userId).run()

        // Insert new responses
        for (const prompt of prompts) {
            await env.DB.prepare(
                'INSERT INTO UserPromptResponses (user_id, prompt_id, response_text, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
            )
                .bind(userId, prompt.prompt_id, prompt.response_text, prompt.display_order, now, now)
                .run()
        }

        return { success: true, message: 'Prompts saved successfully' }
    } catch (error) {
        console.error('Error saving prompts:', error)
        return { success: false, message: 'Failed to save prompts' }
    }
}

// GET /api/user/:userId/prompts - Get user's responses
export async function getUserPrompts(env: Env, userId: string): Promise<UserPromptResponse[]> {
    const results = await env.DB.prepare(
        `SELECT 
      upr.user_id,
      upr.prompt_id,
      pp.prompt_text,
      upr.response_text,
      upr.display_order,
      upr.created_at,
      upr.updated_at
    FROM UserPromptResponses upr
    JOIN ProfilePrompts pp ON upr.prompt_id = pp.id
    WHERE upr.user_id = ?
    ORDER BY upr.display_order ASC`
    )
        .bind(userId)
        .all()

    return results.results as any[]
}
