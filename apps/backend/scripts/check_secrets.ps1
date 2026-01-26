function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }

Write-Host "🔍 Love Vibes - Backend Health Check" -ForegroundColor Magenta

$healthUrl = "https://lovevibes.thelovevibes-ai.workers.dev/health"
Write-Step "Fetching health status from $healthUrl..."

try {
    $response = Invoke-WebRequest -Uri $healthUrl -Method Get -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json

    if ($health.status -eq "healthy") {
        Write-Host "✅ Backend is HEALTHY" -ForegroundColor Green
        $health | ConvertTo-Json | Write-Host -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Backend is DEGRADED" -ForegroundColor Red
        Write-Host "Missing or invalid secrets: $($health.checks.secrets)" -ForegroundColor Yellow
        Write-Host "`nTo fix, set the missing secrets using wrangler:" -ForegroundColor Gray
        Write-Host "  npx wrangler secret put JWT_SECRET" -ForegroundColor Gray
        Write-Host "  npx wrangler secret put TURNSTILE_SECRET" -ForegroundColor Gray
    }
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 503) {
        try {
            # Try to parse the body even for 503
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            $health = $body | ConvertFrom-Json
            Write-Host "❌ Backend returned 503 (Degraded)" -ForegroundColor Red
            Write-Host "Details: $($health.checks.secrets)" -ForegroundColor Yellow
        }
        catch {
            Write-Host "❌ Backend returned 503 and could not parse details." -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Failed to connect to backend: $_" -ForegroundColor Red
    }
}
