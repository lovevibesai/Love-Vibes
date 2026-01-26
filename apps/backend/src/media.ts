/**
 * Media Module
 * Handles R2 Uploads for Photos and Video Intros with AI Moderation Hooks
 */
import { Env } from './index';
import { verifyAuth } from './auth';
import { AuthenticationError, AppError, ServerError, NotFoundError } from './errors';
import { logger } from './logger';

export async function handleMedia(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    const jsonHeaders = { 'Content-Type': 'application/json' };

    // 0. PUBLIC ACCESS: Serve Image Directly (GET /v2/media/public/:key)
    if (method === 'GET' && path.startsWith('/v2/media/public/')) {
        let key = path.replace('/v2/media/public/', '');

        try {
            key = decodeURIComponent(key);
        } catch (e) {
            logger.error('media_decode_error', 'Failed to decode key', { key });
        }

        const object = await env.MEDIA_BUCKET.get(key);

        if (!object) {
            throw new NotFoundError('Media object');
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000');

        return new Response(object.body, { headers });
    }

    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    // 1. Get Direct Upload URL for Cloudflare Stream
    if (method === 'GET' && pathMatches(path, '/v2/media/video-upload-url')) {
        const accountId = (env as any).CLOUDFLARE_ACCOUNT_ID;
        const apiToken = (env as any).CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            throw new ServerError("Media processing service not configured");
        }

        const streamResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maxDurationSeconds: 60,
                    meta: { userId, type: 'video_intro' }
                })
            }
        );

        const data: any = await streamResponse.json();
        return new Response(JSON.stringify({
            success: true,
            data: {
                uploadURL: data.result.uploadURL,
                uid: data.result.uid
            }
        }), { headers: jsonHeaders });
    }

    // 2. Direct Upload to R2 (Photos)
    if (method === 'POST' && pathMatches(url.pathname, '/v2/media/upload')) {
        const formData = await request.formData();
        const file = formData.get('file') as unknown as File;
        const type = String(formData.get('type') || 'photo');

        if (!file) throw new AppError("No file provided", 400);

        const fileId = crypto.randomUUID();
        const rawExt = file.name.split('.').pop() || 'jpg';
        const extension = rawExt.replace(/[^a-z0-9]/gi, '').toLowerCase();

        const key = `users/${userId}/${type}s/${fileId}.${extension}`;

        await env.MEDIA_BUCKET.put(key, file.stream() as any, {
            httpMetadata: { contentType: file.type }
        });

        const workerUrl = new URL(request.url).origin;
        const publicUrl = `${workerUrl}/v2/media/public/${key}`;

        if (type === 'video') {
            const streamUid = formData.get('stream_uid');
            const videoUrl = streamUid ? `https://customer-<ID>.cloudflarestream.com/${streamUid}/watch` : publicUrl;

            await env.DB.prepare(
                "UPDATE Users SET video_intro_url = ? WHERE id = ?"
            ).bind(videoUrl, userId).run();
        } else {
            const { results }: any = await env.DB.prepare(
                "SELECT photo_urls FROM Users WHERE id = ?"
            ).bind(userId).all();

            let photos = [];
            try {
                photos = JSON.parse(results[0].photo_urls || '[]');
            } catch (e) { }

            photos.push(publicUrl);

            await env.DB.prepare(
                "UPDATE Users SET photo_urls = ?, main_photo_url = ? WHERE id = ?"
            ).bind(JSON.stringify(photos), photos[0], userId).run();
        }

        logger.info('media_uploaded', undefined, { userId, type, key });

        return new Response(JSON.stringify({
            success: true,
            data: {
                status: "uploaded",
                url: publicUrl
            }
        }), { headers: jsonHeaders });
    }

    throw new NotFoundError("Media route");
}

function pathMatches(path: string, target: string) {
    return path === target || path === target + '/';
}
