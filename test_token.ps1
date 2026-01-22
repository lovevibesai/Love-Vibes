$token = "Vuh5qw0CX6_Twrk8_qiYFBMFUz8kssQ2GYdZqric"
$headers = @{ "Authorization" = "Bearer $token" }
$resp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $headers
$resp | ConvertTo-Json -Depth 10
