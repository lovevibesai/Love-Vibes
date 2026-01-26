$token = "Vuh5qw0CX6_Twrk8_qiYFBMFUz8kssQ2GYdZqric"
$accountId = "f1c046265d89af2aed1428fd9f623ec9"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

Write-Host "Creating KV Namespace..."
$kvBody = @{ title = "GEO_KV" } | ConvertTo-Json
$kvResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/storage/kv/namespaces" -Method Post -Headers $headers -Body $kvBody
$kvId = $kvResponse.result.id
Write-Host "KV ID: $kvId"

Write-Host "Creating D1 Database..."
$d1Body = @{ name = "LoveVibesDB" } | ConvertTo-Json
$d1Response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database" -Method Post -Headers $headers -Body $d1Body
$d1Id = $d1Response.result.uuid
Write-Host "D1 ID: $d1Id"

Write-Host "Creating R2 Bucket..."
# R2 Creation is a PUT request to /accounts/:account_id/r2/buckets/:bucket_name
$r2Uri = "https://api.cloudflare.com/client/v4/accounts/$accountId/r2/buckets/love-vibes-media"
try {
    Invoke-RestMethod -Uri $r2Uri -Method Put -Headers $headers
    Write-Host "R2 Bucket created: love-vibes-media"
}
catch {
    Write-Host "R2 Bucket might already exist or error: $_"
}

$results = @{
    kv_id = $kvId
    d1_id = $d1Id
} | ConvertTo-Json

$results | Set-Content "cf_results.json"
Write-Host "Finished. Results saved to cf_results.json"
