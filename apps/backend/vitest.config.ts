import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: {
                    configPath: './wrangler.toml',
                },
                miniflare: {
                    compatibilityDate: '2025-01-18',
                    compatibilityFlags: ['nodejs_compat'],
                },
            },
        },
    },
    ssr: {
        noExternal: [/^(?!.*@cloudflare\/vitest-pool-workers).*$/],
    },
});
