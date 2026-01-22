# Love Vibes Internal Development Guide

This guide is for authorized developers working on the Love Vibes platform.

## Code of Conduct

All developers are expected to adhere to the [Internal Team Standards](./CODE_OF_CONDUCT.md).

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Git
- Cloudflare account (authorized access required)

### Setting Up Your Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/lovevibesai/LoveVibes.git
   cd LoveVibes
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   cd frontend && cp .env.example .env.local && cd ..
   ```

4. **Run development servers**
   ```bash
   # Frontend
   cd frontend && npm run dev
   
   # Backend
   npx wrangler dev
   ```

## Coding Standards

### TypeScript
- Strict mode is enabled.
- Avoid `any`; use specific interfaces or `unknown`.

### Code Style
- **Formatting**: Managed by Prettier.
- **Linting**: Managed by ESLint.
- **Naming**: PascalCase for components, camelCase for variables/functions.

### Git Workflow
- **Branching**: Use `feature/`, `fix/`, or `chore/` prefixes.
- **Commits**: Follow Conventional Commits.
- **PRs**: All changes must go through an internal Pull Request and be reviewed by at least one other developer.

## Internal Procedures

### Incident Reporting
Report any security vulnerabilities or critical system failures immediately to the lead architect or via the private security channel.

### Production Access
Production credentials and keys are managed via Cloudflare Secrets. Only authorized leads have write access to production secrets.

## Owner Directory Protocol

The `LOVE VIBES OWNER` directory is a protected area containing proprietary blueprints, branding assets, and financial reports. 
- **NO MOVING**: Never move the folder or its contents.
- **READ-ONLY PREFERENCE**: If content from this directory is needed for AI tasks, it must be **copied** (not moved) to a working directory.
- **OWNER-ONLY PRIVACY**: This folder is dedicated to the project owner for manual storage and reference.

---

**Confidential & Proprietary © Love Vibes AI**
