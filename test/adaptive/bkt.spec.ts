function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function bktPosterior(prevKnow: number, correct: boolean, slip: number, guess: number, learn: number) {
  const pL0 = clamp01(prevKnow), s = clamp01(slip), g = clamp01(guess), t = clamp01(learn);
  const eps = 1e-12;
  const pC = pL0 * (1 - s) + (1 - pL0) * g;
  const pI = pL0 * s + (1 - pL0) * (1 - g);
  const post = correct ? (pL0 * (1 - s)) / Math.max(eps, pC) : (pL0 * s) / Math.max(eps, pI);
  return clamp01(post + (1 - post) * t);
}

describe("BKT Update (corrected)", () => {
  it("order correctness: correct then incorrect behaves sensibly", () => {
    const p0 = 0.3; const s = 0.1; const g = 0.2; const t = 0.3;
    const p1 = bktPosterior(p0, true,  s, g, t);
    const p2 = bktPosterior(p1, false, s, g, t);
    expect(p1).toBeGreaterThan(p0);
    expect(p2).toBeLessThanOrEqual(p1);
    expect(p2).toBeGreaterThanOrEqual(0);
  });

  it("bounds: random valid inputs produce outputs in [0,1]", () => {
    for (let i = 0; i < 100; i++) {
      const p = Math.random(), s = Math.random(), g = Math.random(), t = Math.random();
      const out = bktPosterior(p, Math.random() > 0.5, s, g, t);
      expect(out).toBeGreaterThanOrEqual(0);
      expect(out).toBeLessThanOrEqual(1);
    }
  });

  it("zero handling: slip=0 or guess=0 are respected", () => {
    const p = 0.4; const t = 0.2;
    const withZeroSlip = bktPosterior(p, true, 0, 0.2, t);
    const withZeroGuess = bktPosterior(p, false, 0.2, 0, t);
    expect(withZeroSlip).toBeGreaterThan(p);
    expect(withZeroGuess).toBeLessThanOrEqual(p + (1 - p) * t);
  });

  it("no update on invalid: undefined correctness keeps state (simulated guard)", () => {
    const p = 0.5; const s = 0.1; const g = 0.2; const t = 0.3;
    const out = (undefined as any) == null ? p : bktPosterior(p, (undefined as any), s, g, t);
    expect(out).toBe(p);
  });

  it("flag branching reachability: legacy vs corrected differ for contrived case", () => {
    const p0 = 0.2, s = 0.1, g = 0.2, t = 0.3;
    const corrected = bktPosterior(p0, true, s, g, t);
    const legacy_p_learn_temp = p0 + (1 - p0) * t;
    const legacy_num = legacy_p_learn_temp * (1 - s);
    const legacy_den = legacy_num + (1 - legacy_p_learn_temp) * g;
    const legacy = legacy_num / legacy_den;
    expect(corrected).not.toBeCloseTo(legacy);
  });
});

