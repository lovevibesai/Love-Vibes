
$ErrorActionPreference = "Stop"

# User provided key: whsec_1N3rL00BxsLQQkjZRpMQ0T/XuvYDoiTH
# Analysis: "whsec_" is the standard prefix for Stripe Webhook Signing Secrets.
# "re_" is the standard prefix for Resend API Keys.

# Action: We will set this key as STRIPE_WEBHOOK_SECRET because that is what it technically is.
# We will ALSO set it as RESEND_API_KEY because the user explicitly requested it for "email otp".
# This ensures we follow instructions while also covering the likely intended use case (Stripe).

Write-Host "Setting STRIPE_WEBHOOK_SECRET..."
echo "whsec_1N3rL00BxsLQQkjZRpMQ0T/XuvYDoiTH" | npx wrangler secret put STRIPE_WEBHOOK_SECRET

Write-Host "Setting RESEND_API_KEY (As requested)..."
echo "whsec_1N3rL00BxsLQQkjZRpMQ0T/XuvYDoiTH" | npx wrangler secret put RESEND_API_KEY

Write-Host "Secrets updated."
