# Love Vibes ❤️

## Repository Overview

**Love Vibes** is a production-grade, privacy-first dating platform built on Cloudflare's edge infrastructure. This repository contains the complete source code for backend services, frontend web application, and mobile shell, organized as a single monorepo for clarity, consistency, and operational discipline.

> **Repository Visibility:** Private  
> **License:** Proprietary (All rights reserved)  
> **Audience:** Internal team only

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Cloudflare Workers, Durable Objects, D1, R2 |
| **Frontend** | Next.js (Cloudflare Pages) |
| **Mobile** | Capacitor (Android / iOS) |
| **Auth** | Email OTP, Passkeys (WebAuthn), OAuth |
| **Payments** | Stripe |
| **Security** | Cloudflare WAF, Turnstile, Rate Limiting |

---

## Monorepo Structure

```
love-vibes/
│
├── backend/               # Cloudflare Workers API & WebSockets
│   ├── src/              # TypeScript source
│   ├── schema.sql        # D1 database schema
│   └── wrangler.toml     # Worker configuration
│
├── frontend/              # Next.js web client (Pages)
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   └── lib/              # Utilities & API client
│
├── docs/                  # Internal documentation
│   ├── architecture.md
│   ├── deployment.md
│   ├── security.md
│   └── runbook.md
│
├── .github/               # GitHub templates
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE.md
│
├── .editorconfig
├── .gitignore
├── README.md
└── LICENSE
```

---

## Development Principles

- **Main branch is always deployable**
- No direct commits to `main`
- All changes via pull requests
- Clear, intentional commit history
- Secrets never committed to Git

---

## Branching Strategy

```
main            → production-ready
feature/*       → new features
fix/*           → bug fixes
hotfix/*        → production emergencies
```

---

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Backend | Cloudflare Workers |
| Frontend | Cloudflare Pages |
| Database | D1 |
| Media | R2 |

See `docs/deployment.md` for the production checklist.

---

## Security

This repository is **private** and for authorized contributors only.

- Secrets managed via Cloudflare environment variables
- Stripe webhooks signature-verified
- Rate limiting and WAF protection enabled
- AI moderation for content safety

See `docs/security.md` for details.

---

## License

This software is proprietary and confidential.

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

See the `LICENSE` file for full terms.

---

## Status

**Production-ready.**

This repository reflects a hardened v1 system designed for real-world deployment, monitoring, and iteration.
