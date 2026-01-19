/**
 * Media Module
 * Handles R2 Uploads for Photos and Video Intros with AI Moderation Hooks
 */
import { Env } from './index';
import { verifyAuth } from './auth';

export async function handleMedia(request: Request, env: Env): Promise<Response> {
    const userId = await verifyAuth(request);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const method = request.method;

    if (method === 'POST' && pathMatches(url.pathname, '/v2/media/upload')) {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') || 'photo'; // 'photo' or 'video'

        if (!file) return new Response("No file provided", { status: 400 });

        const fileId = crypto.randomUUID();
        const extension = file.name.split('.').pop();
        const key = `users/${userId}/${type}s/${fileId}.${extension}`;

        // 1. Upload to R2
        await env.MEDIA_BUCKET.put(key, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        const publicUrl = `https://media.lovevibes.app/${key}`; // Replace with actual R2 custom domain

        // 2. AI Moderation Placeholder
        // const isSafe = await env.AI.run("@cf/microsoft/resnet-50", { image: [...file.buffer] });

        // 3. Update Database
        if (type === 'video') {
            await env.DB.prepare(
                "UPDATE Users SET video_intro_url = ? WHERE id = ?"
            ).bind(publicUrl, userId).run();
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

        return new Response(JSON.stringify({
            status: "uploaded",
            url: publicUrl
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response("Not Found", { status: 404 });
}

function pathMatches(path: string, target: string) {
    return path === target || path === target + '/';
}
