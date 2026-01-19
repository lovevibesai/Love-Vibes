# Love Vibes Deployment Guide

This guide provides step-by-step instructions for deploying the Love Vibes platform to production.

## Backend Deployment (Cloudflare Workers)

### 1. Configure Wrangler
Update `wrangler.toml` with your production database, KV, and R2 bindings.

```toml
name = "love-vibes-backend"
main = "src/index.ts"
compatibility_date = "2025-01-18"

[[d1_databases]]
binding = "DB"
database_name = "LoveVibesDB"
database_id = "your-database-uuid"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "love-vibes-media"

[[kv_namespaces]]
binding = "GEO_KV"
id = "your-kv-namespace-id"
```

### 2. Set Production Secrets
Run the following commands to set your sensitive environment variables in Cloudflare:

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put AI_MODERATION_KEY
```

### 3. Deploy
```bash
npx wrangler deploy
```

---

## Frontend Deployment (Cloudflare Pages)

### 1. Build the Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy to Cloudflare Pages
You can deploy via the Cloudflare Dashboard or the CLI:

```bash
npx wrangler pages deploy .next
```

### 3. Environment Variables (Pages)
In the Cloudflare Dashboard, under Workers & Pages > Your Project > Settings > Variables:

* `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://api.lovevibes.ai/v1`)
* `NEXT_PUBLIC_WS_URL`: Your WebSocket URL (e.g., `wss://api.lovevibes.ai`)

---

## Database Migrations

To apply schema changes to production:

```bash
# Apply schema
npx wrangler d1 execute LoveVibesDB --remote --file=./schema.sql

# Apply specific migrations
npx wrangler d1 execute LoveVibesDB --remote --file=./migrations/some_migration.sql
```

## Infrastructure Checklist

- [ ] Cloudflare D1 Database created.
- [ ] Cloudflare R2 Bucket created.
- [ ] Cloudflare KV Namespace created.
- [ ] Durable Objects migrations run (if any).
- [ ] CORS configured in backend for frontend domain.
- [ ] SSL/TLS managed by Cloudflare.

For assistance, contact the infrastructure team at ops@lovevibes.ai.
