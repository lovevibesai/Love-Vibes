/**
 * Chat Module - AI Innovation
 * Handles AI Icebreakers and Chat Insights
 */
import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleChatAI(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
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

        const u1 = (results as any).find((r: any) => r.id === userId);
        const u2 = (results as any).find((r: any) => r.id === withUserId);

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
        // Generate 3 Personalized Icebreakers using Workers AI
        const prompt = `
            You are a charming dating assistant for the app "Love Vibes".
            Generate 3 short, engaging, and personalized icebreakers for User A to send to User B.
            
            User A Interests: ${u1.interests}
            User B Interests: ${u2.interests}
            Shared Goals: ${u1.relationship_goals} and ${u2.relationship_goals}
            
            Guidelines:
            1. Keep them under 15 words each.
            2. High focus on shared interests: ${sharedInterests.join(', ')}.
            3. Make them sound organic, not corporate.
            4. Output ONLY a valid JSON array of strings.
        `;

        try {
            const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
                messages: [{ role: 'user', content: prompt }]
            });

            // AI responses can be messy, attempt to parse JSON array
            let icebreakers = [];
            const text = aiResponse.response || "";
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                icebreakers = JSON.parse(jsonMatch[0]);
            } else {
                icebreakers = [text.split('\n')[0]]; // Fallback to first line
            }

            return new Response(JSON.stringify({
                status: "success",
                icebreakers: icebreakers.slice(0, 3),
                meta: { model: "llama-3.1-8b-instruct" }
            }), { headers: { 'Content-Type': 'application/json' } });

        } catch (e) {
            console.error("AI Icebreaker failed", e);
            // Fallback to basic logic if AI fails
            return new Response(JSON.stringify({
                status: "success",
                icebreakers: [
                    `Hey! I notice we both love ${sharedInterests[0] || 'exploring'}.`,
                    "What's the most underrated spot in our city?",
                    "Tell me one thing that's NOT on your profile!"
                ]
            }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    return new Response("Not Found", { status: 404 });
}
