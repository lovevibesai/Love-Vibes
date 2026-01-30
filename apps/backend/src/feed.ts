/**
 * Feed Module (Recommendations)
 * Handles Geosharding and Mode Filtering (Dating vs Friendship)
 */
import { Env } from './index';
import { verifyAuth } from './auth';
// @ts-expect-error - S2 library lacks types
import { S2 } from 's2-geometry';
import { AuthenticationError, NotFoundError, AppError, ValidationError } from './errors';
import { logger } from './logger';
import { z } from 'zod';

// Zod Schema
const FeedRequestSchema = z.object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    long: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().min(1).max(500).default(50),
});

// Production Ready S2 Logic
function latLonToCellId(lat: number, lon: number, level: number = 12): string {
    const key = S2.latLngToKey(lat, lon, level);
    return S2.keyToId(key);
}

function getNeighboringCells(cellId: string): string[] {
    try {
        const key = S2.idToKey(cellId);
        const neighbors = S2.getNeighbors(key);
        const neighborIds = neighbors.map((k: string) => S2.keyToId(k));
        return [cellId, ...neighborIds];
    } catch (e) {
        logger.error('geosharding_neighbors_error', 'Failed to get neighboring cells', { cellId, error: e });
        return [cellId];
    }
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
    } catch (e) {
        logger.error('feed_json_parse_relationship_goals_error', 'Failed to parse relationship goals', { error: e });
    }

    // 2. Interests overlap (30%)
    try {
        const int1 = JSON.parse(u1.interests || '[]');
        const int2 = JSON.parse(u2.interests || '[]');
        const overlap = int1.filter((i: string) => int2.includes(i));
        const overlapRatio = int1.length > 0 ? overlap.length / Math.max(int1.length, int2.length) : 0;
        score += Math.min(30, overlapRatio * 60); // Aggressive overlap bonus
    } catch (e) {
        logger.error('feed_json_parse_interests_error', 'Failed to parse interests', { error: e });
    }

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
    } catch (_e) {
        return 70; // Default sibling "vibe" if AI fails
    }
}

export async function handleFeed(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        const queryParams = FeedRequestSchema.parse({
            lat: url.searchParams.get('lat'),
            long: url.searchParams.get('long'),
            radius: url.searchParams.get('radius')
        });

        // Get current user's profile to know their preferences
        const { results: userResults } = await env.DB.prepare(
            "SELECT * FROM Users WHERE id = ?"
        ).bind(userId).all();

        const currentUser: any = userResults[0];
        if (!currentUser) throw new NotFoundError('User');

        const lat = queryParams.lat || currentUser.lat || 0;
        const long = queryParams.long || currentUser.long || 0;

        // 1. Calculate Neighbors (Geosharding)
        const currentCell = latLonToCellId(lat, long);
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
            // FIX: Join with ActiveBoosts for priority
            // FIX: Exclude Swipes
            // FIX: Apply Preferences (Age, Gender) - simplified for now using UserPreferences if available, else defaults
            
            // Fetch User Preferences
            const prefResult = await env.DB.prepare(
                "SELECT * FROM UserPreferences WHERE user_id = ?"
            ).bind(userId).first() as any;

            const ageMin = prefResult?.age_min || 18;
            const ageMax = prefResult?.age_max || 99;
            // Gender filtering logic (0: Men, 1: Women, 2: Everyone)
            let genderFilter = "";
            
            if (prefResult?.show_me === 'men') {
                genderFilter = "AND gender = 0";
            } else if (prefResult?.show_me === 'women') {
                genderFilter = "AND gender = 1";
            }
            // 'everyone' or null implies no gender filter

            const query = `
                SELECT 
                    u.id, u.name, u.age, u.bio, u.photo_urls, u.s2_cell_id, u.mode, 
                    u.trust_score, u.location, u.relationship_goals, u.interests, 
                    u.height, u.drinking, u.smoking, u.exercise_frequency, u.diet, 
                    u.pets, u.star_sign,
                    CASE WHEN ab.expires_at > ? THEN 1 ELSE 0 END as is_boosted
                FROM Users u
                LEFT JOIN ActiveBoosts ab ON u.id = ab.user_id
                WHERE u.s2_cell_id IN (${cellsToQuery.map(() => '?').join(',')})
                AND u.mode = ?
                AND u.id != ?
                AND u.age BETWEEN ? AND ?
                ${genderFilter}
                AND u.id NOT IN (SELECT target_id FROM Swipes WHERE actor_id = ?)
                ORDER BY is_boosted DESC, u.trust_score DESC, RANDOM()
                LIMIT 100
            `;

            const params = [
                Date.now(), // for boost check
                ...cellsToQuery,
                currentUser.mode,
                userId,
                ageMin,
                ageMax,
                userId // for swipe exclusion
            ];

            const { results } = await env.DB.prepare(query).bind(...params).all();

            feedRaw = results;

            // Save to KV for 10 minutes
            await env.GEO_KV.put(cacheKey, JSON.stringify(feedRaw), { expirationTtl: 600 });
        }

        // 5. Semantic Enhancement (Async Parallel)
        const feed = await Promise.all(feedRaw.slice(0, 20).map(async (user: any) => {
            const baseScore = calculateCompatibility(currentUser, user);
            const semanticScore = await calculateSemanticScore(env, currentUser.bio || "", user.bio || "");

            return {
                ...user,
                compatibility_score: Math.floor((baseScore * 0.7) + (semanticScore * 0.3)),
                match_reason: semanticScore > 80 ? "Deep personality match" : "Shared interests"
            };
        }));

        logger.info('feed_generated', undefined, {
            userId,
            cellCount: cellsToQuery.length,
            source: cachedData ? 'cache' : 'db',
            resultsCount: feed.length
        });

        return new Response(JSON.stringify({
            success: true,
            data: {
                results: feed,
                meta: { source: cachedData ? 'cache' : 'db' }
            }
        }), { headers: jsonHeaders });
    } catch (e: any) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        if (e instanceof AppError) throw e;
        throw new AppError('Feed generation failed', 500, 'FEED_ERROR', e);
    }
}
