# MYQCM Production Readiness Master Plan

> **Goal:** Move the monorepo from audit score 3/10 to a launch-ready state with secure operations, validated adaptive learning, and reliable deployment tooling.
>
> **Scope:** Backend (NestJS), Frontend (Next.js), DevOps, Data Science/Adaptive Engine, Compliance, and Product Enablement tracks.

---

## 1. Security & Compliance Hardening

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | Rotate every secret committed to source control (JWT, DB, mail, cloud, OpenAI) and invalidate leaked credentials (`apps/backend/.env`, repo history). | P0 | Security Lead | None | Document rotation in incident report; ensure downstream services updated. |
| SEC-002 | Remove `.env`, `.env.*`, `dist/`, `node_modules/` from Git history; add sanitized `.env.example` for backend/frontend. | P0 | Security Lead | SEC-001 | Use BFG or filter-repo; follow up with repo hygiene guidelines. |
| SEC-003 | Enforce `SKIP_EMAIL_VERIFICATION=false` in all environments; add config guard to prevent accidental enablement. | P0 | Backend Auth | SEC-002 | Update `AuthUserService` to assert env flag only allowed in local dev. |
| SEC-004 | Hash freelancer password updates before saving (`apps/backend/src/freelancer/freelancer.service.ts:182`). | P0 | Backend Auth | None | Add unit test verifying hashing & compare function. |
| SEC-005 | Re-enable session validation in access token strategy; ensure refresh tokens validated against Redis/session store. | P0 | Backend Auth | None | Review `access-token.strategy.ts`; add integration test. |
| SEC-006 | Migrate frontend token storage to HTTP-only cookies; introduce CSRF protection on refresh endpoints. | P0 | Frontend Auth / Backend Auth | SEC-005 | Evaluate `next-auth` or custom cookie utils; coordinate SameSite policies. |
| SEC-007 | Implement OAuth state + nonce validation for Google redirect flow (`apps/frontend/src/app/google-redirect/page.jsx`). | P0 | Frontend Auth | SEC-006 | Use PKCE/state parameter; reject responses missing/verifying state. |
| SEC-008 | Sanitize global error responses—remove stack traces/log sensitive payloads securely (`GlobalExceptionFilter`). | P1 | Backend Platform | None | Replace stack output with request ID; send to centralized logging (e.g., Pino, Winston). |
| SEC-009 | Harden logging in reviewer tooling; remove raw payload console dumps (`apps/frontend/src/app/generation/[id]/items/page.tsx`). | P1 | Frontend Dashboard | None | Replace with debug logger behind feature flag. |
| SEC-010 | Conduct penetration test post-hardening; track findings in separate report. | P1 | Security Lead | SEC-001→SEC-009 | Engage third-party; include social login, payment, admin console. |

---

## 2. DevOps & Infrastructure

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| DEVOPS-001 | Fix backend Docker image: install dev deps before build or leverage multi-stage to compile + prune. | P0 | DevOps | None | Ensure entrypoint aligns with `dist/main.js`; remove tracked `dist/`. |
| DEVOPS-002 | Align PM2 ecosystem script with compiled output (`dist/main.js` vs `dist/src/main.js`). | P0 | DevOps | DEVOPS-001 | Add health checks; consider replacing with systemd or container orchestration. |
| DEVOPS-003 | Set up CI pipeline (GitHub Actions/GitLab) running lint, tests, type-check, build for both apps. | P0 | DevOps | SEC-002 | Include caching, secrets scanning, artifact uploads. |
| DEVOPS-004 | Add automated security scanning (Snyk/Dependabot) covering npm workspaces. | P1 | DevOps | DEVOPS-003 | Configure ignore policies for false positives. |
| DEVOPS-005 | Implement infrastructure-as-code templates (Terraform/Ansible) for staging/prod (Postgres, Redis, file storage, queue). | P1 | DevOps | DEVOPS-003 | Document networking, TLS, backups. |
| DEVOPS-006 | Add environments for staging vs production with distinct configs; wire Next.js `rewrites` appropriately. | P1 | DevOps | DEVOPS-005 | Provide `.env.staging`, `.env.production` docs; ensure admin rewrite uses env var. |
| DEVOPS-007 | Set up centralized logging + metrics (e.g., Loki/Grafana, ELK). Pipe Nest logs + Prometheus metrics. | P1 | DevOps | DEVOPS-005 | Activate `@willsoto/nestjs-prometheus`; add dashboards. |
| DEVOPS-008 | Establish disaster recovery plan: DB backups, Redis snapshots, runbooks, RTO/RPO targets. | P2 | DevOps | DEVOPS-005 | Include restoration testing schedule. |

---

## 3. Backend Platform & API

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| BE-001 | Standardize queue implementation (choose Bull v3/v4 or BullMQ) and refactor processors accordingly. | P0 | Backend Platform | None | Update package.json, queue module, worker processors. |
| BE-002 | Remove placeholder dependency `fs@0.0.1-security` and unused libs; dedupe `axios` versions. | P1 | Backend Platform | None | Run `npm audit`; update lockfiles. |
| BE-003 | Implement DTO validation coverage for new modules (reward, generation, etc.) and add e2e tests for critical APIs. | P1 | Backend Platform | DEVOPS-003 | Use Nest testing + supertest; cover auth, payments, adaptive endpoints. |
| BE-004 | Review `dynamicImport` usage in `AppModule`; replace with synchronous module registration to avoid Promise issues. | P1 | Backend Platform | None | Consider lazy admin module load via separate bootstrap if needed. |
| BE-005 | Normalize logging; adopt structured logger (Pino/Winston) with request correlation IDs. | P1 | Backend Platform | DEVOPS-007 | Integrate with global exception filter updates. |
| BE-006 | Clean payment flows—ensure endpoints return real provider data, add unit tests, and handle success/cancel URLs. | P1 | Payments Squad | SEC-001 | Validate integration with Chargily test/prod. |
| BE-007 | Introduce database indices per audit (progress, session, MCQ, adaptive_learner). | P1 | Backend Platform | DATA-004 | Create migrations; verify with EXPLAIN plans. |
| BE-008 | Add localization support fields to MCQ entities (language/locale). | P2 | Backend Platform | DATA-003 | Requires migration + API updates. |
| BE-009 | Document AdminJS usage; configure RBAC and enforce HTTPS cookies in production. | P2 | Backend Platform | SEC-006 | Provide admin onboarding guide. |

---

## 4. Adaptive Engine & Data Science

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| DATA-001 | Address ADAPT-001: restore ability estimates with proper IRT (theta) update using stored item parameters. | P0 | Adaptive Team | DATA-003 | Implement EM/MAP estimation; update `updateAdaptiveLearner`. |
| DATA-002 | Address ADAPT-002: create `item_params_irt` table; build training pipeline to fit a/b/c params. | P0 | Adaptive Team | DATA-003 | Use offline notebook/service; store artefacts versioned. |
| DATA-003 | Address ADAPT-006: introduce knowledge component taxonomy and map MCQs → KC; track learner mastery per KC. | P0 | Adaptive Team | DATA-002 | Requires schema additions, content tagging UI, seeds. |
| DATA-004 | Address ADAPT-009: add missing DB indices for hot queries. | P0 | Backend Platform | BE-007 | Ensure zero-downtime migration. |
| DATA-005 | Fix BKT parameter handling (ADAPT-003/004): clamp values, correct update order, add tests. | P1 | Adaptive Team | DATA-003 | Update `adaptive-engine.service.ts` + spec coverage. |
| DATA-006 | Clean attempt labelling pipeline (ADAPT-005): differentiate correctness thresholds per type/difficulty; handle null QROC. | P1 | Adaptive Team | DATA-005 | Update `mcq.service.ts` evaluation helpers. |
| DATA-007 | Introduce caching for session MCQ selection (ADAPT-008) with Redis TTL. | P1 | Adaptive Team | DATA-004 | Monitor impact on DB load. |
| DATA-008 | Build evaluation harness + CI job (ADAPT-010) computing log-loss, Brier, ECE; store metrics in repo artefacts. | P1 | Adaptive Team | DEVOPS-003 | Integrate with model release checklist. |
| DATA-009 | Add locale-aware metrics (ADAPT-011); report fairness slices. | P2 | Adaptive Team | DATA-008 | Provide dashboards in Superset/Metabase. |

---

## 5. Frontend (Next.js) Improvements

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| FE-001 | Replace secureLocalStorage usage with cookie/session solution aligned with SEC-006. | P0 | Frontend Auth | SEC-006 | Implement token guard hooks; update Axios wrapper. |
| FE-002 | Add comprehensive error boundaries and logging service (e.g., Sentry) with DSN stored in env. | P1 | Frontend Platform | SEC-008 | Provide redact/PII filters. |
| FE-003 | Build frontend test suite: unit (RTL/Jest) + e2e (Playwright/Cypress) covering auth, dashboard, generation flows. | P1 | Frontend Platform | DEVOPS-003 | Integrate into CI. |
| FE-004 | Remove beta visuals/language from login/onboarding; add environment-based feature flags. | P1 | Product Design | SEC-003 | Provide translation updates. |
| FE-005 | Refactor large inline-styled components (Hero, Generation pages) into modular, accessible components with semantic HTML. | P2 | Frontend Platform | FE-003 | Improve lighthouse a11y score. |
| FE-006 | Optimize bundle size: tree-shake unused Radix/MUI modules, consolidate React Query versions. | P2 | Frontend Platform | FE-003 | Analyze with `next build --analyze`. |
| FE-007 | Implement real-time observability hooks for queue processing states (generation page). | P2 | Frontend Platform | DATA-007 | Replace polling console logs with UI indicators. |

---

## 6. Quality Assurance & Governance

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| QA-001 | Define Definition of Done (DoD) covering tests, security review, documentation. | P0 | QA Lead | DEVOPS-003 | Socialize with all squads. |
| QA-002 | Establish regression test suites (manual + automated) for key user journeys (signup, quiz, payments). | P1 | QA Lead | QA-001 | Maintain in TestRail/Notion; align with CI. |
| QA-003 | Schedule performance tests (k6/Artillery) for backend critical endpoints; set SLOs. | P1 | QA Lead | DEVOPS-007 | Include adaptive engine selection flows. |
| QA-004 | Create release checklist including rollback steps, monitoring validation, post-release audit. | P1 | QA Lead | QA-001 | Ensure sign-off from Security/DevOps/Product. |

---

## 7. Documentation & Product Enablement

| ID | Task | Priority | Owner | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| DOC-001 | Update root README with production-focused instructions; link to sanitized env setup. | P1 | Tech Writer | SEC-002 | Include architecture diagrams. |
| DOC-002 | Write backend operations handbook: migrations, queue workers, seeding, cron jobs. | P1 | Tech Writer | DEVOPS-005 | Include incident response workflow. |
| DOC-003 | Document adaptive engine methodology, data requirements, evaluation pipeline for stakeholders. | P1 | Adaptive Team | DATA-008 | Reference fairness considerations. |
| DOC-004 | Provide admin onboarding guide (AdminJS usage, RBAC, audit logging). | P2 | Product Ops | BE-009 | Ensure compliance instructions. |
| DOC-005 | Publish privacy policy & terms reflecting data usage (cookies, AI, payments). | P2 | Legal/Product Ops | SEC-006 | Must align with GDPR/Algerian regulations. |

---

## 8. Milestones & Sequencing

1. **Security Sprint (Weeks 1-2):** Complete SEC-001→SEC-009, BE-004, FE-001, FE-007 removal of dangerous logs, DEVOPS-001/002.  
2. **Infrastructure Sprint (Weeks 3-4):** Stand up CI/CD (DEVOPS-003, DEVOPS-004), finalize staging/prod separation, document DoD (QA-001).  
3. **Adaptive Reliability Sprint (Weeks 5-7):** Execute DATA-001→DATA-007, BE-007, integrate evaluation harness (DATA-008).  
4. **Product Polish Sprint (Weeks 8-9):** Finish FE-004→FE-006, QA suites, documentation updates.  
5. **Launch Readiness Sprint (Weeks 10+):** Pen-test (SEC-010), load tests, release checklist, compliance sign-off, DR run.  

Each sprint should end with demo + audit checkpoint using MYQCM_Comprehensive_Audit scoring rubric.

---

## 9. Success Criteria

- **Security:** No secrets in repo, all auth flows hardened, independent pen-test passes without critical issues.  
- **Reliability:** CI/CD green across lint/tests/build; load and failover tests meet SLOs; observability dashboards in place.  
- **Adaptive Engine:** Accurate ability estimates validated with ≥2% log-loss improvement and ECE across ≥70% KCs.  
- **Product Experience:** Beta artifacts removed, accessible UI, documented journeys, payments functional end-to-end.  
- **Compliance:** Documentation, policies, and operational runbooks approved by stakeholders.

---

## 10. Tracking & Governance

- Maintain this plan as the single source of truth; update IDs/status weekly.  
- Record progress in project management tool (Jira/Linear) referencing task IDs above.  
- Re-run full audit upon completion to verify production readiness before launch.

