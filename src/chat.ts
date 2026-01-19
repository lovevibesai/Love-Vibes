/**
 * Chat Module - AI Innovation
 * Handles AI Icebreakers and Chat Insights
 */
import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleChatAI(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Generate Icebreakers (GET /v2/chat/icebreakers?with_user_id=...)
    if (path === '/v2/chat/icebreakers' && request.method === 'GET') {
        const withUserId = url.searchParams.get('with_user_id');
        if (!withUserId) return new Response("Missing with_user_id", { status: 400 });

        // Fetch Both Users
        const { results } = await env.DB.prepare(
            "SELECT * FROM Users WHERE id IN (?, ?)"
        ).bind(userId, withUserId).all();

        const u1 = results.find((r: any) => r.id === userId);
        const u2 = results.find((r: any) => r.id === withUserId);

        if (!u1 || !u2) return new Response("Users not found", { status: 404 });

        // Analyze overlap
        const int1 = JSON.parse(u1.interests || '[]');
        const int2 = JSON.parse(u2.interests || '[]');
        const sharedInterests = int1.filter((i: string) => int2.includes(i));

        const goals1 = JSON.parse(u1.relationship_goals || '[]');
        const goals2 = JSON.parse(u2.relationship_goals || '[]');
        const sharedGoals = goals1.filter((g: string) => goals2.includes(g));

        // Generate 3 Personalized Icebreakers
        const icebreakers = [];

        // Icebreaker 1: Interest Based
        if (sharedInterests.length > 0) {
            icebreakers.push(`Hey! I notice we both love ${sharedInterests[0]}. What's your favorite thing about it?`);
        } else if (int2.length > 0) {
            icebreakers.push(`I see you're into ${int2[0]}! I've always wanted to try that. How did you get started?`);
        }

        // Icebreaker 2: Goal Based
        if (sharedGoals.length > 0) {
            icebreakers.push(`It's refreshing to see someone else looking for ${sharedGoals[0].replace('-', ' ')}! What does that look like for you?`);
        }

        // Icebreaker 3: Fun/Random
        const funPrompts = [
            "Quick question: Coffee or Tea to start a perfect weekend?",
            "If you could travel anywhere tomorrow, where would we be?",
            "What's the most underrated spot in our city?",
            "Tell me one thing that's NOT on your profile!"
        ];
        icebreakers.push(funPrompts[Math.floor(Math.random() * funPrompts.length)]);

        return new Response(JSON.stringify({
            status: "success",
            icebreakers: icebreakers.slice(0, 3)
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response("Not Found", { status: 404 });
}
