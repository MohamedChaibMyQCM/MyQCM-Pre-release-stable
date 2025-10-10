// Proposed adaptive selection policy (epsilon-greedy with guardrails)
// Not wired; provided as a reference implementation for integration.

export type Difficulty = "easy" | "medium" | "hard";

export interface PolicyContext {
  // Model scores
  mastery: number; // BKT (0..1)
  ability: number; // normalized theta (0..1) or probability proxy
  // User/session context
  seenMcqIds: Set<string>;
  recentMcqIds: Set<string>;
  nowMs: number;
}

export interface PolicyConfig {
  epsilon: number; // exploration probability
  minDifficulty: Difficulty;
  maxDifficulty: Difficulty;
  avoidRepeatMinutes: number;
}

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

export function chooseDifficulty(ctx: PolicyContext, cfg: PolicyConfig): Difficulty {
  const { ability } = ctx;
  let band: Difficulty = ability < 0.33 ? "easy" : ability < 0.66 ? "medium" : "hard";

  // Clamp to bounds
  const minIdx = DIFFICULTY_ORDER.indexOf(cfg.minDifficulty);
  const maxIdx = DIFFICULTY_ORDER.indexOf(cfg.maxDifficulty);
  let idx = Math.min(maxIdx, Math.max(minIdx, DIFFICULTY_ORDER.indexOf(band)));

  // Epsilon exploration (uniform among allowed bands)
  if (Math.random() < cfg.epsilon) {
    const choices = DIFFICULTY_ORDER.slice(minIdx, maxIdx + 1);
    idx = Math.floor(Math.random() * choices.length) + minIdx;
  }
  return DIFFICULTY_ORDER[idx];
}

export interface CandidateMcq {
  id: string;
  difficulty: Difficulty;
  lastSeenAt?: number; // ms epoch
}

export function rankCandidates(candidates: CandidateMcq[], target: Difficulty, ctx: PolicyContext, cfg: PolicyConfig): CandidateMcq[] {
  const avoidBefore = ctx.nowMs - cfg.avoidRepeatMinutes * 60_000;

  return candidates
    .filter((mcq) => (mcq.lastSeenAt ?? 0) < avoidBefore)
    .sort((a, b) => {
      // Prefer target difficulty, then older lastSeenAt
      const da = a.difficulty === target ? 0 : 1;
      const db = b.difficulty === target ? 0 : 1;
      if (da !== db) return da - db;
      return (a.lastSeenAt ?? 0) - (b.lastSeenAt ?? 0);
    });
}

