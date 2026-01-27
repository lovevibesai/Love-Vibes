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
        noExternal: [/^(?!.*@cloudflare\/vitest-pool-workers).*$/],
    },
});
