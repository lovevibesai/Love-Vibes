// Success Stories System
// Public success stories and testimonials

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, NotFoundError, AppError } from './errors';
import { logger } from './logger';
import { verifyAuth } from './auth';

// Zod Schema
const SubmitStorySchema = z.object({
    partner_id: z.string().uuid(),
    story_text: z.string().min(50).max(2000),
    relationship_length: z.string().min(1).max(50),
});

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
    storyRaw: unknown
): Promise<{ success: boolean; message: string }> {
    try {
        const story = SubmitStorySchema.parse(storyRaw);
        const now = Math.floor(Date.now() / 1000)
        const storyId = crypto.randomUUID()

        // Get user details
        const user = await env.DB.prepare('SELECT name, main_photo_url FROM Users WHERE id = ?')
            .bind(userId)
            .first()

        const partner = await env.DB.prepare('SELECT name, main_photo_url FROM Users WHERE id = ?')
            .bind(story.partner_id)
            .first()

        if (!user) {
            throw new NotFoundError('User not found for the submitting user.');
        }
        if (!partner) {
            throw new NotFoundError('Partner not found.');
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

        logger.info('story_submitted', undefined, { userId, partnerId: story.partner_id, storyId });
        return { success: true, message: 'Story submitted for review!' }
    } catch (error: unknown) {
        if (error instanceof z.ZodError) throw new ValidationError(error.errors[0].message);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to submit story', 500, 'STORY_SUBMISSION_FAILED', error instanceof Error ? error : undefined);
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

    return results.results as unknown as SuccessStory[]
}

// HTTP Handler for success stories routes
export async function handleSuccessStories(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env).catch(() => null); // Public GET, Auth POST

    const url = new URL(request.url);
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    // GET /v2/success-stories - Get approved stories
    if (method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const stories = await getSuccessStories(env, limit);
        return new Response(JSON.stringify({ success: true, data: stories }), {
            headers: jsonHeaders
        });
    }

    // POST /v2/success-stories - Submit a story
    if (method === 'POST') {
        if (!userId) throw new AuthenticationError();
        const body = await request.json();
        const result = await submitSuccessStory(env, userId, body);

        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    throw new AppError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}
