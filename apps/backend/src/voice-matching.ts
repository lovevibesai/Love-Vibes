// Voice-First Matching System
// Match based on voice before seeing photos

import { Env } from './index'
import { z } from 'zod';
import { AuthenticationError, ValidationError, AppError } from './errors';
import { logger } from './logger';

// Zod Schemas
const VoiceSwipeSchema = z.object({
    target_id: z.string().uuid(),
    action: z.enum(['LIKE', 'PASS']),
});

export interface VoiceProfile {
    user_id: string
    voice_url: string
    duration: number
    tone_score: number
    pace_score: number
    emotion_score: number
    authenticity_score: number
    transcription: string
}

export interface VoiceFeedProfile {
    user_id: string
    voice_url: string
    duration: number
    waveform_data?: number[]
    overall_score: number
    photos_unlocked: boolean
}

// POST /api/voice/upload - Upload voice note
export async function uploadVoiceProfile(
    env: Env,
    userId: string,
    audioFile: File
): Promise<{ success: boolean; message: string; voice_url?: string }> {
    try {
        // Upload to R2
        const fileName = `voices/${userId}/${Date.now()}.webm`
        await env.MEDIA_BUCKET.put(fileName, audioFile)
        const voiceUrl = `https://media.lovevibes.app/${fileName}`

        // Analyze voice (mock scores for now - integrate with voice analysis API later)
        const analysis = await analyzeVoice(audioFile)

        const now = Math.floor(Date.now() / 1000)

        // Save voice profile
        await env.DB.prepare(
            `INSERT OR REPLACE INTO VoiceProfiles 
       (user_id, voice_url, duration, tone_score, pace_score, emotion_score, authenticity_score, transcription, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                userId,
                voiceUrl,
                analysis.duration,
                analysis.tone_score,
                analysis.pace_score,
                analysis.emotion_score,
                analysis.authenticity_score,
                analysis.transcription,
                now
            )
            .run()

        return { success: true, message: 'Voice profile created!', voice_url: voiceUrl }
    } catch (error: any) {
        throw new AppError('Failed to upload voice profile', 500, 'VOICE_UPLOAD_FAILED', error);
    }
}

// GET /api/voice/feed - Get voice-only feed
export async function getVoiceFeed(
    env: Env,
    userId: string,
    limit: number = 20
): Promise<VoiceFeedProfile[]> {
    // Get users with voice profiles that current user hasn't swiped on
    const results = await env.DB.prepare(
        `SELECT vp.user_id, vp.voice_url, vp.duration, vp.tone_score, vp.pace_score, vp.emotion_score
     FROM VoiceProfiles vp
     WHERE vp.user_id != ?
     AND vp.user_id NOT IN (
       SELECT target_id FROM VoiceSwipes WHERE actor_id = ?
     )
     ORDER BY RANDOM()
     LIMIT ?`
    )
        .bind(userId, userId, limit)
        .all()

    return results.results.map((r: any) => ({
        user_id: r.user_id,
        voice_url: r.voice_url,
        duration: r.duration,
        overall_score: (r.tone_score + r.pace_score + r.emotion_score) / 3,
        photos_unlocked: false,
    }))
}

// POST /api/voice/swipe - Swipe on voice
export async function voiceSwipe(
    env: Env,
    actorId: string,
    targetId: string,
    action: 'LIKE' | 'PASS'
): Promise<{ success: boolean; mutual_match: boolean; photos_unlocked: boolean }> {
    const now = Math.floor(Date.now() / 1000)

    try {
        // Record swipe
        await env.DB.prepare(
            'INSERT INTO VoiceSwipes (actor_id, target_id, type, timestamp) VALUES (?, ?, ?, ?)'
        )
            .bind(actorId, targetId, action, now)
            .run()

        if (action === 'PASS') {
            return { success: true, mutual_match: false, photos_unlocked: false }
        }

        // Check for mutual like
        const mutualLike = await env.DB.prepare(
            'SELECT * FROM VoiceSwipes WHERE actor_id = ? AND target_id = ? AND type = ?'
        )
            .bind(targetId, actorId, 'LIKE')
            .first()

        if (mutualLike) {
            // Unlock photos for both users
            await env.DB.prepare(
                'UPDATE VoiceSwipes SET photos_unlocked = TRUE WHERE (actor_id = ? AND target_id = ?) OR (actor_id = ? AND target_id = ?)'
            )
                .bind(actorId, targetId, targetId, actorId)
                .run()

            // Create regular match
            const matchId = crypto.randomUUID()
            await env.DB.prepare(
                'INSERT INTO Matches (id, user_a_id, user_b_id, created_at) VALUES (?, ?, ?, ?)'
            )
                .bind(matchId, actorId, targetId, now)
                .run()

            logger.info('voice_match_created', undefined, { actorId, targetId, matchId });
            return { success: true, mutual_match: true, photos_unlocked: true }
        }

        return { success: true, mutual_match: false, photos_unlocked: false }
    } catch (error: any) {
        throw new AppError('Failed to process voice swipe', 500, 'VOICE_SWIPE_FAILED', error);
    }
}

// Mock voice analysis (replace with actual API integration)
async function analyzeVoice(audioFile: File): Promise<{
    duration: number
    tone_score: number
    pace_score: number
    emotion_score: number
    authenticity_score: number
    transcription: string
}> {
    // TODO: Integrate with AssemblyAI or Google Cloud Speech-to-Text
    return {
        duration: 30,
        tone_score: Math.random() * 100,
        pace_score: Math.random() * 100,
        emotion_score: Math.random() * 100,
        authenticity_score: 95 + Math.random() * 5, // High authenticity for real voices
        transcription: 'Voice transcription will appear here...',
    }
}

export async function handleVoiceMatching(request: Request, env: Env): Promise<Response> {
    const { verifyAuth } = await import('./auth');
    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    if (path === '/v2/voice/upload' && method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file') as unknown as File;
        if (!file) throw new ValidationError('Missing audio file');
        const result = await uploadVoiceProfile(env, userId, file);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    if (path === '/v2/voice/feed' && method === 'GET') {
        const result = await getVoiceFeed(env, userId);
        return new Response(JSON.stringify({ success: true, data: result }), { headers: jsonHeaders });
    }

    if (path === '/v2/voice/swipe' && method === 'POST') {
        const body = VoiceSwipeSchema.parse(await request.json());
        const result = await voiceSwipe(env, userId, body.target_id, body.action);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: jsonHeaders
    });
}
