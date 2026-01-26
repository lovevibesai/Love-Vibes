// Profile Prompts API
// Handles prompt library and user responses

import { Env } from './index'
import { z } from 'zod';
import { ValidationError, AppError } from './errors';
import { logger } from './logger';

const PromptResponseSchema = z.object({
    prompt_id: z.string().min(1),
    response_text: z.string().min(1).max(200),
    display_order: z.number().int().min(0).max(2),
});

const SavePromptsSchema = z.array(PromptResponseSchema).length(3);

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
    try {
        const results = await env.DB.prepare(
            'SELECT id, prompt_text, category, is_active FROM ProfilePrompts WHERE is_active = TRUE ORDER BY category, id'
        ).all()

        return results.results as unknown as ProfilePrompt[]
    } catch (e: any) {
        throw new AppError('Failed to fetch prompts', 500, 'FETCH_PROMPTS_ERROR', e);
    }
}

// POST /api/user/prompts - Save user's prompt responses
export async function saveUserPrompts(
    env: Env,
    userId: string,
    promptsRaw: any
): Promise<{ success: boolean; message: string }> {
    try {
        const prompts = SavePromptsSchema.parse(promptsRaw);
        const now = Math.floor(Date.now() / 1000)

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

        logger.info('prompts_saved', undefined, { userId, count: prompts.length });
        return { success: true, message: 'Prompts saved successfully' }
    } catch (error) {
        if (error instanceof z.ZodError) throw new ValidationError(error.errors[0].message);
        if (error instanceof AppError) throw error;
        throw new AppError('Save prompts failed', 500, 'SAVE_PROMPTS_ERROR', error);
    }
}

// GET /api/user/:userId/prompts - Get user's responses
export async function getUserPrompts(env: Env, userId: string): Promise<UserPromptResponse[]> {
    try {
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
    } catch (e: any) {
        throw new AppError('Failed to fetch user prompts', 500, 'FETCH_USER_PROMPTS_ERROR', e);
    }
}
