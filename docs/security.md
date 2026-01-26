# Love Vibes - Security & Privacy

> **Philosophy:** Privacy by Design  
> **Standard:** Production-Grade Hardening

---

## 1. Authentication & Identity

### 1.1 Strategies
- **Email OTP:** Passwordless, high-security email verification using Resend.
- **Passkeys (WebAuthn):** Biometric/device-bound authentication (phishing resistant).
- **OAuth:** Optional Google integration.

### 1.2 Session Management
- **JWT:** Stateless session tokens signed with `JWT_SECRET`.
- **Expiration:** Tokens are short-lived.
- **Verification:** Middleware `checkAuth` validates signature on every protected route.

---

## 2. Network Security

### 2.1 Cloudflare WAF
All traffic passes through Cloudflare's Web Application Firewall.
- **Bot Fight Mode:** Enabled
- **Turnstile:** Challenge managed injection on auth forms (Registration/Login).
- **Block:** Automatic blocking of known malicious user agents.

### 2.2 Rate Limiting (DoS Protection)
Enforced at the Worker level using scalable backend checking:
- **Auth Routes:** `5 req/min` per IP (prevent brute force).
- **API Routes:** `100 req/min` per User (prevent scraping).
- **Swipe Actions:** `200 req/min` (prevent bot swiping).

---

## 3. Data Protection

### 3.1 Database (D1)
- **Encryption:** Data encrypted at rest by Cloudflare.
- **Access:** Only execution via Worker bindings. No public TCP access.
- **Inputs:** All SQL queries use parameterized binding (`?`) to prevent SQL injection.

### 3.2 Media (R2)
- **Private Buckets:** Not publicly listable.
- **Access Control:** Files served via signed URLs or Workers proxy to enforce visibility rules.

---

## 4. Content Safety & Moderation

### 4.1 AI Moderation
- **Trust & Safety API:** All uploaded photos scanned for:
  - Nudity / NSFW
  - Minors
  - Violence
- **Reject:** Unsafe content blocked immediately at upload time.

### 4.2 User Controls
- **Block:** Users can block others (mutual interaction limit).
- **Report:** Flag users for admin review (stored in `Reports` table).

---

## 5. Secrets Management

- **Storage:** Cloudflare Encrypted Secrets (`wrangler secret put`).
- **Policy:** Secrets **NEVER** committed to Git. Checked via `.gitignore`.
- **Rotation:** Supports manual rotation of keys (requires redeploy).

### Critical Secrets List
- `JWT_SECRET`
- `TURNSTILE_SECRET`
- `RESEND_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
