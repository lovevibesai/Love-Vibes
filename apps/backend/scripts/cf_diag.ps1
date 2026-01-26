$token = "Vuh5qw0CX6_Twrk8_qiYFBMFUz8kssQ2GYdZqric"
$accountId = "f1c046265d89af2aed1428fd9f623ec9"
$headers = @{ "Authorization" = "Bearer $token" }

Write-Host "Verifying Token..."
try {
    $v = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $headers
    $v | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "Token verification failed: $_"
}

Write-Host "`nTesting D1 List..."
try {
    $d1 = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database" -Headers $headers
    Write-Host "Success! Found $($d1.result.Count) databases."
}
catch {
    Write-Host "D1 List failed: $_"
}

Write-Host "`nTesting KV List..."
try {
    $kv = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/storage/kv/namespaces" -Headers $headers
    Write-Host "Success! Found $($kv.result.Count) KV namespaces."
}
catch {
    Write-Host "KV List failed: $_"
}
