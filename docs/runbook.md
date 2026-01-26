# Love Vibes - Operations Runbook

> **Purpose:** Incident Response & Emergency Procedures  
> **Status:** Live

This runbook defines how to handle production incidents, database recovery, and emergency maintenance.

---

## 1. Emergency Rollback

If a bad deployment breaks production:

### Backend (Workers)
Top priority if API is erroring.
```bash
# Instant rollback to previous active version
wrangler rollback
```

### Frontend (Pages)
1. Go to Cloudflare Dashboard -> Pages
2. Select Project (`love-vibes-frontend`) -> Deployments
3. Find last successful build
4. Click "Rollback to this deployment"

---

## 2. Disaster Recovery (Database)

If data corruption or accidental deletion occurs:

### Restore from Backup
1. **Locate Backup:** Exported via cron or manual export.
2. **Verify Integrity:** Check backup file size/content locally.
3. **Execute Restore:**
   ```bash
   wrangler d1 execute love-vibes-db --file=./backups/backup-YYYY-MM-DD.sql
   ```

### Full Dump (Forensic)
Before risky operations, always dump current state:
```bash
wrangler d1 export love-vibes-db --output=forensic-dump.sql
```

---

## 3. Incident Response Scenarios

### Scenario A: Payment Webhook Failure
**Symptom:** Users paying but not getting credits.
**Action:**
1. Check Stripe Dashboard for webhook failures (4xx/5xx).
2. Check Worker Logs for "Signature verification failed".
3. **Fix:** If secret mismatch, rotate secret: `wrangler secret put STRIPE_WEBHOOK_SECRET`.
4. **Retry:** Use Stripe Dashboard to "Retry" failed webhooks.

### Scenario B: Chat Outage (Durable Objects)
**Symptom:** Chat messages not sending/loading for specific matches.
**Action:**
1. Check Cloudflare Status (Global Workers/DO outage?).
2. Search Logs for `ChatRoom` exceptions (e.g., storage limits search `error`).
3. **Mitigate:** Redeploy backend to force code refresh on DOs (DOs restart on code change).

### Scenario C: Abuse / Spam Attack
**Symptom:** High load, user reports of spam.
**Action:**
1. Identify abusive IP or User ID from logs (filtering by request rate).
2. **Ban User:** 
   ```sql
   UPDATE Users SET subscription_tier = 'banned' WHERE id = 'ABUSE_USER_ID';
   ```
3. **Block IP:** Add WAF rule in Cloudflare Dashboard -> Security -> WAF.

---

## 4. Maintenance Mode

To enable maintenance mode (effectively stops all non-admin traffic):

1. **Enable:** Set KV Key or Env Var `MAINTENANCE_MODE = "true"`.
2. **Effect:** Workers return `503 Service Unavailable`.
3. **Message:** "Love Vibes is undergoing maintenance. We'll be back shortly."
