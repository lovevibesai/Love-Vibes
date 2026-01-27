/**
 * Cloudflare Images Optimization Utility
 * Serves R2 media through the resizing proxy to reduce bandwidth and enhance performance.
 */
import { Env } from './index';

export interface ImageTransform {
    width?: number;
    height?: number;
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    quality?: number;
    format?: 'webp' | 'avif' | 'json';
}

/**
 * Generates an optimized image URL or fetches it via the resizing proxy.
 * Note: Requires Cloudflare Images (Resizing) to be enabled on the zone.
 */
export function getOptimizedImageUrl(
    imageKey: string,
    transform: ImageTransform = { width: 800, fit: 'cover', quality: 85 }
): string {
    // In production, this would point to your domain's /cdn-cgi/image/ endpoint
    // Format: https://yourdomain.com/cdn-cgi/image/<transformations>/<path-to-r2-image>

    const params = Object.entries(transform)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

    // Assuming the Worker is serving R2 at /media/ shortcut
    return `/cdn-cgi/image/${params}/media/${imageKey}`;
}

/**
 * Direct fetch with resizing (if using Workers Image Resizing)
 */
export async function fetchWithResizing(
    request: Request,
    env: Env,
    imageKey: string,
    options: ImageTransform
): Promise<Response> {
    const bucket = env.MEDIA_BUCKET;
    const object = await bucket.get(imageKey);

    if (!object) {
        return new Response('Not Found', { status: 404 });
    }

    // In a Worker, you can use the 'cf' property to request resizing from Cloudflare's edge
    // if the zone has Image Resizing enabled.
    return new Response(object.body, {
        headers: {
            'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        },
        cf: {
            image: options
        }
    });
}
