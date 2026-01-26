# GitHub Secrets Configuration Guide

To enable automatic deployments via GitHub Actions, you must configure the following secrets in your GitHub repository.

## Steps to Configure

1. Navigate to your repository on GitHub.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** for each of the following:

### 1. `CLOUDFLARE_API_TOKEN`

- **Value**: Your Cloudflare API Token.
- **Required Permissions**:
  - `Account` > `Workers Scripts` > `Edit`
  - `Account` > `D1` > `Edit`
  - `Account` > `KV Storage` > `Edit`
  - `Account` > `Workers R2` > `Edit`
  - `User` > `User Details` > `Read` (Crucial for Wrangler auth)
- **Criticality**: 🔴 Required for Backend CI.

### 2. `CLOUDFLARE_ACCOUNT_ID`

- **Value**: Your Cloudflare Account ID (found in the Workers & Pages dashboard sidebar).
- **Criticality**: 🔴 Required for Backend CI.

### 3. `RESEND_API_KEY`

- **Value**: `re_AGoQGcvp_7DHyVAkguQYWsv2U5uA1kkaJ` (or your own Resend key).
- **Criticality**: 🟡 High (Required for Email OTP).

### 4. `NEXT_PUBLIC_API_URL` (Optional as Secret)

- **Value**: `https://lovevibes.thelovevibes-ai.workers.dev`
- **Note**: You can also set this as a **Variable** instead of a Secret.

---

Once these are set, every push to the `main` branch will automatically deploy your backend and verify its health.
