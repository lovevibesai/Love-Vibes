# Love Vibes - Deployment & Operations

> **Status:** Production Checklist & Procedures  
> **Platform:** Cloudflare Workers & Pages

This document outlines the authoritative procedures for deploying and maintaining Love Vibes.

---

## 1. Production Checklist

> **Readiness Score:** 97/100

### Pre-Flight Summary
| Area | Status |
|------|--------|
| Backend architecture | ✅ Sound |
| Cloudflare Workers/D1/R2/DO | ✅ Correct |
| Frontend + Pages config | ✅ Accurate |
| TypeScript compilation | ✅ 0 errors |
| API sync (backend ↔ frontend) | ✅ 100% |
| Security posture | ✅ Above average for v1 |
| Mobile (Capacitor) | ✅ Realistic |

---

## 2. Infrastructure Setup

### 2.1 Keys & Secrets
**Where:** Cloudflare Dashboard → Workers & Pages → love-vibes-backend → Settings → Variables

| Secret | Criticality |
|--------|-------------|
| `JWT_SECRET` | 🔴 Critical |
| `TURNSTILE_SECRET` | 🔴 Critical |
| `RESEND_API_KEY` | 🟡 High |
| `STRIPE_SECRET_KEY` | 🟡 High (if billing) |

### 2.2 Database (D1)
```bash
# Verify tables exist
wrangler d1 execute love-vibes-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 2.3 Media Storage (R2)
- Bucket: `love-vibes-media`
- CORS: Allowed Origins `https://lovevibes.app`

---

## 3. Critical Validation (6 MUST DO Items)

> **⚠️ Do NOT launch until ALL 6 pass**

### ✅ 3.1 Secrets Verification (Runtime)
**Validation:**
```bash
curl https://lovevibes.thelovevibes-ai.workers.dev/health
```
**Expected:** `{"status": "healthy", "checks": {"secrets": "ok", ...}}`

**Diagnostic Script:**
Use the included PowerShell script for a detailed health report:
```powershell
./apps/backend/scripts/check_secrets.ps1
```

### 3.2 D1 Migration Idempotency
```bash
# Run twice - second run must not fail
wrangler d1 execute love-vibes-db --file=../../infra/database/schema.sql
wrangler d1 execute love-vibes-db --file=../../infra/database/schema.sql
```

### 3.3 Durable Object Lifecycle
- [ ] Messages persist after idle/hibernation (2-3 mins wait)
- [ ] No "connection closed" errors

### 3.4 Rate-Limit Enforcement
```bash
# Rapid-fire test
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" ... done
```
- [ ] Requests 6+ return **429**

### 3.5 Stripe Payment Loop (If Enabled)
- [ ] Payment succeeds
- [ ] Webhook received
- [ ] Idempotent (no double-credit)

### 3.6 End-to-End User Journey
- [ ] Sign up -> Onboarding -> Swipe -> Match -> Chat sequence passes

---

## 4. Launch Procedure

### Deploy Commands

```bash
# Backend
cd apps/backend
npm install
wrangler deploy
# Verify health immediately
./scripts/check_secrets.ps1

# Frontend
cd apps/frontend
npm install
npm run build
npx wrangler pages deploy .vercel/output/static --project-name love-vibes-frontend
```

### Rollback Commands

```bash
# Workers
wrangler rollback

# Pages
# Dashboard → Deployments → Select previous → "Rollback to this deployment"

# Database Restore
wrangler d1 execute love-vibes-db --file=backup.sql
```

---

## 5. Operations Reference

### Dashboard Locations
| Item | Location |
|------|----------|
| Workers secrets | Workers & Pages → love-vibes-backend → Settings → Variables |
| D1 Database | Workers & Pages → D1 |
| R2 Bucket | R2 → love-vibes-media |
| Logs | Workers & Pages → love-vibes-backend → Logs |

### Launch Authority
✅ All 6 critical validations pass  
✅ Health endpoint returns `"healthy"`  
✅ E2E user journey completes  

**🚀 Complete the checklist → Launch!**
