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
