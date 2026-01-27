/**
 * Chat Module - AI Innovation
 * Handles AI Icebreakers and Chat Insights
 */
import { Env } from './index';
import { verifyAuth } from './auth';
import { AuthenticationError, ValidationError, NotFoundError, AppError } from './errors';
import { logger } from './logger';

export async function handleChatAI(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        // 1. Generate Icebreakers (GET /v2/chat/icebreakers?with_user_id=...)
        if (path === '/v2/chat/icebreakers' && request.method === 'GET') {
            const withUserId = url.searchParams.get('with_user_id');
            if (!withUserId) throw new ValidationError("Missing with_user_id");

            // Fetch Both Users
            const { results } = await env.DB.prepare(
                "SELECT id, name, interests, relationship_goals FROM Users WHERE id IN (?, ?)"
            ).bind(userId, withUserId).all();

            const u1 = (results as unknown as Array<{ id: string, name: string, interests?: string, relationship_goals?: string }>).find((r) => r.id === userId);
            const u2 = (results as unknown as Array<{ id: string, name: string, interests?: string, relationship_goals?: string }>).find((r) => r.id === withUserId);

            if (!u1 || !u2) throw new NotFoundError("Users");

            // Analyze overlap
            const int1 = JSON.parse(u1.interests || '[]');
            const int2 = JSON.parse(u2.interests || '[]');
            const sharedInterests = int1.filter((i: string) => int2.includes(i));

            const goals1 = JSON.parse(u1.relationship_goals || '[]');
            const goals2 = JSON.parse(u2.relationship_goals || '[]');
            const _sharedGoals = goals1.filter((g: string) => goals2.includes(g));

            const prompt = `
                You are a charming dating assistant for the app "Love Vibes".
                Generate 3 short, engaging, and personalized icebreakers for User A to send to User B.
                User A Interests: ${u1.interests}
                User B Interests: ${u2.interests}
                Shared Goals: ${u1.relationship_goals} and ${u2.relationship_goals}
                Guidelines:
                1. Keep them under 15 words each.
                2. High focus on shared interests: ${sharedInterests.join(', ')}.
                3. Output ONLY a valid JSON array of strings.
            `;

            let icebreakers = [];
            try {
                const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as unknown as Parameters<Ai['run']>[0], {
                    messages: [{ role: 'user', content: prompt }]
                }) as { response?: string };

                const text = aiResponse.response || "";
                const jsonMatch = text.match(/\[.*\]/s);
                if (jsonMatch) {
                    icebreakers = JSON.parse(jsonMatch[0]);
                } else {
                    icebreakers = [text.split('\n')[0]];
                }
            } catch (e: unknown) {
                logger.error("AI Icebreaker failed", e instanceof Error ? e : undefined, { userId, withUserId });
                // Fallback to basic logic if AI fails
                icebreakers = [
                    `Hey! I notice we both love ${sharedInterests[0] || 'exploring'}.`,
                    "What's the most underrated spot in our city?",
                    "Tell me one thing that's NOT on your profile!"
                ];
            }

            logger.info('icebreakers_generated', undefined, { userId, withUserId });

            return new Response(JSON.stringify({
                success: true,
                data: {
                    icebreakers: icebreakers.slice(0, 3)
                }
            }), { headers: jsonHeaders });
        }
    } catch (e: unknown) {
        if (e instanceof AppError) throw e;
        throw new AppError('Chat AI operation failed', 500, 'CHAT_AI_ERROR', e instanceof Error ? e : undefined);
    }

    throw new NotFoundError("Chat route");
}
