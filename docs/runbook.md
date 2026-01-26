# Love Vibes - Operations Runbook

> **Purpose:** Incident Response & Emergency Procedures  
> **Status:** Live

This runbook defines how to handle production incidents, database recovery, and emergency maintenance.

---

## 1. Emergency Rollback

If a bad deployment breaks production:

### Backend (Workers)
```bash
# Instant rollback to previous active version
wrangler rollback
```

### Frontend (Pages)
1. Go to Cloudflare Dashboard -> Pages
2. Select Project -> Deployments
3. Find last successful build
4. Click "Rollback to this deployment"

---

## 2. Disaster Recovery (Database)

If data corruption or accidental deletion occurs:

### Restore from Backup
1. **Locate Backup:** Find latest `backup-YYYY-MM-DD.sql`.
2. **Verify:** Check backup file integrity.
3. **Restore:**
   ```bash
   wrangler d1 execute love-vibes-db --file=./path/to/backup.sql
   ```

*(Note: Periodic backups should be automated via script)*

---

## 3. Incident Response

### Scenario A: Payment Webhook Failure
**Symptom:** Users paying but not getting credits.
**Action:**
1. Check Stripe Dashboard for webhook failures (4xx/5xx).
2. Check Worker Logs for "Signature verification failed".
3. If secret rotated, update `STRIPE_WEBHOOK_SECRET` via `wrangler secret put`.

### Scenario B: Chat Outage (Durable Objects)
**Symptom:** Chat messages not sending/loading.
**Action:**
1. Check Cloudflare Status (Workers/DO outage?).
2. Check `ChatRoom` class logs for exceptions.
3. Restart/Redeploy backend to force DO code refresh.

### Scenario C: Abuse / Spam Attack
**Symptom:** High load, user reports of spam.
**Action:**
1. Identify abusive IP or User ID from logs.
2. **Ban User:** Update `Users` table set `subscription_tier = 'banned'`.
3. **Block IP:** Add WAF rule in Cloudflare Dashboard.

---

## 4. Maintenance Mode

To enable maintenance mode (if implemented):
1. Set KV flag `MAINTENANCE_MODE = true`.
2. Workers will return 503 Service Unavailable with "Under Maintenance" message.
