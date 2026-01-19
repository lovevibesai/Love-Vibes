# 💖 Love Vibes

<div align="center">

![Love Vibes Logo](./docs/assets/branding/LOVE%20VIBES%20LOGO.png)

**Next-Generation Dating & Social Networking Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Development](#-development)

</div>

---

## 🌟 Overview

Love Vibes is a next-generation dating and social networking platform. This repository contains the proprietary source code for the Love Vibes ecosystem, including the Next.js frontend and Cloudflare Workers backend.

> [!IMPORTANT]
> **Proprietary & Confidential**: All code within this repository is the property of Love Vibes AI. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## ✨ Features

### 🎯 Core Features
- **AI-Powered Matching** - Sophisticated compatibility algorithms using personality, interests, and behavioral patterns.
- **Video Profiles** - 15-second video introductions with AI quality verification.
- **Blockchain Verification** - Multi-level identity verification with trust scoring.
- **Real-Time Chat** - Instant messaging with Durable Objects for low-latency communication.
- **Smart Discovery** - Location-based matching with advanced filtering options.

### 💎 Premium Features
- **Profile Boost** - Increase visibility in discovery feed.
- **Vibe Windows** - Time-limited matching events with enhanced rewards.
- **Chemistry Quiz** - Deep compatibility assessment.
- **Voice Matching** - Audio-based profile enhancement.
- **Mutual Friends** - See shared connections (privacy-controlled).

### 🛡️ Safety & Security
- **AI Moderation** - Automated content screening and safety checks.
- **Photo Verification** - Selfie verification to prevent catfishing.
- **Privacy Controls** - Granular control over profile visibility.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4.1 with custom design system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion

### Backend
- **Runtime**: Cloudflare Workers (serverless edge computing)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Storage**: Cloudflare R2 (object storage for media)
- **Real-time**: Durable Objects (stateful WebSocket connections)
- **KV**: Cloudflare KV for geosharding and caching

---

## 📁 Project Structure

```
Love Vibes/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
├── src/                     # Cloudflare Workers backend
│   ├── index.ts            # Main worker entry point
│   └── durable_objects.ts  # Real-time chat rooms
├── migrations/              # D1 database migrations
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── API.md              # API documentation
├── schema.sql              # Database schema
├── wrangler.toml           # Cloudflare Workers config
└── package.json            # Dependencies
```

---

## 🏃 Getting Started

This section is for authorized developers with infrastructure access.

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account (authorized access)
- Git

### Local Development
1. **Clone & Install**
   ```bash
   git clone https://github.com/lovevibesai/LoveVibes.git
   npm install && cd frontend && npm install && cd ..
   ```
2. **Setup Env**
   ```bash
   cp .env.example .env.local
   cd frontend && cp .env.example .env.local && cd ..
   ```
3. **Run**
   ```bash
   # Frontend: npm run dev (in /frontend)
   # Backend: npx wrangler dev
   ```

---

## 🏗️ Architecture

Love Vibes uses a modern edge-first architecture with Next.js on Cloudflare Pages and a suite of Cloudflare services (D1, R2, Durable Objects) for the backend. Detailed docs are in [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Security Policy](./SECURITY.md)

---

## 🛠️ Development

Development access is restricted to authorized team members. Refer to the [Internal Development Guide](./DEVELOPMENT_GUIDE.md) for coding standards and internal procedures.

---

## 📄 License

**Proprietary & Confidential. All Rights Reserved.**
Unauthorized use, reproduction, or distribution is strictly prohibited. For inquiries, contact licensing@lovevibes.ai.

## 📞 Contact
- **Website**: [lovevibes.ai](https://lovevibes.ai)
- **Support**: support@lovevibes.ai

---

<div align="center">

**Internal Proprietary Codebase © Love Vibes Team**

</div>
