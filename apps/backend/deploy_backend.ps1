
$ErrorActionPreference = "Stop"

Write-Host "Applying D1 Database Migrations..."
# Auto-confirm with --yes to avoid interactive prompt blocking
npx wrangler d1 migrations apply DB --remote --yes

Write-Host "Deploying Worker..."
npx wrangler deploy

Write-Host "Deployment Complete!"
