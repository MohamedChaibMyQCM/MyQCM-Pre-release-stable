# MyQCM Monorepo

Smart healthcare education platform combining an adaptive learning backend (NestJS), a rich Next.js frontend, and AI-assisted content generation. This monorepo holds everything required to develop, run, and audit the MyQCM product.

---

## Table of Contents

1. [Overview](#overview)  
2. [Architecture](#architecture)  
3. [Repository Structure](#repository-structure)  
4. [Prerequisites](#prerequisites)  
5. [Quick Start](#quick-start)  
6. [Environment Configuration](#environment-configuration)  
7. [Available Scripts](#available-scripts)  
8. [Testing & Quality](#testing--quality)  
9. [Security Notes](#security-notes)  
10. [Troubleshooting](#troubleshooting)  
11. [Contributing](#contributing)  
12. [License](#license)

---

## Overview

- **Domain:** Medical and healthcare education.  
- **Goal:** Deliver adaptive MCQs, AI-generated clinical cases, freelancer content tooling, and rich progress analytics.  
- **Tech Highlights:** NestJS + TypeORM, Redis-backed session management, Bull/BullMQ queues, OpenAI integration, Next.js 14 app router, Tailwind UI components.  
- **Current Health:** See `MYQCM_Comprehensive_Audit.md` for the latest platform audit (security priorities, quality gaps, and roadmap items).

---

## Architecture

| Layer | Description | Key Modules |
| --- | --- | --- |
| **Backend (`apps/backend`)** | NestJS monolith exposing REST/WebSocket APIs, queue workers, and AdminJS panel. | Auth, Training Sessions, Adaptive Engine, AI Generation, Payments, Notifications |
| **Frontend (`apps/frontend`)** | Next.js SPA with dashboard, onboarding flows, question bank, clinical case demos. | `/app` router, React Query, Tailwind components |
| **Shared** | Domain DTOs and shared utilities used across modules. | `shared/`, `common/` |
| **Data Stores** | PostgreSQL for persistence, Redis for queues/sessions/cache. | Configurable via `.env` |
| **AI Integrations** | OpenAI APIs for item generation and feedback. | `apps/backend/src/generation`, `apps/backend/src/assistant` |

---

## Repository Structure

```
myqcm-monorepo/
├── apps/
│   ├── backend/              # NestJS application + queue workers
│   └── frontend/             # Next.js 14 application
├── config/                   # (reserved for shared configs)
├── src/                      # Cross-project shared packages (e.g. MCQ DTOs)
├── MYQCM_Comprehensive_Audit.md
├── README.md                 # ← you are here
└── package.json              # Workspace scripts
```

See individual `apps/*/README.md` files for project-specific notes. (Frontend README currently mirrors the default Next.js template; backend README describes feature sets and installation basics.)

---

## Prerequisites

| Dependency | Version (minimum) |
| --- | --- |
| Node.js | 18.x or 20.x (LTS recommended) |
| npm | 9+ |
| PostgreSQL | 14+ |
| Redis | 6+ |

Optional for AI features:
- Valid OpenAI API key (or compatible endpoint).

---

## Quick Start

```bash
# 1. Install top-level dependencies (workspace-aware)
npm install

# 2. Install app-specific dependencies
npm run install-deps

# 3. Provision databases/services (Postgres, Redis). Update .env files accordingly.

# 4. Start both apps concurrently (default mode)
npm run dev

# Frontend available at: http://localhost:3000
# Backend available at:  http://localhost:3001
```

> **Tip:** Backends expect seeded data (universities, MCQs, etc.). Review `apps/backend` scripts and migrations before running in a blank environment.

### Package Manager Policy

- **npm only.** The repo standardizes on npm (lockfile v3). Yarn/PNPM lockfiles have been removed to prevent drift.
- **Fresh installs:** If you previously installed with another tool, delete `node_modules` (root + `apps/*`) and re-run `npm install`, `npm install --prefix apps/backend`, `npm install --prefix apps/frontend`.
- **Lockfile hygiene:** Never commit `yarn.lock` or `pnpm-lock.yaml`. CI and docs assume npm commands exclusively.

---

## Environment Configuration

1. **Never commit real secrets.** The repo currently contains sensitive values in `apps/backend/.env` from historical commits; rotate them before any deployment.
2. Create sanitized copies:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

3. Required backend variables include:
   - `APP_ENV`, `APP_PORT`, `CLIENT_URL`, `BACKEND_URL`
   - Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - Auth: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `HASH_SALT`
   - Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
   - Mail/Cloud: `EMAIL_FROM`, `GMAIL_USER`, `CLOUDINARY_*`
   - AI: `ASSISTANT_API_KEY`, optional `ASSISTANT_MODEL`

4. Frontend needs (examples):
   - `NEXT_PUBLIC_BASE_URL` – Backend base URL
   - `NEXT_PUBLIC_API_BASE` – Freelancer API endpoint for AI generation tooling

For complete variable requirements, inspect `apps/backend/common/utils/env.util.ts` and the audit report.

---

## Available Scripts

Top-level (`package.json`):

| Command | Description |
| --- | --- |
| `npm run dev` | Run frontend and backend concurrently (uses `concurrently`). |
| `npm run dev-frontend` | Shortcut for `npm run dev --prefix apps/frontend`. |
| `npm run dev-backend` | Shortcut for `npm run start:dev --prefix apps/backend`. |
| `npm run install-deps` | Install workspace, backend, and frontend dependencies. |

Backend (`apps/backend/package.json`):

| Command | Description |
| --- | --- |
| `npm run start:dev` | NestJS in watch mode. |
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm run start:prod` | Execute compiled backend (`node dist/main`). |
| `npm run lint` | Lint and auto-fix TypeScript files (ESLint + Prettier). |
| `npm run test` / `test:watch` / `test:cov` | Run Jest unit tests. (Currently only adaptive-engine spec exists.) |

Frontend (`apps/frontend/package.json`):

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server. |
| `npm run build` | Production build (`.next/`). |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run Next.js lint rules. |

---

## Testing & Quality

- **Backend Tests:** Located in `apps/backend/test`. Expand coverage around auth, AI generation, payments, etc.
- **Frontend Tests:** None yet. Introducing Playwright / Jest + React Testing Library is recommended.
- **Static Analysis:** ESLint + Prettier configured for backend; Next.js linting for frontend.
- **Audit Report:** `MYQCM_Comprehensive_Audit.md` lists current defects, priorities, and security tasks. Treat “Critical” items as blockers before release.

---

## Security Notes

1. **Secrets:** Purge committed `.env` files, rotate all API keys, and use a secrets manager (Vault, AWS Secrets Manager, etc.) for production.
2. **Authentication:** Restore email verification, fix session validation with Redis, and move tokens to HTTP-only cookies as outlined in the audit.
3. **Logging:** Remove verbose `console.log` statements and sanitize error responses before production.
4. **Dependencies:** Standardise on Bull *or* BullMQ, update vulnerable packages, and remove unused SDKs (e.g., Sentry) if not configured.

---

## Troubleshooting

| Symptom | Possible Cause | Resolution |
| --- | --- | --- |
| Backend refuses to start (`Error parsing env`) | Missing or malformed `.env`. | Copy `.env.example`, ensure all required keys are set. |
| Docker build fails with missing modules | Dockerfile installs production deps before running `nest build`. | Rework Dockerfile (see audit recommendations). |
| Refresh token errors in frontend | Secure storage/localStorage missing token or backend cookies unreachable. | Ensure backend sets cookies, consider HTTP-only migration. |
| OpenAI generation fails | `ASSISTANT_API_KEY` invalid or file upload path incorrect. | Verify API key, ensure `storage/` directory exists and is writable. |

---

## Contributing

1. **Branching:** Use topic branches (`feature/<name>`, `fix/<ticket>`).  
2. **Style:** Follow existing TypeScript/React guidelines. Run `npm run lint` (backend) or `npm run lint --prefix apps/frontend`.  
3. **Testing:** Add/extend Jest specs for backend features. Frontend tests are encouraged but currently optional.  
4. **Pull Requests:** Reference audit items when applicable and include testing notes.

> Before contributing, review `MYQCM_Comprehensive_Audit.md` to understand current security gaps and avoid reintroducing them.

---

## License

The backend project notes a proprietary license in `apps/backend/README.md`. Confirm license terms with the product owner before redistribution or external collaboration.

---

Need more context? Reach out to the engineering or security team listed in internal documentation, or start with the open issues referenced in `MYQCM_Comprehensive_Audit.md`.
