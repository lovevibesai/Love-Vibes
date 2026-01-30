
$ErrorActionPreference = "Stop"

# Set credentials for Cloudflare
$env:CLOUDFLARE_EMAIL = "thelovevibes.ai@gmail.com"
$env:CLOUDFLARE_API_KEY = "f2aaff9451727366c5a80f56c569af0a3ea2b"
$env:CLOUDFLARE_ACCOUNT_ID = "f1c046265d89af2aed1428fd9f623ec9"
$env:CLOUDFLARE_API_TOKEN = "" # Clear token to use Global Key

# Set Frontend Env Vars for Build
$env:NEXT_PUBLIC_API_URL = "https://lovevibes.thelovevibes-ai.workers.dev"
$env:NEXT_PUBLIC_WS_URL = "wss://lovevibes.thelovevibes-ai.workers.dev"

Write-Host "Installing Frontend Dependencies..."
npm install --legacy-peer-deps

Write-Host "Building Frontend..."
npm run build

Write-Host "Deploying to Cloudflare Pages..."
# Assuming output: 'export' creates an 'out' directory
npx wrangler pages deploy out --project-name "love-vibes-app" --commit-dirty=true

Write-Host "Frontend Deployment Complete!"
