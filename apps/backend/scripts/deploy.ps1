# Love Vibes - Cloudflare Deployment Helper
# This script automates resource creation and deployment.

function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }

Write-Host "💖 Love Vibes - Cloudflare Deployment" -ForegroundColor Magenta

# 1. Check Wrangler
if (!(Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "npx is not installed. Please install Node.js."
    exit
}

Write-Step "Checking Cloudflare Login..."
npx wrangler whoami

# 2. Create Resources
Write-Step "Creating D1 Database..."
$d1Output = npx wrangler d1 create LoveVibesDB --format json | ConvertFrom-Json
$dbId = $d1Output.database_id
Write-Host "✅ D1 Created: $dbId" -ForegroundColor Green

Write-Step "Creating KV Namespace..."
$kvOutput = npx wrangler kv:namespace create GEO_KV --format json | ConvertFrom-Json
$kvId = $kvOutput.id
Write-Host "✅ KV Created: $kvId" -ForegroundColor Green

Write-Step "Creating R2 Bucket..."
npx wrangler r2 bucket create love-vibes-media
Write-Host "✅ R2 Bucket Created: love-vibes-media" -ForegroundColor Green

# 2.1 Initialize Database Schema
Write-Step "Initializing Database Schema..."
npx wrangler d1 execute LoveVibesDB --file=schema.sql --remote --yes

Write-Step "Applying Migrations..."
$migrationFiles = Get-ChildItem "migrations/*.sql" | Sort-Object Name
foreach ($file in $migrationFiles) {
    Write-Host "Applying $($file.Name)..." -ForegroundColor Gray
    npx wrangler d1 execute LoveVibesDB --file=$($file.FullName) --remote --yes
}
Write-Host "✅ Database migrations applied." -ForegroundColor Green

# 3. Update Configuration
Write-Step "Updating wrangler.toml files..."
$backendToml = Get-Content "wrangler.toml" -Raw
$backendToml = $backendToml -replace 'database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"', "database_id = `"$dbId`""
$backendToml = $backendToml -replace 'id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"', "id = `"$kvId`""
$backendToml | Set-Content "wrangler.toml"

Write-Host "✅ Configuration files updated." -ForegroundColor Green

# 4. Deploy Backend
Write-Step "Deploying Backend (Workers)..."
npx wrangler deploy

# 5. Deploy Frontend
Write-Step "Deploying Frontend (Pages)..."
Set-Location frontend
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name love-vibes-frontend
Set-Location ..

# 6. Verify Deployment Health
Write-Step "Verifying Deployment Health..."
Start-Sleep -Seconds 5 # Give the worker a moment to stabilize
$healthUrl = "https://lovevibes.thelovevibes-ai.workers.dev/health"
try {
    $health = Invoke-RestMethod -Uri $healthUrl -Method Get
    if ($health.status -eq "healthy") {
        Write-Host "✅ Backend is healthy and configured correctly." -ForegroundColor Green
    }
    else {
        Write-Warning "⚠️ Backend is DEGRADED: $($health.checks.secrets)"
        Write-Warning "Check your Cloudflare secrets (e.g., npx wrangler secret put JWT_SECRET)."
    }
}
catch {
    Write-Warning "❌ Could not reach health endpoint at $healthUrl. Check the URL and deployment logs."
}

Write-Host "`n🚀 DEPLOYMENT COMPLETE!" -ForegroundColor Magenta
Write-Host "Check your Cloudflare dashboard for the URLs."
