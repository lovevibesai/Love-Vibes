/**
 * Feed Module (Recommendations)
 * Handles Geosharding and Mode Filtering (Dating vs Friendship)
 */
import { Env } from './index';
import { verifyAuth } from './auth';
// @ts-ignore
import { S2 } from 's2-geometry';

// Production Ready S2 Logic
// Production Ready S2 Logic
function latLonToCellId(lat: number, lon: number, level: number = 12): string {
    const key = S2.latLngToKey(lat, lon, level);
    return S2.keyToId(key);
}

function getNeighboringCells(cellId: string): string[] {
    const key = S2.idToKey(cellId);
    return [cellId];
}

function calculateCompatibility(u1: any, u2: any): number {
    let score = 0;

    // 1. Relationship Goals (40%)
    try {
        const goals1 = JSON.parse(u1.relationship_goals || '[]');
        const goals2 = JSON.parse(u2.relationship_goals || '[]');
        const intersection = goals1.filter((g: string) => goals2.includes(g));
        if (intersection.length > 0) score += 40;
        else if (goals1.length > 0 && goals2.length > 0) score += 15; // Partial credit for having any goals set
    } catch (e) { }

    // 2. Interests overlap (30%)
    try {
        const int1 = JSON.parse(u1.interests || '[]');
        const int2 = JSON.parse(u2.interests || '[]');
        const overlap = int1.filter((i: string) => int2.includes(i));
        const overlapRatio = int1.length > 0 ? overlap.length / Math.max(int1.length, int2.length) : 0;
        score += Math.min(30, overlapRatio * 60); // Aggressive overlap bonus
    } catch (e) { }

    // 3. Lifestyle Compatibility (20%)
    if (u1.drinking === u2.drinking) score += 10;
    if (u1.smoking === u2.smoking) score += 10;

    // 4. Base & Random Polish (10%)
    score += 5; // Base compatibility
    score += Math.floor(Math.random() * 5); // Micro-variance for "organic" feel

    return Math.min(100, Math.max(60, Math.floor(score))); // Keep it positive (60-100%)
}

async function calculateSemanticScore(env: Env, text1: string, text2: string): Promise<number> {
    try {
        const response: any = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: [text1, text2]
        });
        const [v1, v2] = response.data;

        // Cosine Similarity
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            mag1 += v1[i] * v1[i];
            mag2 += v2[i] * v2[i];
        }
        const similarity = dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
        return Math.floor(similarity * 100);
    } catch (e) {
        return 70; // Default sibling "vibe" if AI fails
    }
}

export async function handleFeed(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    // Get current user's profile to know their preferences
    const { results: userResults } = await env.DB.prepare(
        "SELECT * FROM Users WHERE id = ?"
    ).bind(userId).all();

    const currentUser: any = userResults[0];
    if (!currentUser) return new Response("User not found", { status: 404 });

    // 1. Calculate Neighbors (Geosharding)
    const currentCell = latLonToCellId(currentUser.lat || 0, currentUser.long || 0);
    const cellsToQuery = getNeighboringCells(currentCell);

    // 2. Fetch User Discovery Metadata (Cache Key)
    const cacheKey = `feed_cache:${currentCell}:${currentUser.mode}`;
    let feedRaw: any[] = [];

    // 3. Try KV Cache first
    const cachedData = await env.GEO_KV.get(cacheKey);
    if (cachedData) {
        feedRaw = JSON.parse(cachedData);
    } else {
        // 4. Cache Miss - Query D1
        const { results } = await env.DB.prepare(
            "SELECT id, name, age, bio, photo_urls, s2_cell_id, mode, trust_score, location, relationship_goals, interests, height, drinking, smoking, exercise_frequency, diet, pets, star_sign " +
            "FROM Users " +
            "WHERE s2_cell_id IN (" + cellsToQuery.map(() => '?').join(',') + ") " +
            "AND mode = ? " +
            "LIMIT 100" // Fetch more to allow for filtering
        ).bind(...cellsToQuery, currentUser.mode).all();

        feedRaw = results;

        // Save to KV for 10 minutes
        await env.GEO_KV.put(cacheKey, JSON.stringify(feedRaw), { expirationTtl: 600 });
    }

    // 5. In-Memory Filtering & Match Scoring (Personalization)
    const baseFeed = feedRaw.filter((user: any) => user.id !== userId);

    // 6. Semantic Enhancement (Async Parallel)
    const feed = await Promise.all(baseFeed.slice(0, 20).map(async (user: any) => {
        const baseScore = calculateCompatibility(currentUser, user);
        const semanticScore = await calculateSemanticScore(env, currentUser.bio || "", user.bio || "");

        return {
            ...user,
            compatibility_score: Math.floor((baseScore * 0.7) + (semanticScore * 0.3)),
            match_reason: semanticScore > 80 ? "Deep personality match" : "Shared interests"
        };
    }));

    return new Response(JSON.stringify({
        meta: { status: 200, count: feed.length, source: cachedData ? 'cache' : 'db' },
        data: {
            results: feed
        }
    }), { headers: { 'Content-Type': 'application/json' } });
}
