import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: { configPath: './wrangler.toml' },
            },
        },
    },
    ssr: {
        noExternal: true, // Inline all dependencies to resolve ESM/CJS interop issues
    },
});
