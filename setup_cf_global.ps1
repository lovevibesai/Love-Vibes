$key = "f2aaff9451727366c5a80f56c569af0a3ea2b"
$email = "Thelovevibes.ai@gmail.com"
$accountId = "f1c046265d89af2aed1428fd9f623ec9"

$headers = @{
    "X-Auth-Key"   = $key
    "X-Auth-Email" = $email
    "Content-Type" = "application/json"
}

# 1. Check/Create KV
Write-Host "Checking KV Namespace 'GEO_KV'..."
$kvList = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/storage/kv/namespaces" -Method Get -Headers $headers
$kv = $kvList.result | Where-Object { $_.title -eq "GEO_KV" }

if ($kv) {
    $kvId = $kv.id
    Write-Host "✅ Found existing KV: $kvId"
}
else {
    Write-Host "Creating KV Namespace..."
    $kvBody = @{ title = "GEO_KV" } | ConvertTo-Json
    $kvResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/storage/kv/namespaces" -Method Post -Headers $headers -Body $kvBody
    $kvId = $kvResp.result.id
    Write-Host "✅ Created KV: $kvId"
}

# 2. Check/Create R2
Write-Host "Checking R2 Bucket 'love-vibes-media'..."
try {
    # Try to put (create). Cloudflare will error if it exists or if R2 not enabled.
    Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/r2/buckets/love-vibes-media" -Method Put -Headers $headers
    Write-Host "✅ Created R2 Bucket"
}
catch {
    Write-Host "⚠️ R2 Bucket check/creation note: $_"
}

# 3. Update wrangler.toml
$toml = Get-Content "wrangler.toml" -Raw
$toml = $toml -replace 'id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"', "id = `"$kvId`""
$toml | Set-Content "wrangler.toml"
Write-Host "✅ wrangler.toml updated."

# Output IDs for the next step
@{ kv_id = $kvId } | ConvertTo-Json | Set-Content "cf_env.json"
