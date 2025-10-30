# MyQCM - Comprehensive Product & Code Quality Audit

**Date of Audit:** 2025-10-30 
**Auditor:** AI Agent Codex (GPT-5)

---

## 1. Executive Summary

- **Overall Quality Score:** 3/10  
- **High-Level Assessment:** The monorepo shows clear ambition with modular NestJS services, AI-assisted content generation, and a rich learner dashboard. However, critical production secrets are committed to source control, email verification is disabled in configuration, and password reset paths can store plaintext credentials. Build and deployment artefacts are inconsistent, and several flagship features (payments, observability) are stubbed or non-operational. Substantial hardening is required before the platform can be trusted for healthcare education workloads.

- **Key Strengths:**
  - Domain-driven NestJS module layout keeps responsibilities separated (`apps/backend/src/app.module.ts:41`).
  - Session management hashes refresh tokens and ties them to device fingerprints (`apps/backend/src/auth/auth.service.ts:83`).
  - AI generation service validates OpenAI responses against a strict schema before persisting (`apps/backend/src/generation/generation-ai.service.ts:123`).

- **Critical Risks & Weaknesses:**
  - Production credentials and API keys are committed alongside `SKIP_EMAIL_VERIFICATION=true` (`apps/backend/.env:1`, `apps/backend/src/auth/services/auth-user.service.ts:36`).
  - Freelancer password updates overwrite hashes with plaintext (`apps/backend/src/freelancer/freelancer.service.ts:169`).
  - Session validation is commented out and tokens persist in localStorage while Google OAuth lacks state checks (`apps/backend/src/auth/strategy/access-token.strategy.ts:25`, `apps/frontend/src/app/lib/api.ts:26`, `apps/frontend/src/app/google-redirect/page.jsx:15`).
  - Global error filter returns stack traces and console logging leaks sensitive payloads (`apps/backend/common/filters/global-expection.filter.ts:75`, `apps/frontend/src/app/generation/[id]/items/page.tsx:192`).
  - Build/deploy scripts are inconsistent (Docker installs production deps before compile; payment endpoint returns `false`) (`apps/backend/Dockerfile:6`, `apps/backend/src/payment/payment.controller.ts:73`).

- **Top 3 Strategic Recommendations:**
  1. Rotate every committed secret, remove `.env` from the repo, and enforce email verification in all environments.
  2. Repair authentication flows: hash all password writes, restore server-side session checks, move tokens to HTTP-only cookies, and add OAuth state validation.
  3. Stabilise deployment by fixing the Docker/PM2 build paths, enabling CI, and either finishing or disabling incomplete payment/observability features.

---

## 2. Code Quality & Maintainability Analysis

### 2.1. Codebase Structure & Organization
- Backend modules mirror major business domains and share common utilities (`apps/backend/src/app.module.ts:41`).
- Frontend follows Next.js app-router conventions but mixes inline CSS and data fetching within large page components (`apps/frontend/src/app/generation/[id]/items/page.tsx:1`).
- Asynchronous `dynamicImport` is used inside the module import array and may break Nest’s module resolution due to returning a Promise (`apps/backend/src/app.module.ts:45`).

### 2.2. Readability & Conventions
- NestJS DTOs and services follow consistent naming backed by class-validator decorators.
- Inline comments are generally purposeful, though some modules retain verbose logging.

**Good Code Examples**
- Refresh tokens are hashed before storage and bound to device fingerprints (`apps/backend/src/auth/auth.service.ts:83`).
- OpenAI response handling uses JSON schema validation with defensive logging (`apps/backend/src/generation/generation-ai.service.ts:123`).

**Needs Improvement**
- Password updates write plaintext to the database (`apps/backend/src/freelancer/freelancer.service.ts:182`).
- Generation reviewer page logs raw datasets and timestamps (`apps/frontend/src/app/generation/[id]/items/page.tsx:192`).

### 2.3. Dependency Management

| Library | Version | Observation |
| --- | --- | --- |
| `bull` / `bullmq` | `^4.16.5` / `^5.41.5` | Both drivers installed; processors import `Job` from `bullmq` while relying on `@nestjs/bull` (`apps/backend/package.json:59`, `apps/backend/src/redis/queue/email-queue.processor.ts:3`). Standardise on one queue implementation. |
| `@sentry/*` | `^8.19.0` | SDKs present without instrumentation (`apps/backend/package.json:51`). Remove or configure. |
| `react-secure-storage` | `^1.3.2` | Provides obfuscation only; tokens remain susceptible to XSS (`apps/frontend/package.json:50`). |
| `@tanstack/react-query` & `react-query` | `^5.74.4` / `^3.39.3` | Both generations included, increasing bundle size (`apps/frontend/package.json:22`, `apps/frontend/package.json:49`). |
| `fs` placeholder | `^0.0.1-security` | Placeholder dependency remains in production deps (`apps/backend/package.json:75`). |

Further notes: `package-lock.json` and `yarn.lock` coexist, complicating reproducible installs; dependency versions for common libs (e.g., `axios`) diverge between projects.

### 2.4. Error Handling & Logging
- Global exception filter leaks stack traces in responses (`apps/backend/common/filters/global-expection.filter.ts:75`).
- File uploads log raw `Express.Multer.File` objects (`apps/backend/src/file/file.service.ts:14`).
- Frontend components emit extensive console logging (`apps/frontend/src/app/generation/[id]/items/page.tsx:192`).

### 2.5. Testing Strategy
- Only one unit test exists (`apps/backend/test/adaptive/bkt.spec.ts:1`), covering algorithmic logic.
- No automated frontend tests, and no CI to run lint/build/coverage.

---

## 3. Security Audit

### 3.1. Authentication & Authorization
- Email verification is disabled repository-wide (`apps/backend/.env:6`, `apps/backend/src/auth/services/auth-user.service.ts:36`).
- Freelancer password updates store plaintext (`apps/backend/src/freelancer/freelancer.service.ts:169`).
- JWT strategy skips session validation due to commented code (`apps/backend/src/auth/strategy/access-token.strategy.ts:25`).
- Refresh endpoints lack CSRF mitigation while using cookies (`apps/frontend/src/app/lib/api.ts:70`).
- Role guard uses substring comparisons that could misbehave if role names evolve (`apps/backend/common/guards/auth/roles.guard.ts:21`).

### 3.2. Data Handling & Privacy
- Live secrets committed (`apps/backend/.env:11`–`apps/backend/.env:70`).
- Microsoft Clarity injected without consent gating (`apps/frontend/src/app/layout.jsx:34`).
- Tokens stored in localStorage / react-secure-storage remain vulnerable to XSS (`apps/frontend/src/app/lib/api.ts:26`, `apps/frontend/src/components/BaseUrl.jsx:30`).
- Console logging exposes MCQs, answers, and diagnostics (`apps/frontend/src/app/generation/[id]/items/page.tsx:192`).
- File paths logged in storage service (`apps/backend/src/file/file.service.ts:14`).

### 3.3. Common Vulnerability Analysis
- **Information disclosure:** Stack traces returned to clients (`apps/backend/common/filters/global-expection.filter.ts:75`).
- **Credential leakage:** Secrets in git; OAuth tokens passed via query string without state validation (`apps/frontend/src/app/google-redirect/page.jsx:15`).
- **Authentication bypass:** Email verification disabled and session checks commented out.
- **CSRF/session fixation:** Refresh endpoints rely solely on cookies without anti-CSRF tokens.
- **Unfinished features:** `/payment/checkout` stub returns `false`, leaving payments non-functional (`apps/backend/src/payment/payment.controller.ts:73`).

---

## 4. Performance & Scalability Assessment

### 4.1. Backend Performance
- `McqService.findMcqsPaginated` lacks supporting DB indexes while using `ILIKE` filters (`apps/backend/src/mcq/mcq.service.ts:68`).
- `FreelancerService.getTopFreelancers` performs nested subqueries per request (`apps/backend/src/freelancer/freelancer.service.ts:110`).
- Sequential MCQ creation during generation finalisation may bottleneck (`apps/backend/src/generation/generation.service.ts:281`).
- Pool durations are parsed into `luxon.Duration` objects but passed directly to TypeORM extra options (`apps/backend/config/postgres-config.ts:16`, `apps/backend/common/utils/env.util.ts:156`).
- Prometheus module registered but lacks instrumented metrics (`apps/backend/src/app.module.ts:74`).

### 4.2. Frontend Performance
- Generation reviewer polls every five seconds and uses heavy inline styling (`apps/frontend/src/app/generation/[id]/items/page.tsx:233`).
- Duplicate React Query packages increase bundle size (`apps/frontend/package.json:22`, `apps/frontend/package.json:49`).
- Console logging prevents dead-code elimination and exposes data (`apps/frontend/src/components/dashboard/QuestionsBank/Quiz.jsx:61`).
- `BaseUrl` treats only 200/201 responses as success, potentially causing unnecessary retries (`apps/frontend/src/components/BaseUrl.jsx:6`).

### 4.3. Architecture & Scalability
- Backend is a single NestJS monolith with Postgres/Redis; no documented service boundaries.
- `dynamicImport` may break ahead-of-time compilation due to Promise-based module import (`apps/backend/src/app.module.ts:45`).
- Docker installs production dependencies before `nest build`, which requires dev tooling, and the entry point path conflicts with PM2 (`apps/backend/Dockerfile:6`, `apps/backend/Dockerfile:12`, `apps/backend/ecosystem.config.js:5`).
- No infrastructure-as-code or deployment runbooks are present.

---

## 5. Feature & User Experience (UX) Analysis

### 5.1. Feature Completeness
- Implemented: adaptive training sessions, question bank modes, AI item generation, clinical case demo, progress dashboards (`apps/frontend/src/components/dashboard/QuestionsBank/Questions.jsx:1`, `apps/frontend/src/app/demo/clinical-case/page.tsx:1`).
- Partially implemented: payments disabled, Prometheus metrics, Sentry instrumentation.

### 5.2. Inferred User Workflow
- Signup auto-verifies due to environment flag, then blocks on profile completion (`apps/backend/src/auth/services/auth-user.service.ts:79`).
- Dashboard reads tokens from secureLocalStorage and falls back to toasts on errors (`apps/frontend/src/app/dashboard/page.jsx:14`).
- Reviewers edit AI-generated items using a polling UI with `window.prompt` rejection flow (`apps/frontend/src/app/generation/[id]/items/page.tsx:435`).
- Google OAuth writes token from query string to storage without validation (`apps/frontend/src/app/google-redirect/page.jsx:15`).

### 5.3. Accessibility (a11y)
- Predominant use of non-semantic elements with inline styles.
- Custom popups lack focus management and ARIA attributes.
- Some chart components render text inside SVG foreignObjects without readable fallbacks (`apps/frontend/src/components/dashboard/MyProgress/Performance.jsx:37`).

---

## 6. Documentation & DevOps

### 6.1. Developer Documentation
- Backend README outlines features but references external diagrams without local copies (`apps/backend/README.md:4`).
- Frontend README is the default Next.js template (`apps/frontend/README.md:1`).
- Real `.env` with live secrets is committed; `.env.example` absent.
- `PERSONALIZATION_VISION.md` describes aspirational 2025 goals without aligning current implementation.

### 6.2. CI/CD & Deployment Process
- No CI pipeline or automation present.
- Docker build fails because dev dependencies are unavailable for compilation; runtime entry point mismatch with PM2.
- `dist/` artefacts and `node_modules/` tracked in the repo complicate deployments.
- Secrets management is manual; no vault integration.

---

## 7. Prioritized Action Plan

| Priority | Area | Issue Description | Recommended Action |
| --- | --- | --- | --- |
| Critical | Security | Secrets and `SKIP_EMAIL_VERIFICATION=true` committed (`apps/backend/.env:1`, `apps/backend/src/auth/services/auth-user.service.ts:36`). | Remove committed `.env`, rotate credentials, introduce secure secret management, enforce email verification. |
| Critical | Security | Freelancer password updates store plaintext (`apps/backend/src/freelancer/freelancer.service.ts:169`). | Hash new passwords, backfill existing records, add regression tests. |
| Critical | Security | Session validation disabled; tokens in localStorage; OAuth lacks state (`apps/backend/src/auth/strategy/access-token.strategy.ts:25`, `apps/frontend/src/app/lib/api.ts:26`, `apps/frontend/src/app/google-redirect/page.jsx:15`). | Reinstate Redis session checks, migrate tokens to HTTP-only cookies, implement OAuth state parameter validation. |
| High | DevOps | Docker/PM2 entry points inconsistent; dev deps missing in build (`apps/backend/Dockerfile:6`, `apps/backend/Dockerfile:12`, `apps/backend/ecosystem.config.js:5`). | Rework Dockerfile, align runtime entry points, add CI jobs for build and tests. |
| High | Application Integrity | Payment endpoint always returns `false` (`apps/backend/src/payment/payment.controller.ts:73`). | Finish checkout flow or disable routes/UI until ready. |
| High | Observability & Privacy | Exception handling leaks stack traces; logs expose user data (`apps/backend/common/filters/global-expection.filter.ts:75`, `apps/backend/src/file/file.service.ts:14`, `apps/frontend/src/app/generation/[id]/items/page.tsx:192`). | Sanitize server responses, adopt structured logging, remove debug output. |
| Medium | Architecture | Queue processors mix Bull/BullMQ imports (`apps/backend/src/redis/queue/email-queue.processor.ts:3`). | Standardise on a single queue library, update imports, configure monitoring. |
| Medium | Frontend | Microsoft Clarity injected globally; logout leaves tokens in storage (`apps/frontend/src/app/layout.jsx:34`, `apps/frontend/src/components/BaseUrl.jsx:106`). | Gate analytics behind consent, ensure logout clears storage and cookies. |
| Medium | Documentation | `.env` with secrets tracked; `dist/` and `node_modules/` in repo; READMEs outdated. | Provide sanitized `.env.example`, update `.gitignore`, expand documentation for setup and deployment. |

---
