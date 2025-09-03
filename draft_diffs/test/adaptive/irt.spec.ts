// Jest unit tests (proposed) for IRT likelihood gradients
// Not wired; ensure to adapt imports if integrating into repo.

function threePL(theta: number, a: number, b: number, c: number) {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

describe('IRT 3PL', () => {
  it('monotonic in theta when a>0', () => {
    const a = 1.2, b = 0, c = 0.2;
    const p1 = threePL(-1, a, b, c);
    const p2 = threePL(0, a, b, c);
    const p3 = threePL(1, a, b, c);
    expect(p1).toBeLessThan(p2);
    expect(p2).toBeLessThan(p3);
  });

  it('respects bounds due to guessing parameter', () => {
    const a = 1.0, b = 0.0, c = 0.25;
    const pLow = threePL(-999, a, b, c);
    const pHigh = threePL(999, a, b, c);
    expect(pLow).toBeCloseTo(c, 3);
    expect(pHigh).toBeLessThan(1);
    expect(pHigh).toBeGreaterThan(0.99);
  });
});

