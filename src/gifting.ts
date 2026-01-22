/**
 * Gifting Module
 * Handles Sending Virtual/Physical Gifts
 */
import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleGifting(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body: any = await request.json();
    const { recipient_id, gift_item_id, message } = body;

    // 1. Determine Gift Cost based on Tiered Architecture
    const giftLibrary: Record<string, number> = {
        'coffee': 10,
        'rose': 15,
        'song': 20,
        'dessert': 30,
        'bouquet': 40,
        'mystery': 50,
        'star': 75,
        'concert': 100,
        'experience': 150
    };

    const giftCost = giftLibrary[gift_item_id] || 50;

    // 2. Validate Balance
    const { results } = await env.DB.prepare(
        "SELECT credits_balance FROM Users WHERE id = ?"
    ).bind(userId).all();

    const user: any = results[0];

    if (!user || user.credits_balance < giftCost) {
        return new Response(JSON.stringify({ error: "Insufficient credits", required: giftCost, balance: user?.credits_balance || 0 }), {
            status: 402,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 3. Atomic Transaction (D1)
    const giftId = crypto.randomUUID();
    const timestamp = Date.now();

    try {
        await env.DB.batch([
            env.DB.prepare("UPDATE Users SET credits_balance = credits_balance - ? WHERE id = ?").bind(giftCost, userId),
            env.DB.prepare(
                "INSERT INTO Gifts (id, sender_id, recipient_id, item_id, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(giftId, userId, recipient_id, gift_item_id, message, 'SENT', timestamp)
        ]);

        return new Response(JSON.stringify({
            status: "success",
            remaining_credits: user.credits_balance - giftCost,
            gift_id: giftId
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
