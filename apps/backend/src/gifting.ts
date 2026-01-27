/**
 * Gifting Module
 * Handles Sending Virtual/Physical Gifts
 */
import { Env } from './index';
import { verifyAuth } from './auth';
import { z } from 'zod';
import { AuthenticationError, AppError } from './errors';
import { logger } from './logger';

// Zod Schema
const GiftSchema = z.object({
    recipient_id: z.string().uuid(),
    gift_item_id: z.string().min(1),
    message: z.string().max(200).optional(),
});

export async function handleGifting(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const body = GiftSchema.parse(await request.json());
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

    const user = results[0] as { credits_balance: number } | undefined;

    if (!user || user.credits_balance < giftCost) {
        throw new AppError("Insufficient credits", 402, 'INSUFFICIENT_CREDITS', {
            required: giftCost,
            balance: user?.credits_balance || 0
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

        const remainingCredits = (user?.credits_balance || 0) - giftCost;
        logger.info('gift_sent', undefined, { userId, recipientId: recipient_id, giftItemId: gift_item_id, cost: giftCost });

        return new Response(JSON.stringify({
            success: true,
            data: {
                remaining_credits: remainingCredits,
                gift_id: giftId
            }
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e: unknown) {
        throw new AppError('Gifting failed', 500, 'GIFT_ERROR', e instanceof Error ? e : undefined);
    }
}
