
$ErrorActionPreference = "Stop"

# Try using the provided key as a Token
$env:CLOUDFLARE_API_TOKEN = "f2aaff9451727366c5a80f56c569af0a3ea2b"
$env:CLOUDFLARE_ACCOUNT_ID = "f1c046265d89af2aed1428fd9f623ec9"

Write-Host "Attempting D1 Migration with provided API credentials..."
npx wrangler d1 migrations apply DB --remote

Write-Host "Migration Success!"
