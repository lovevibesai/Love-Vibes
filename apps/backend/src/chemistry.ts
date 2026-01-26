// Biometric Chemistry Test
// Heart rate synchrony detection during video calls using PPG

import { Env } from './index'

export interface HeartRateData {
    timestamp: number
    bpm: number
}

export interface ChemistryResult {
    test_id: string
    user_a_avg_hr: number
    user_b_avg_hr: number
    sync_score: number
    chemistry_detected: boolean
    message: string
}

import { z } from 'zod';
import { ValidationError, AuthenticationError, AppError, NotFoundError } from './errors';

// Zod Schemas
const StartTestSchema = z.object({
    match_id: z.string().uuid(),
    target_id: z.string().uuid(),
});

const HeartRateDataSchema = z.object({
    timestamp: z.number(),
    bpm: z.number().min(30).max(220), // Physiological limits
});

const SubmitDataSchema = z.object({
    test_id: z.string().uuid(),
    heart_rate_data: z.array(HeartRateDataSchema).min(1),
});

// POST /api/chemistry/start-test - Initialize chemistry test
export async function startChemistryTest(
    env: Env,
    matchId: string,
    userAId: string,
    userBId: string
): Promise<{ success: boolean; test_id: string }> {
    const testId = crypto.randomUUID()
    const now = Math.floor(Date.now() / 1000)

    try {
        await env.DB.prepare(
            'INSERT INTO ChemistryTests (id, match_id, user_a_id, user_b_id, created_at) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(testId, matchId, userAId, userBId, now)
            .run()

        return { success: true, test_id: testId }
    } catch (error) {
        console.error('Failed to start chemistry test:', error)
        return { success: false, test_id: '' }
    }
}

// POST /api/chemistry/submit-data - Submit heart rate data
export async function submitChemistryData(
    env: Env,
    testId: string,
    userId: string,
    heartRateData: HeartRateData[]
): Promise<{ success: boolean }> {
    try {
        // Calculate average and variance
        const bpms = heartRateData.map((d) => d.bpm)
        const avgHr = bpms.reduce((a, b) => a + b, 0) / bpms.length
        const variance = calculateVariance(bpms)

        // Determine which user (A or B)
        const test = await env.DB.prepare('SELECT user_a_id, user_b_id FROM ChemistryTests WHERE id = ?')
            .bind(testId)
            .first()

        if (!test) return { success: false }

        const isUserA = test.user_a_id === userId

        // Update test with user's data
        if (isUserA) {
            await env.DB.prepare(
                'UPDATE ChemistryTests SET user_a_hr_avg = ?, user_a_hr_variance = ? WHERE id = ?'
            )
                .bind(Math.round(avgHr), variance, testId)
                .run()
        } else {
            await env.DB.prepare(
                'UPDATE ChemistryTests SET user_b_hr_avg = ?, user_b_hr_variance = ? WHERE id = ?'
            )
                .bind(Math.round(avgHr), variance, testId)
                .run()
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to submit chemistry data:', error)
        return { success: false }
    }
}

// GET /api/chemistry/results/:testId - Get chemistry test results
export async function getChemistryResults(env: Env, testId: string): Promise<ChemistryResult | null> {
    try {
        const test = await env.DB.prepare('SELECT * FROM ChemistryTests WHERE id = ?')
            .bind(testId)
            .first()

        if (!test || !test.user_a_hr_avg || !test.user_b_hr_avg) {
            return null // Test not complete
        }

        // Calculate synchrony score
        const syncScore = calculateSynchronyScore(
            test.user_a_hr_avg as number,
            test.user_b_hr_avg as number,
            test.user_a_hr_variance as number,
            test.user_b_hr_variance as number
        )

        const chemistryDetected = syncScore >= 70

        // Update test with results
        await env.DB.prepare(
            'UPDATE ChemistryTests SET sync_score = ?, chemistry_detected = ?, test_duration = ? WHERE id = ?'
        )
            .bind(syncScore, chemistryDetected, 60, testId)
            .run()

        return {
            test_id: testId,
            user_a_avg_hr: test.user_a_hr_avg as number,
            user_b_avg_hr: test.user_b_hr_avg as number,
            sync_score: syncScore,
            chemistry_detected: chemistryDetected,
            message: chemistryDetected
                ? '🔥 Chemistry Detected! Your heart rates elevated and synced!'
                : '💙 Keep getting to know each other!',
        }
    } catch (error) {
        console.error('Failed to get chemistry results:', error)
        return null
    }
}

function calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

function calculateSynchronyScore(
    hrA: number,
    hrB: number,
    varA: number,
    varB: number
): number {
    // Heart rate similarity (closer = higher score)
    const hrDiff = Math.abs(hrA - hrB)
    const hrSimilarity = Math.max(0, 100 - hrDiff * 2)

    // Variance similarity (both elevated or both calm = higher score)
    const varDiff = Math.abs(varA - varB)
    const varSimilarity = Math.max(0, 100 - varDiff * 5)

    // Both heart rates elevated (indicates mutual attraction)
    const elevationBonus = hrA > 75 && hrB > 75 ? 20 : 0

    // Combined score
    const score = (hrSimilarity * 0.5 + varSimilarity * 0.3 + elevationBonus) * 1.2

    return Math.min(100, Math.round(score))
}

export async function handleChemistry(request: Request, env: Env): Promise<Response> {
    const { verifyAuth } = await import('./auth');
    const userId = await verifyAuth(request, env);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const jsonHeaders = { 'Content-Type': 'application/json' };

    if (path === '/v2/chemistry/start' && method === 'POST') {
        const body = StartTestSchema.parse(await request.json());
        const result = await startChemistryTest(env, body.match_id, userId, body.target_id);
        if (!result.success) throw new AppError("Failed to start chemistry test", 500);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    if (path === '/v2/chemistry/submit' && method === 'POST') {
        const body = SubmitDataSchema.parse(await request.json());
        const result = await submitChemistryData(env, body.test_id, userId, body.heart_rate_data);
        if (!result.success) throw new AppError("Failed to submit chemistry data", 500);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    if (path.startsWith('/v2/chemistry/results/') && method === 'GET') {
        const testId = path.split('/').pop();
        if (!testId) throw new ValidationError("Missing test ID");
        const result = await getChemistryResults(env, testId);
        if (!result) throw new NotFoundError("Chemistry test results");
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    return new Response("Not Found", { status: 404 });
}

// Client-side PPG implementation helper (for frontend)
export const PPG_INSTRUCTIONS = `
/**
 * Photoplethysmography (PPG) - Heart Rate Detection via Camera
 * 
 * Implementation:
 * 1. Request camera access (front camera)
 * 2. Place fingertip over camera lens
 * 3. Capture video frames at 30fps
 * 4. Extract red channel intensity from each frame
 * 5. Apply bandpass filter (0.8-3 Hz for 48-180 BPM)
 * 6. Use FFT to detect dominant frequency (heart rate)
 * 7. Send BPM readings every 2 seconds
 * 
 * Libraries:
 * - getUserMedia() for camera access
 * - Canvas API for frame extraction
 * - FFT.js or similar for frequency analysis
 * 
 * Accuracy: ~95% compared to medical devices
 */
`
