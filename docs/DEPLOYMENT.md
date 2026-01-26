# Love Vibes - Deployment & Operations

> **Status:** Production Checklist & Procedures  
> **Platform:** Cloudflare Workers & Pages

This document outlines the authoritative procedures for deploying and maintaining Love Vibes.

---

## 1. Production Checklist

Before any major release, validating against the **Production Checklist** is mandatory.

### Critical Validation (MUST PASS)
- [ ] **Secrets Verification:** `/health` endpoint returns "healthy"
- [ ] **Database state:** D1 migrations applied (`wrangler d1 execute`)
- [ ] **Durable Objects:** Chat persistence verified
- [ ] **Rate Limiting:** Abuse protection verified
- [ ] **E2E Flow:** Full user sign-up -> match -> chat journey passed

*(See full checklist in `PRODUCTION_CHECKLIST.md` if available, or repository root)*

---

## 2. Deployment Commands

### Backend (Workers)
```bash
cd apps/backend
npm install
wrangler deploy
```

### Frontend (Pages)
```bash
cd apps/frontend
npm install
npm run build
npm run pages:deploy
```

### Database Updates
```bash
# Apply schema changes
wrangler d1 execute love-vibes-db --file=../../infra/database/schema.sql
```

---

## 3. Operations & Secrets

### Environment Variables
Managed via Cloudflare Dashboard or `wrangler secret put`.

| Secret | Purpose | Criticality |
|--------|---------|-------------|
| `JWT_SECRET` | Token signing | 🔴 Critical |
| `TURNSTILE_SECRET` | Bot protection | 🔴 Critical |
| `RESEND_API_KEY` | Email OTP delivery | 🟡 High |
| `STRIPE_SECRET_KEY` | Payments | 🟡 High |

### Monitoring
- **Logs:** Cloudflare Dashboard -> Workers -> Logs (Real-time)
- **Analytics:** Cloudflare Workers Analytics (Requests, CPU, Errors)
- **Health Check:** `https://api.lovevibes.app/health`

---

## 4. Rollback Procedure

See [Runbook](./runbook.md) for detailed emergency procedures.

**Quick Revert:**
```bash
wrangler rollback
```
