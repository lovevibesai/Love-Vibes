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

    // 0. PUBLIC ACCESS: Serve Image Directly (GET /v2/media/public/:key)
    // CRITICAL: This must be BEFORE auth because <img> tags don't send tokens
    if (method === 'GET' && path.startsWith('/v2/media/public/')) {
        let key = path.replace('/v2/media/public/', '');

        // SAFETY: Decode URI component to handle spaces/special chars in keys
        try {
            key = decodeURIComponent(key);
        } catch (e) {
            console.error("Failed to decode key:", key);
        }

        console.log(`[MEDIA] Serving key: ${key}`);

        const object = await env.MEDIA_BUCKET.get(key);

        if (!object) {
            logger.warn('media_not_found', 'Public object not found', { key });
            throw new NotFoundError('Media object');
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Cache for performance
        headers.set('Cache-Control', 'public, max-age=31536000');

        return new Response(object.body, {
            headers,
        });
    }

    const userId = await verifyAuth(request, env);
    if (!userId) throw new AuthenticationError();

    // 1. Get Direct Upload URL for Cloudflare Stream (GET /v2/media/video-upload-url)
    if (method === 'GET' && pathMatches(path, '/v2/media/video-upload-url')) {
        const accountId = (env as any).CLOUDFLARE_ACCOUNT_ID;
        const apiToken = (env as any).CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            logger.error('media_config_error', 'Cloudflare Stream secrets not configured');
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
                    maxDurationSeconds: 60, // Limit intros to 60s
                    meta: { userId, type: 'video_intro' }
                })
            }
        );

        const data: any = await streamResponse.json();
        return new Response(JSON.stringify({
            uploadURL: data.result.uploadURL,
            uid: data.result.uid
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'POST' && pathMatches(url.pathname, '/v2/media/upload')) {
        const formData = await request.formData();
        const file = formData.get('file') as unknown as File;
        const type = String(formData.get('type') || 'photo');

        if (!file) throw new AppError("No file provided", 400);

        const fileId = crypto.randomUUID();
        // Sanitize extension: only alphanumeric
        const rawExt = file.name.split('.').pop() || 'jpg';
        const extension = rawExt.replace(/[^a-z0-9]/gi, '').toLowerCase();

        const key = `users/${userId}/${type}s/${fileId}.${extension}`;

        // 1. Upload to R2
        await env.MEDIA_BUCKET.put(key, file.stream() as any, {
            httpMetadata: { contentType: file.type }
        });

        // FIXED: Use Worker-served URL instead of custom domain
        // This ensures it works immediately without DNS configuration
        const workerUrl = new URL(request.url).origin;
        const publicUrl = `${workerUrl}/v2/media/public/${key}`;

        // 2. AI Moderation Placeholder
        // const isSafe = await env.AI.run("@cf/microsoft/resnet-50", { image: [...file.buffer] });

        // 3. Update Database
        if (type === 'video') {
            // For videos, we now use the Stream URL if available, else keep R2
            // The frontend will pass the Stream UID after successful upload
            const streamUid = formData.get('stream_uid');
            const videoUrl = streamUid ? `https://customer-<ID>.cloudflarestream.com/${streamUid}/watch` : publicUrl;

            await env.DB.prepare(
                "UPDATE Users SET video_intro_url = ? WHERE id = ?"
            ).bind(videoUrl, userId).run();
        } else {
            // For photos, we append to the JSON array
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
            status: "uploaded",
            url: publicUrl
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    throw new NotFoundError("Media route");
}

function pathMatches(path: string, target: string) {
    return path === target || path === target + '/';
}
