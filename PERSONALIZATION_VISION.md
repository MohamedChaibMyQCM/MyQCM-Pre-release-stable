# MyQCM Precision Learning OS Vision

## 1. Why Precision Learning Matters
MyQCM's ambition is to deliver a Precision Learning Operating System for health exams where adaptivity, outcomes, content workflows, and institutional trust reinforce each other. Learners face limited time, uneven background knowledge, and fast-moving curricula, so the system must:

- Surface the right intervention at the right moment (difficulty, modality, knowledge component).
- Remember past behaviour to optimise future actions (spaced repetition, confidence, mastery drift).
- Give instructors and operators visibility into learner trajectories and catalogue health.
- Remain observable, explainable, and configurable so the product team can iterate safely.

North-star metric: **reduce time-to-mastery on blueprint knowledge components at the target recall threshold** (for example, reach 80% predicted pass probability faster than legacy flows).

Guardrails that ship with every release:
- Calibration: monitor Brier score and log-loss for ability, mastery, and review scheduling models.
- Fairness: track performance gaps by cohort and generate cohort-aware evaluation summaries.
- Explainability: deliver reason codes and insight cards so learners and instructors understand "why this now".

This document reflects the October 2025 codebase and outlines how we evolve from capable personalization to a full Precision Learning OS.

---

## 2. Current Capabilities (2025-10 baseline)

| Area | What exists today | Code hotspots |
| --- | --- | --- |
| Session creation | Three modes (Custom, Guided, Intelligent "Synergy") stored in `mode` table. Guided/Intelligent delegate varying fields to the adaptive engine via `TrainingSessionService.defineTrainingSessionParams`. | `apps/backend/src/training-session/` |
| Attempt capture | Every MCQ attempt saved via `ProgressService.createUserProgress` with `success_ratio`, `is_skipped`, `time_spent`, `sessionId`. | `apps/backend/src/mcq/mcq.service.ts`, `apps/backend/src/progress/` |
| Learner state | Course-level `AdaptiveLearner` with mastery (BKT) and ability (IRT). Updated on every scored attempt. | `apps/backend/src/adaptive-engine/adaptive-engine.service.ts` |
| Item metadata | Difficulty enum, estimated time, baseline, options. No knowledge-component mapping. Heuristic IRT/BKT parameters. | `apps/backend/src/mcq/entities/` |
| Selection | `TrainingSessionService.getSessionMcqs` filters by user-chosen types, difficulty (from ability), excludes recent attempts, and falls back if inventory missing. Logs `ADAPTIVE_DIFFICULTY_FALLBACK` plus ability driven difficulty banding. | `apps/backend/src/training-session/training-session.service.ts` |
| Observability | Basic logs around selection, fallback, and progress creation. No dashboards. | Same as above |
| Frontend | Next.js dashboard shows question list, launches sessions, and renders adaptive queue. Modes appear in Settings scripts; no KC/retention visuals yet. | `apps/frontend/src/components/dashboard/` |

Gaps already fixed in the October 2025 cycle: mastery persistence, deterministic correctness, logging when difficulty fallback occurs.

---

## 3. Gaps & Risks

1. **Granularity** - no knowledge-component modelling; mastery and ability live at course scope only.
2. **Parameter accuracy** - IRT/BKT parameters guessed from metadata (time ratio, baseline) instead of learned from data.
3. **Policy limitations** - static ability thresholds (`<0.3 easy`, `<0.7 medium`). No exploration strategy, no per-KC balancing.
4. **Session pacing** - session length fixed at creation; cannot adapt to performance in real time.
5. **Spaced repetition** - no review queue, forgetting curves, or due-date awareness.
6. **Catalog health** - fallback logging exists, but no automation warns when easy/medium inventory vanishes.
7. **Observability and trust** - metrics, dashboards, calibration, and fairness checks are missing, so the product team cannot evaluate adaptive releases quickly.

---

## 4. Target Architecture Overview (Engine Core)

```
                                   +-----------------------+
 learner attempt  ----------------> |  Progress Service     |
 (frontend POST)                   |  (writes progress +    |
                                   |   review ledger)       |
                                   +-----------+------------+
                                               |
                                               v
                                   +-----------------------+
                                   | Adaptive Engine       |
                                   |  - KC state store     |
                                   |  - BKT/IRT updates    |
                                   |  - SRS scheduler      |
                                   +-----------+-----------+
                                               |
                                               v
                             +---------------------------+
                             | Selection Policy Module   |
                             |  (difficulty x KC x review)|
                             |  returns ordered MCQ IDs  |
                             +-----------+---------------+
                                             |
                                             v
                             +---------------------------+
                             | Training Session Service  |
                             |  merges user filters and  |
                             |  serves queues to frontend|
                             +---------------------------+
```

A nightly trainer refreshes parameters, feeds the adaptive engine, and keeps the selection policy aware of inventory health. This engine core anchors the Precision Learning OS and powers downstream surfaces across learners, instructors, and operations.

### Key Components
- **Knowledge Component Store**  
  - Tables: `knowledge_component`, `mcq_knowledge_component`, `adaptive_learner_kc_state`.  
  - Mastery, ability, and review ease tracked per learner × KC.

- **Parameter Snapshot Layer**  
  - `item_parameters` table storing the latest EM/MML estimates.  
  - Offline trainer pipeline generates versions and publishes metrics and model cards.

- **Policy Module**  
  - Single home for selection strategy (difficulty banding, KC prioritisation, exploration, repetition guardrails).
  - Exposes `selectNextItems(context)` API consumed by `TrainingSessionService`.

- **Spaced Repetition Ledger**  
  - `spaced_review` table plus scheduler utility using FSRS/SM-2 style models.  
  - Feeds the policy module with “due now” queues and produces learner-facing review counts.

- **Observability Stack**  
  - Structured logs, Prometheus counters, and Grafana dashboards for ability drift, fallback rates, review backlog, and calibration/fairness metrics.

- **Control Surface**  
  - Feature flags (existing `config` module) to enable/disable policies.  
  - Admin console to inspect learner KC profiles, adjust SRS parameters, or reset sessions.

---

## 5. Strategic Pillars & Big Bets
- **Adaptive Curriculum** – orchestrate study plans that blend MCQs, cases, videos, and simulations against KC gaps and predicted return on study time.
- **Outcome-aware Optimization** – optimise scheduling, item selection, and coaching toward predicted exam pass probability under explicit time budgets.
- **Closed-Loop Content Flywheel** – combine AIG, pretesting, and analytics so new items learn fast, drifted items retire quickly, and authors receive data-driven prompts.
- **Institution Mode** – unlock cohort analytics, remediation packs, and blueprint alignment so faculties trust the OS for high-stakes oversight.
- **Governance-by-Design** – treat evaluation, fairness, compliance, and explainability as core product capabilities, not afterthoughts.

These pillars sit on top of the engine core and shape how we prioritise roadmap phases, staffing, and success metrics.

---

## 6. Roadmap (phased delivery)

| Phase | Scope | Success signals |
| --- | --- | --- |
| **P0 – Instrumentation & Audit** | Metrics in adaptive engine, progress audits, fallback dashboards. | Meaningful graphs of mastery/ability drift; backlog of data fixes (if any). |
| **P0.5 – Evaluation & Trust** | Calibration (Brier/log-loss) dashboards, cohort fairness diffs, model cards per parameter snapshot, go/no-go checklist. | Every release reviewed against calibration/fairness gates; automated alerts when drift crosses thresholds. |
| **P1 – Knowledge Components** | KC schema + backfill; per-KC state; selection aware of KC gaps. | Sessions prioritise weak KCs; front-end can display KC mastery. |
| **P2 – Calibrated Parameters** | Offline trainer, item parameter ingestion, quality gates. | New parameter version reduces log-loss vs heuristics; release pipeline documented. |
| **P2.5 – Pretest & AIG Guardrails** | Holdout routing for new items, anchor items for IRT linking, hallucination/blueprint checks for auto-generated content. | New or edited items flow through pretest queue with health metrics; drifted items auto-flagged. |
| **P3 – Policy Evolution** | Replace static difficulty with policy module, introduce KC-aware exploration and repetition guardrails. | Improved coverage metrics, fewer fallbacks on courses with inventory. |
| **P4 – Dynamic Sessions & Feedback** | Adaptive session length, reason codes, front-end insight cards, goal-based study plans. | Users see why sessions end/extend; instructor knobs available. |
| **P5 – Spaced Repetition Core** | Review ledger, scheduler, due queue integration, review dashboards. | Learners have daily review counts; retention metrics track improvement. |
| **P5.5 – Engagement Loop** | Notifications, streaks, and schedules tied to SRS due dates; micro-goals surfaced in app. | Reminder delivery measured; streak adherence improves review completion. |
| **P6 – SRS Polish & Coaching** | Personalised intervals, reminder jobs, A/B framework, admin controls. | Retention uplift in experiments, stable overdue backlog, manageable ops load. |

Each phase ships with accompanying design docs, schema migrations, automated tests, observability updates, feature flags, and rollback plans.

---

## 7. Immediate Action Items
1. Finalise P0 instrumentation (ability/mast logs, fallback dashboards) and kick off Brier/log-loss plus cohort fairness reporting to seed P0.5 gates.
2. Draft the KC schema migration, align with content ops on taxonomy and retro-tag backlog, and schedule the tagging sprint (P1).
3. Prototype the parameter trainer using exported CSVs and a Python notebook; define go/no-go thresholds and model card template (P2 + P0.5).
4. Outline the pretest pipeline architecture with anchor strategy, hallucination checks, and drift heuristics; identify required data hooks (P2.5).
5. Create a cross-functional project board covering all phases, assign owners per strategic pillar, and schedule a roadmap review with engineering, data science, content, ops, and product leads.

### Accuracy-threshold tuning & rollout
- **Knobs live in code**: update `apps/backend/config/default-accuracy-threshold.config.ts` (per MCQ type/difficulty thresholds + QROC blank-response policy) and, for environment-specific overrides, write to Redis key `config:accuracy-threshold`.  
- **Reload procedure**: after changing defaults, run `redis-cli -u $REDIS_URL DEL config:accuracy-threshold` (or `SET` with the new JSON) so `RedisService.initDefaultAccuracyThreshold()` reseeds on next boot; confirm via `redis-cli GET config:accuracy-threshold`.  
- **Communication**: product/ops should capture desired threshold changes in the release checklist, including who approved the new policy, when the Redis key was refreshed, and any validation metrics (Brier/log-loss deltas) reviewed before rollout.

---

## 8. Getting Involved
- **Engineers:** start with P0/P0.5 logging and evaluation work, then pick up KC schema and policy module tasks.
- **Data science:** partner on trainer pipeline, calibration/fairness dashboards, and pretest analytics.
- **Content & Ops:** plan KC taxonomy, retro-tag existing MCQs, monitor pretest results, and triage drifted content.
- **Product & Design:** define UX treatments for adaptive insights, goal-based plans, notifications, and instructor dashboards.
- **Compliance & Trust:** document model cards, audit trails, and consent flows to support healthcare-grade governance.

---

## 9. Document Maintenance
- Update this file whenever a phase ships or scope changes.  
- Supplement with deep-dive design docs under `/docs/` (e.g., `/docs/srs-scheduler.md`, `/docs/model-cards/`).  
- Track metrics snapshots in a shared dashboard and link here.  
- Note open questions and follow-up experiments at the bottom of each relevant phase doc.

---

## 10. Precision Learning OS Maturity Tracks
The maturity ladder now spans multiple tracks. Levels 0-6 cover the engine core; higher tiers extend into intelligence, content flywheel, experience, and governance capabilities. Achieving any level means its foundations are stable, measured, and visible to stakeholders.

### Engine Core Track (Levels 0-6)

| Level | What it means | Status (Oct 2025) | Next milestones |
| --- | --- | --- | --- |
| **Level 0 - Segmented Content** | Learners manually pick faculty/course and see static question lists. | **Shipped.** Users filter by faculty/course; Custom mode honours manual choices. | Baseline. |
| **Level 1 - Course-level Adaptivity** | Engine adjusts difficulty from course mastery/ability; sessions exclude recently attempted MCQs. | **Shipped.** Synergy mode uses BKT/IRT ability bands and recency guardrails. | Harden logging; ensure inventory coverage alerts fire. |
| **Level 2 - KC Awareness** | System understands individual knowledge components, targets weakest KCs, and tracks progress per KC. | **Planned.** Schema design underway; tagging backlog pending. | Implement KC schema + per-KC mastery state (P1). |
| **Level 3 - Calibrated Difficulty** | Difficulty decisions leverage data-driven item parameters and exploration policy; ability no longer depends on heuristics. | **In progress.** Offline training pipeline scoped; heuristics still in use. | Deliver parameter trainer + policy module (P2 & P3). |
| **Level 4 - Dynamic Coaching** | Session pacing, difficulty mix, and insights adapt in real time; learners see rationale for promotions/demotions. | **Not started.** UI shows static progress, no session mutability. | Implement adaptive session length + feedback cards (P4). |
| **Level 5 - Spaced Repetition Core** | Personalised review queue with due dates, integrated into session selection; backlog dashboards and reminders. | **Not started.** No SRS tables or scheduler yet. | Build review ledger & scheduler, expose review counts (P5). |
| **Level 6 - Intelligent Companion** | FSRS-style intervals tuned per learner, reminders, streaks, contextual coaching, and experiment framework. | **Future vision.** Requires levels 2-5 to be stable. | Personalised interval tuning, notification jobs, retention analytics (P6). |

### Intelligence Track (Engine Extensions)

| Level | What it means | Status (Oct 2025) | Next milestones |
| --- | --- | --- | --- |
| **L7 - Adaptive Curriculum** | Sequence study plans across modalities (items, videos, cases, sims) based on KC gaps and predicted ROI on time. | **Future vision.** Needs KC awareness and reliable content metadata. | Build cross-modal content graph, prioritisation heuristics, and scheduling API. |
| **L8 - Outcome-aware Optimization** | Optimise learner journeys for predicted pass probability under time budget constraints; support multi-objective trade-offs. | **Future vision.** Depends on calibrated parameters and evaluation gates. | Prototype optimisation objective, integrate with policy module, and validate against historical outcomes. |

### Content Flywheel Track

| Level | What it means | Status (Oct 2025) | Next milestones |
| --- | --- | --- | --- |
| **L7C - AIG & Pretesting** | LLM-assisted item generation with automatic psychometric pretest routing and drift detection. | **Planned.** AIG experiments underway, pretest routing not yet built. | Implement P2.5 pipeline, anchor strategy, and hallucination/blueprint validation. |
| **L8C - Closed-Loop Authoring** | Author co-pilot highlights KC coverage gaps, difficulty targets, and rewrite suggestions from miss analytics. | **Future vision.** Requires robust pretest data and tagging. | Ship author-facing dashboards, integrate with generation tooling, and automate drift remediation suggestions. |

### Experience & Ecosystem Track

| Level | What it means | Status (Oct 2025) | Next milestones |
| --- | --- | --- | --- |
| **L7X - Coaching Surfaces** | "Why this now" insights, micro-goals, reminders, and streaks tied to FSRS due dates. | **Not started.** Messaging pending until SRS core lands. | Deliver reason codes, notification MVP, and in-app goals (P5.5). |
| **L8X - Institution Mode** | Instructor dashboards (cohort KC heatmaps), remediation packs, and blueprint alignment workflows. | **Future vision.** Depends on KC data and governance reporting. | Design instructor MVP, integrate cohort analytics, and pilot remediation pack exports. |

### Governance & Trust Track

| Level | What it means | Status (Oct 2025) | Next milestones |
| --- | --- | --- | --- |
| **L7G - Model Cards & Audits** | Per-release evaluation packs covering calibration, bias, drift, and rollback procedures. | **Planned.** Evaluation metrics not yet automated. | Ship P0.5 tooling, automate report generation, and require sign-off before rollout. |
| **L8G - Compliance-by-Design** | Granular data retention, consent, and audit trails tuned for healthcare contexts. | **Future vision.** Policy outlines drafted, not implemented. | Implement retention policies, consent UX, and compliance monitoring integrated with governance dashboards. |

Each track level includes documented architecture decisions, automated tests, evaluation metrics, and a rollout plan with feature flags and rollback procedures.

_Prepared October 2025_ by chaib mohamed 
