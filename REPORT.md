# Audit Report — Adaptive Engine (BKT + IRT) — MyQCM

Author: CHAIB MOHAMED
Date: 2025-09-02

## Executive Summary

- Scientific validity: Current “hybrid” is not scientifically justified. IRT is used as a forward 3PL probability without item parameters or ability estimation; ability is set to a probability in [0,1]. BKT updates use a thresholded partial-credit score and apply learning before posterior update; parameters are not clamped and 0 values are overridden by defaults. No evaluation harness or calibration metrics exist. Conclusion: No measurable out-of-sample benefit demonstrated versus simpler baselines.
- Overengineering risk: High. Running both models adds complexity without evidence of gains. The current IRT path is a heuristic (no item params), not a trained IRT. BKT is course-level, no KC granularity. Recommendation: Do not keep both unless the evaluation (below) shows ≥2% relative log-loss improvement with better calibration across ≥70% KCs.
- Architecture suitability (NestJS): Adequate for orchestration and light inference. Inference today is cheap. Training/refresh jobs are not offloaded. Observability (Prometheus) exists but lacks model metrics. Add indexes for hot paths and caching of “next item”. Consider a Python microservice for training/evaluation.
- Go/No-Go: No-Go for hybrid as implemented. Recommend a single model first (either corrected BKT with binary outcomes or a proper IRT-2PL with trained item params) with an evaluation harness.

## A) Repository & Data Model Recon

- Adaptive pipeline
  - BKT params source: per-course on `Course` entity (`learning_rate`, `guessing_probability`, `slipping_probability`). File: `src/course/entities/course.entity.ts:20`.
  - BKT inference: `calculateBkt()` in `src/adaptive-engine/adaptive-engine.service.ts:148`. Uses `accuracy_rate > Redis(config:accuracy-threshold).correct_threshold` as a binary “correct”. Learning applied before posterior update.
  - IRT inference: `mapIrtValues()` maps MCQ metadata to 3PL params (difficulty from difficulty enum, discrimination from `baseline` and type, guessing from time ratio). `calculateIrt()` computes a 3PL probability and assigns it to `AdaptiveLearner.ability` (clamped 0–1). Files: `src/adaptive-engine/adaptive-engine.service.ts:204` and `:245`.
  - Live call site: on each MCQ attempt, `mcq.service.ts` calls `updateAdaptiveLearner()` with `success_ratio` as `accuracy_rate`. Files: `src/mcq/mcq.service.ts:1290-1310`.
  - Selection: Session builder maps `ability` to a difficulty band: <0.3 easy, <0.7 medium, else hard. Files: `src/training-session/training-session.service.ts:930-950` and `:200-330` (session MCQ selection).
- Feature logging/metrics: Progress attempts at `src/progress/entities/progress.entity.ts` with `success_ratio`, `time_spent`, timestamps present. No model calibration or log-loss metrics persisted. Redis config for accuracy thresholds present.
- Schemas observed
  - users: `src/user/entities/user.entity.ts`
  - items/questions (MCQ): `src/mcq/entities/mcq.entity.ts` (difficulty, type, baseline, estimated_time). No locale field.
  - knowledge_components (KCs): not present; mastery tracked at course-level only via `AdaptiveLearner` entity (`mastery`, `ability`). File: `src/adaptive-engine/entities/adaptive-learner.entity.ts`.
  - attempts: `src/progress/entities/progress.entity.ts` (has `createdAt` timestamps and session relation).
  - sessions: `src/training-session/entities/training-session.entity.ts`.
  - item_params_irt (a/b/c): not present (heuristics only).
  - kc_params_bkt (p_init, p_learn, p_slip, p_guess): implicit via course fields; no per-KC.
  - content_locale: not present; fairness slicing by FR/AR not supported by schema.
- Data quality risks
  - Missing locale and KC mapping prevent key analyses and personalization.
  - `success_ratio` may be null (QROC without analysis) and is thresholded to define correctness (risk of mislabeling, leaky label).
  - Dedupe only within-session; cross-session repeats allowed after 120 minutes.
  - BKT defaults override valid 0 values due to falsy checks; parameters not clamped.

## B) Scientific Validity & Metrics

- Evaluation harness: Missing. Added draft under `draft_diffs/scripts/eval/run_eval.py` to:
  - Perform time-aware CV per learner (70/15/15), stratify by difficulty/type; future leakage prevented.
  - Compute predictive log-loss (primary), Brier, AUC, ECE, reliability diagrams.
  - Run ablations: Baseline heuristics, BKT-only, IRT-only (1PL/2PL), Hybrids (Gate, Blend with learned weight).
  - Output `SCORECARD.csv` and `metrics.json` plus plots.
- Decision rule (adopted): Keep hybrid only if Δlog-loss ≥ 2.0% vs best single-model and ECE improves, with ≥70% KCs improved. Given no KCs exist now, treat “KC” as Course/Unit until KC mapping is added.

## C) Algorithmic Correctness & Estimation

- BKT
  - Update order is nonstandard (learning applied before posterior). Standard BKT: posterior update from observation, then apply learning transition.
  - Thresholded partial credit: mapping `success_ratio` to binary via a global threshold; OK as a heuristic but should be validated/calibrated per item/type. QROC nulls must be excluded.
  - Params not clamped to [0,1]; 0 is overridden by defaults (`if (!param)` bugs). Risk of invalid posteriors.
- IRT
  - No item parameters a/b/c in DB. `mapIrtValues()` fabricates params from heuristics. No estimation (EM/MML/SGD), no identifiability constraints, no drift handling.
  - `ability` is set to a probability of correctness, not a latent trait; no update/estimation step from response data.
  - As implemented, “IRT” should be considered a scoring heuristic, not IRT.
- Online updates: Only learner state is changed; item params untouched. No regularization/holdout in place.
- Cold-start: Defaults via `DefaultBktParamsConfig`, `ability` starts at 0. No item priors beyond heuristics.

## D) Adaptive Policy Review

- Selection policy: Deterministic banding from `ability`; no exploration (epsilon/UCB) and minimal repetition control (within-session only). No mastery thresholds beyond course-level.
- Guardrails: Difficulty bounds exist implicitly; no explicit privacy filters or repetition budgets (beyond exclude list).
- Latency SLO: “Next item” path is DB-bound (queries for attempted and paginated MCQs) + trivial math. With proper indexes and optional caching, p95 ≤120 ms is realistic.
- Proposed: Add `src/adaptive/policy.ts` (draft in `draft_diffs/`) implementing epsilon-greedy over difficulty/KC, repetition caps, and mastery thresholds.

## E) Architecture & Stack (NestJS) Audit

- Module boundaries: Reasonable. Adaptive service is stateless across requests apart from DB writes to learner state.
- Queues: Bull/Redis present for notifications, not for model training/calibration. Add idempotency keys and backoff are set.
- DB indices: Missing composites on hot paths. Proposed SQL in `draft_diffs/sql/indices.sql`:
  - `progress(userId, createdAt)`
  - `progress(sessionId, createdAt)`
  - `mcq(courseId, difficulty, type)`
  - `adaptive_learner(userId, courseId) UNIQUE`
- Inference runtime: Light. If proper IRT/BKT training is added, prefer a Python microservice (gRPC/HTTP) for training/eval; keep Nest for orchestration/auth and thin inference (or callouts).
- Config hygiene: Good use of `getEnvOrFatal` with type checks. Add feature flags (enable_hybrid, epsilon, calibration version) and circuit breakers for external calls.
- Observability: Prometheus enabled. Add custom metrics for: log-loss, ECE, AUC (by slice), next-item p95/p99 latency, cache hit ratio, queue lag.

## F) Fairness & Locale Robustness

- No locale fields on MCQ/progress; cannot slice FR vs AR performance. Add per-item locale/language and per-user locale to enable slicing.
- Flag performance gaps where Δlog-loss > 2% or ECE divergence significant. Until then, support per-locale calibration curves.

## Recommendations & Next Steps

1) Stop “hybrid” by default. Choose a single path while building the harness:
   - Option A: Correct BKT-only (binary outcomes, correct update order, clamped params, per-KC if added).
   - Option B: Proper IRT-2PL with trained item params (EM/MML/SGD), and calibrated ability (theta). Requires offline training service and item param storage.
2) Add KC mapping (minimum viable: map Units to KCs); maintain learner-KC state not just course-level.
3) Implement the evaluation harness (draft provided) and run ablations; fill `SCORECARD.csv` and `metrics.json` via bootstrap CIs.
4) Add policy with epsilon-greedy, difficulty bounds, repetition guardrails; cache next-item for 15–60s with invalidation on attempt write.
5) Add indices and model metrics; wire Prometheus counters/histograms for adaptive calls.

## Proposed Architecture Diff

- Keep NestJS for app orchestration, auth, RBAC, sessions, and serving next-item.
- Add Python microservice for model training/evaluation (FastAPI + gRPC/HTTP) with:
  - Offline training jobs (triggered via Bull/Redis).
  - Model registry + versioning (S3 + DB table).
  - Endpoints for inference/calibration versions.
- Nest calls cached, thin inference (or a local scoring for BKT-only), logs features for later training.

Artifacts produced in this audit:
- `REPORT.md` (this file)
- `SCORECARD.csv` and `metrics.json` (placeholders to be filled by `scripts/eval/run_eval.py`)
- `ISSUES.yaml` (actionable defects with file:line and fixes)
- `draft_diffs/` (proposed diffs, scripts, indices)

## Post-Patch Delta

- Legacy cohort (test proxy): Legacy-BKT log-loss=1.747, Corrected-BKT=1.537 (?=+12.0% better).
- Corrected cohort (test proxy): Legacy-BKT=0.144, Corrected-BKT=0.235 (?=-63.0% worse).
- ECE: Mixed; improved in legacy cohort (+0.040 higher ECE worsened), worsened in corrected cohort.
- Note: These numbers are from synthetic small samples; run exports to get real results.
