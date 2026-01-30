
$ErrorActionPreference = "Stop"

# Set credentials for Global API Key Authentication
$env:CLOUDFLARE_EMAIL = "thelovevibes.ai@gmail.com"
$env:CLOUDFLARE_API_KEY = "f2aaff9451727366c5a80f56c569af0a3ea2b"
$env:CLOUDFLARE_ACCOUNT_ID = "f1c046265d89af2aed1428fd9f623ec9"

# Clear conflicting token if set
$env:CLOUDFLARE_API_TOKEN = ""

Write-Host "Authenticating with Email + Global Key..."
Write-Host "Applying D1 Database Migrations..."

# Run migration
npx wrangler d1 migrations apply DB --remote

Write-Host "Migration Success!"
