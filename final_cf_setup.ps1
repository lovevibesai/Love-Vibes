$token = "Vuh5qw0CX6_Twrk8_qiYFBMFUz8kssQ2GYdZqric"
$accountId = "f1c046265d89af2aed1428fd9f623ec9"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 1. KV Namespace
Write-Host "Creating/Checking KV Namespace 'GEO_KV'..."
try {
    $kvBody = @{ title = "GEO_KV" } | ConvertTo-Json
    $kvResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/storage/kv/namespaces" -Method Post -Headers $headers -Body $kvBody
    $kvId = $kvResponse.result.id
    Write-Host "✅ KV ID: $kvId"
}
catch {
    Write-Host "⚠️ KV Creation failed or already exists. Listing namespaces..."
    $list = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/storage/kv/namespaces" -Method Get -Headers $headers
    $kv = $list.result | Where-Object { $_.title -eq "GEO_KV" }
    if ($kv) {
        $kvId = $kv.id
        Write-Host "✅ Found existing KV ID: $kvId"
    }
    else {
        Write-Host "❌ Could not find or create GEO_KV"
    }
}

# 2. R2 Bucket
Write-Host "Creating R2 Bucket 'love-vibes-media'..."
try {
    Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/r2/buckets/love-vibes-media" -Method Put -Headers $headers
    Write-Host "✅ R2 Bucket Created"
}
catch {
    Write-Host "⚠️ R2 Bucket creation warning (might exist): $_"
}

# Update wrangler.toml
if ($kvId) {
    $toml = Get-Content "wrangler.toml" -Raw
    $toml = $toml -replace 'id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"', "id = `"$kvId`""
    $toml | Set-Content "wrangler.toml"
    Write-Host "✅ wrangler.toml updated with KV ID"
}
