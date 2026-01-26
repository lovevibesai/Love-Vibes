# Love Vibes Backend

This directory contains the Cloudflare Workers backend for the Love Vibes application.

## Directory Structure
- `src/`: Source code for Workers and Durable Objects.
- `migrations/`: D1 Database migrations.
- `scripts/`: PowerShell scripts for deployment and setup.
- `wrangler.toml`: Cloudflare Worker configuration.

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npx wrangler dev
   ```

## Deployment
Deploy to Cloudflare Workers:
```bash
npx wrangler deploy
```

### Secrets Management
Critical secrets must be set manually in Cloudflare (they are not in `wrangler.toml` for security):
```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put RESEND_API_KEY
```
Use `./scripts/check_secrets.ps1` to verify the backend health and secrets configuration.
