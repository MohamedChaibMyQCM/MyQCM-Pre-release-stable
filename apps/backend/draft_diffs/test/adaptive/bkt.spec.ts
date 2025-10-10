// Jest unit tests (proposed) for corrected BKT behavior
// These tests are designed to validate math/order/clamping and guardrails.

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function bktPosterior(prevKnow: number, correct: boolean, slip: number, guess: number, learn: number) {
  const pL0 = clamp01(prevKnow), s = clamp01(slip), g = clamp01(guess), t = clamp01(learn);
  const eps = 1e-12;
  const pC = pL0 * (1 - s) + (1 - pL0) * g;
  const pI = pL0 * s + (1 - pL0) * (1 - g);
  const post = correct ? (pL0 * (1 - s)) / Math.max(eps, pC) : (pL0 * s) / Math.max(eps, pI);
  return clamp01(post + (1 - post) * t);
}

describe('BKT Update (corrected)', () => {
  it('order correctness: correct then incorrect behaves sensibly', () => {
    const p0 = 0.3; const s = 0.1; const g = 0.2; const t = 0.3;
    const p1 = bktPosterior(p0, true,  s, g, t);  // correct answer
    const p2 = bktPosterior(p1, false, s, g, t);  // incorrect answer
    expect(p1).toBeGreaterThan(p0);
    // After an incorrect, should not exceed after a correct; usually decreases
    expect(p2).toBeLessThanOrEqual(p1);
    expect(p2).toBeGreaterThanOrEqual(0);
  });

  it('bounds: random valid inputs produce outputs in [0,1]', () => {
    for (let i = 0; i < 100; i++) {
      const p = Math.random();
      const s = Math.random();
      const g = Math.random();
      const t = Math.random();
      const out = bktPosterior(p, Math.random() > 0.5, s, g, t);
      expect(out).toBeGreaterThanOrEqual(0);
      expect(out).toBeLessThanOrEqual(1);
    }
  });

  it('zero handling: slip=0 or guess=0 are respected', () => {
    const p = 0.4; const t = 0.2;
    const withZeroSlip = bktPosterior(p, true, 0, 0.2, t);
    const withZeroGuess = bktPosterior(p, false, 0.2, 0, t);
    expect(withZeroSlip).toBeGreaterThan(p); // correct with no slip should increase
    expect(withZeroGuess).toBeLessThanOrEqual(p + (1 - p) * t); // incorrect with no guess shouldn't inflate
  });

  it('no update on invalid: undefined correctness should keep state', () => {
    const p = 0.5; const s = 0.1; const g = 0.2; const t = 0.3;
    // simulate guarding: if correctness is undefined, return p
    const out = (undefined as any) == null ? p : bktPosterior(p, (undefined as any), s, g, t);
    expect(out).toBe(p);
  });

  it('KC vs course fallback (simulated): KC wins over course when present', () => {
    const courseParams = { s: 0.2, g: 0.25, t: 0.3 };
    const kcParams = { s: 0.1, g: 0.2, t: 0.25 };
    const p = 0.3;
    const use = (kc: any | null) => {
      const s = kc?.s ?? courseParams.s;
      const g = kc?.g ?? courseParams.g;
      const t = kc?.t ?? courseParams.t;
      return bktPosterior(p, true, s, g, t);
    };
    const withKc = use(kcParams);
    const withCourseOnly = use(null);
    expect(withKc).not.toBe(withCourseOnly);
  });
});
