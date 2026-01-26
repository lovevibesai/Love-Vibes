// Biometric Chemistry Test
// Heart rate synchrony detection during video calls using PPG

import { Env } from './index'
import { z } from 'zod';
import { ValidationError, AuthenticationError, AppError, NotFoundError } from './errors';
import { logger } from './logger';
import { verifyAuth } from './auth';

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

const StartTestSchema = z.object({
    match_id: z.string().uuid(),
    target_id: z.string().uuid(),
});

const HeartRateDataSchema = z.object({
    timestamp: z.number(),
    bpm: z.number().min(30).max(220),
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

        logger.info('chemistry_test_started', undefined, { testId, matchId, userAId, userBId });
        return { success: true, test_id: testId }
    } catch (error: any) {
        throw new AppError('Failed to start chemistry test', 500, 'START_TEST_ERROR', error);
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
        const bpms = heartRateData.map((d) => d.bpm)
        const avgHr = bpms.reduce((a, b) => a + b, 0) / bpms.length
        const variance = calculateVariance(bpms)

        const test = await env.DB.prepare('SELECT user_a_id, user_b_id FROM ChemistryTests WHERE id = ?')
            .bind(testId)
            .first()

        if (!test) throw new NotFoundError('Chemistry Test');

        const isUserA = test.user_a_id === userId

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

        logger.info('chemistry_data_submitted', undefined, { testId, userId, avgHr });
        return { success: true }
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to submit chemistry data', 500, 'SUBMIT_DATA_ERROR', error);
    }
}

// GET /api/chemistry/results/:testId - Get chemistry test results
export async function getChemistryResults(env: Env, testId: string): Promise<ChemistryResult | null> {
    try {
        const test = await env.DB.prepare('SELECT * FROM ChemistryTests WHERE id = ?')
            .bind(testId)
            .first()

        if (!test) throw new NotFoundError('Chemistry Test');

        if (!test.user_a_hr_avg || !test.user_b_hr_avg) {
            return null // Test not complete
        }

        const syncScore = calculateSynchronyScore(
            test.user_a_hr_avg as number,
            test.user_b_hr_avg as number,
            test.user_a_hr_variance as number,
            test.user_b_hr_variance as number
        )

        const chemistryDetected = syncScore >= 70
        await env.DB.prepare(
            'UPDATE ChemistryTests SET sync_score = ?, chemistry_detected = ?, test_duration = ? WHERE id = ?'
        )
            .bind(syncScore, chemistryDetected, 60, testId)
            .run()

        logger.info('chemistry_results_generated', undefined, { testId, syncScore, detected: chemistryDetected });

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
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to get chemistry results', 500, 'GET_RESULTS_ERROR', error);
    }
}

function calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

function calculateSynchronyScore(hrA: number, hrB: number, varA: number, varB: number): number {
    const hrDiff = Math.abs(hrA - hrB)
    const hrSimilarity = Math.max(0, 100 - hrDiff * 2)
    const varDiff = Math.abs(varA - varB)
    const varSimilarity = Math.max(0, 100 - varDiff * 5)
    const elevationBonus = hrA > 75 && hrB > 75 ? 20 : 0
    const score = (hrSimilarity * 0.5 + varSimilarity * 0.3 + elevationBonus) * 1.2
    return Math.min(100, Math.round(score))
}

export async function handleChemistry(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    try {
        if (path === '/v2/chemistry/start' && method === 'POST') {
            const body = StartTestSchema.parse(await request.json());
            const result = await startChemistryTest(env, body.match_id, userId, body.target_id);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        if (path === '/v2/chemistry/submit' && method === 'POST') {
            const body = SubmitDataSchema.parse(await request.json());
            const result = await submitChemistryData(env, body.test_id, userId, body.heart_rate_data);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }

        if (path.startsWith('/v2/chemistry/results/') && method === 'GET') {
            const testId = path.split('/').pop();
            if (!testId) throw new ValidationError("Missing test ID");
            const result = await getChemistryResults(env, testId);
            return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
        }
    } catch (e: any) {
        if (e instanceof z.ZodError) throw new ValidationError(e.errors[0].message);
        throw e;
    }

    throw new NotFoundError("Chemistry route");
}
