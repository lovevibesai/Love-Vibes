
$ErrorActionPreference = "Stop"

# 1. Set Cloudflare Account ID (Application Secret)
Write-Host "Setting CLOUDFLARE_ACCOUNT_ID..."
echo "f1c046265d89af2aed1428fd9f623ec9" | npx wrangler secret put CLOUDFLARE_ACCOUNT_ID

# 2. Set Cloudflare API Token (Application Secret)
Write-Host "Setting CLOUDFLARE_API_TOKEN..."
echo "f2aaff9451727366c5a80f56c569af0a3ea2b" | npx wrangler secret put CLOUDFLARE_API_TOKEN

# 3. Set JWT Secret (Generated Securely)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
Write-Host "Setting JWT_SECRET..."
echo $jwtSecret | npx wrangler secret put JWT_SECRET

Write-Host "Secrets configuration complete."
