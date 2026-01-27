import { _env, SELF } from 'cloudflare:test';
import { it, expect, describe } from 'vitest';

describe('Love Vibes Backend', () => {
    it('responds with health status', async () => {
        const response = await SELF.fetch('http://localhost/health');
        expect([200, 503]).toContain(response.status);

        const data = await response.json() as any;
        expect(['healthy', 'degraded']).toContain(data.status);
        expect(data.checks).toBeDefined();
    });

    it('returns 404 for unknown routes', async () => {
        const response = await SELF.fetch('http://localhost/unknown-route');
        expect(response.status).toBe(404);
    });
});
