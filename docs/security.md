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
- **Expiration:** Short-lived tokens with refresh mechanism (roadmap).
- **Storage:** Secure HTTP-only cookies or secure local storage (depending on client).

---

## 2. Network Security

### 2.1 Cloudflare WAF
All traffic passes through Cloudflare's Web Application Firewall.
- **Bot Fight Mode:** Enabled
- **Turnstile:** Challenge managed injection on auth forms.

### 2.2 Rate Limiting
Enforced at the Worker level:
- **Auth Routes:** Strict limits (e.g., 5 req/min) to prevent brute force.
- **API Routes:** User-based limits to prevent scraping.
- **Swipe Actions:** Velocity checks to prevent bot-swiping.

---

## 3. Data Protection

### 3.1 Database (D1)
- **Encryption:** At rest (Cloudflare D1 default).
- **Access:** Only accessible via Worker bindings (no public internet access).

### 3.2 Media (R2)
- **Private Buckets:** Not publicly listable.
- **Access Control:** Signed URLs or custom domain mapping with WAF.

---

## 4. Content Safety

### 4.1 Moderation
- **AI Analysis:** Text and image analysis on upload.
- **Reporting:** User-initiated reporting workflow.
- **Admin Tools:** Moderation dashboard for review.

---

## 5. Secrets Management

- **Storage:** Encrypted in Cloudflare Secrets store.
- **Injection:** Injected at runtime as environment variables.
- **Policy:** Secrets **NEVER** committed to Git. Checked via `.gitignore`.
