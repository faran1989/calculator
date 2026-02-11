import {
  toNumber,
  sanitizeNumericString,
  parseInputsFromSearchParams,
  buildShareQuery,
  formatResultFromMonths,
  simulateMonthByMonth,
  calculateV4,
  VERY_LONG_TEXT,
  VERY_LONG_MONTHS_THRESHOLD,
} from '../app/home-buy/page';

import { describe, it, expect } from 'vitest';

describe('home-buy logic: parsing helpers', () => {
  it('toNumber: parses Persian/Arabic digits and separators', () => {
    expect(toNumber('۱٬۲۳۴')).toBe(1234);
    expect(toNumber('١٢٣٤٥٦')).toBe(123456);
    expect(toNumber('  12,345  ')).toBe(12345);
  });

  it('toNumber: parses Eastern Arabic digits (١٢٣٤٥٦)', () => {
    // Some users type with Arabic keyboards.
    expect(toNumber('١٢٣٤٥٦')).toBe(123456);
    expect(toNumber('١٢٣٬٤٥٦')).toBe(123456);
  });

  it('toNumber: empty string -> 0', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber('   ')).toBe(0);
  });

  it('toNumber: invalid numeric -> NaN', () => {
    expect(Number.isNaN(toNumber('abc'))).toBe(true);
    expect(Number.isNaN(toNumber('۱۲۳a'))).toBe(true);
  });

  it('sanitizeNumericString: strips non-digits by default', () => {
    expect(sanitizeNumericString('۱٬۲۳۴a')).toBe('1234');
    expect(sanitizeNumericString('12-3')).toBe('123'); // minus removed when not allowed
  });

  it('sanitizeNumericString: allowMinus keeps only first minus', () => {
    expect(sanitizeNumericString('--12-3', { allowMinus: true })).toBe('-123');
    expect(sanitizeNumericString('12-3', { allowMinus: true })).toBe('123');
    expect(sanitizeNumericString('-12-3', { allowMinus: true })).toBe('-123');
  });
});

describe('home-buy logic: display rules', () => {
  it('formatResultFromMonths: 0 or negative -> همین الان', () => {
    expect(formatResultFromMonths(0)).toBe('همین الان');
    expect(formatResultFromMonths(-1)).toBe('همین الان');
  });

  it('formatResultFromMonths: 1..11 -> ماه (no سال)', () => {
    expect(formatResultFromMonths(1)).toContain('ماه');
    expect(formatResultFromMonths(11)).toContain('ماه');
    expect(formatResultFromMonths(11)).not.toContain('سال');
  });

  it('formatResultFromMonths: 12 -> سال (no ماه)', () => {
    const y = formatResultFromMonths(12);
    expect(y).toContain('سال');
    expect(y).not.toContain('ماه');
  });

  it('formatResultFromMonths: uses ceil(years) (13 months -> 2 years)', () => {
    const y = formatResultFromMonths(13);
    expect(y).toContain('سال');
    expect(y).not.toContain('۱ سال'); // should be 2 years in fa-IR formatting
  });

  it('formatResultFromMonths: very-long threshold -> VERY_LONG_TEXT', () => {
    expect(formatResultFromMonths(VERY_LONG_MONTHS_THRESHOLD)).toBe(VERY_LONG_TEXT);
    expect(formatResultFromMonths(VERY_LONG_MONTHS_THRESHOLD + 10)).toBe(VERY_LONG_TEXT);
  });

  it('snapshot: formatResultFromMonths (key cases)', () => {
    expect({
      now: formatResultFromMonths(0),
      m1: formatResultFromMonths(1),
      m11: formatResultFromMonths(11),
      y12: formatResultFromMonths(12),
      y13: formatResultFromMonths(13),
      veryLong: formatResultFromMonths(VERY_LONG_MONTHS_THRESHOLD),
    }).toMatchSnapshot();
  });
});

describe('home-buy logic: URL share (querystring)', () => {
  it('buildShareQuery: includes ? and short keys', () => {
    const qs = buildShareQuery({
      price: '5000000000',
      currentSavings: '100000000',
      monthlySaving: '20000000',
      realizationPercent: '80',
      inflationScenario: 'base',
      inflationCustomPercent: '25',
      savingScenario: 'value',
      savingDeltaPercent: '2',
      growthPercent: '10',
    });
    expect(qs.startsWith('?')).toBe(true);
    const sp = new URLSearchParams(qs.slice(1));
    expect(sp.get('p')).toBe('5000000000');
    expect(sp.get('s0')).toBe('100000000');
    expect(sp.get('m0')).toBe('20000000');
    expect(sp.get('inf')).toBe('base');
  });

  it('snapshot: buildShareQuery (stable query format)', () => {
    const qs = buildShareQuery({
      price: '5000000000',
      currentSavings: '100000000',
      monthlySaving: '20000000',
      realizationPercent: '80',
      inflationScenario: 'base',
      inflationCustomPercent: '25',
      savingScenario: 'value',
      savingDeltaPercent: '2',
      growthPercent: '10',
    });
    expect(qs).toMatchSnapshot();
  });

  it('roundtrip: custom scenarios preserve custom fields', () => {
    const inputs = {
      price: '5000000000',
      currentSavings: '100000000',
      monthlySaving: '20000000',
      realizationPercent: '80',
      inflationScenario: 'custom' as const,
      inflationCustomPercent: '30',
      savingScenario: 'custom' as const,
      savingDeltaPercent: '-10',
      growthPercent: '10',
    };

    const qs = buildShareQuery(inputs);
    const parsed = parseInputsFromSearchParams(new URLSearchParams(qs.slice(1)));

    expect(parsed.price).toBe('5000000000');
    expect(parsed.currentSavings).toBe('100000000');
    expect(parsed.monthlySaving).toBe('20000000');
    expect(parsed.inflationScenario).toBe('custom');
    expect(parsed.inflationCustomPercent).toBe('30');
    expect(parsed.savingScenario).toBe('custom');
    expect(parsed.savingDeltaPercent).toBe('-10');
  });

  // Note: snapshots are stored in tests/__snapshots__/ for easy review.
});

describe('home-buy logic: simulateMonthByMonth (hybrid)', () => {
  it('reaches immediately when S0 >= P', () => {
    const sim = simulateMonthByMonth({
      P: 100,
      S0: 100,
      M0: 0,
      r01: 1,
      inf01: 0,
      g01: 0,
      assetGrowth01: 0,
      maxMonths: 1200,
    });
    expect(sim.capped).toBe(false);
    expect(sim.monthsToReach).toBe(0);
  });

  it('caps when maxMonths is too small', () => {
    const sim = simulateMonthByMonth({
      P: 1_000_000,
      S0: 0,
      M0: 1,
      r01: 1,
      inf01: 0.25,
      g01: 0,
      assetGrowth01: 0,
      maxMonths: 12,
    });
    expect(sim.capped).toBe(true);
    expect(sim.monthsToReach).toBe(null);
  });

  it('after hybrid switch (>=240), reaching months should be multiple of 12', () => {
    const sim = simulateMonthByMonth({
      P: 5_000_000_000,
      S0: 0,
      M0: 5_000_000,
      r01: 1,
      inf01: 0.25,
      g01: 0.0,
      assetGrowth01: 0.0,
      maxMonths: 1200,
    });

    if (sim.monthsToReach !== null) {
      expect(sim.monthsToReach).toBeGreaterThanOrEqual(240);
      expect(sim.monthsToReach % 12).toBe(0);
    } else {
      expect(sim.capped).toBe(true);
    }
  });

  it('performance sanity: hybrid path should remain fast (no heavy month-by-month loop)', () => {
    const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

    // This scenario is designed to likely cross the 240-month threshold,
    // forcing the simulator to use the yearly stepping mode.
    const t0 = now();
    const sim = simulateMonthByMonth({
      P: 20_000_000_000,
      S0: 0,
      M0: 2_000_000,
      r01: 1,
      inf01: 0.25,
      g01: 0,
      assetGrowth01: 0,
      maxMonths: 1200,
    });
    const dt = now() - t0;

    // We keep a conservative threshold to avoid flaky failures across machines/CI.
    expect(dt).toBeLessThan(100);

    // Sanity: result should be well-formed (either capped or reached).
    expect(typeof sim.capped).toBe('boolean');
    expect(sim.monthsToReach === null || Number.isFinite(sim.monthsToReach)).toBe(true);
  });
});

describe('home-buy logic: calculateV4 validations', () => {
  const base = {
    P: 1_000_000,
    S0: 0,
    M0: 10_000,
    r01: 0.8,
    inf01: 0.25,
    g01: 0.1,
    assetGrowth01: 0.27,
  };

  it('price must be > 0', () => {
    const res = calculateV4({ ...base, P: 0 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('قیمت');
  });

  it('S0 cannot be negative', () => {
    const res = calculateV4({ ...base, S0: -1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('پس‌انداز فعلی');
  });

  it('M0 cannot be negative', () => {
    const res = calculateV4({ ...base, M0: -1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('ماهانه');
  });

  it('r01 must be in [0,1]', () => {
    const res = calculateV4({ ...base, r01: 1.5 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('درصد تحقق');
  });

  it('inf01 must be in [0,1]', () => {
    const res = calculateV4({ ...base, inf01: -0.1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('تورم');
  });

  it('g01 must be in [0,1]', () => {
    const res = calculateV4({ ...base, g01: 2 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('رشد');
  });

  it('assetGrowth01 must be in [-1,2]', () => {
    const res = calculateV4({ ...base, assetGrowth01: 3 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('عملکرد');
  });
});

describe('home-buy logic: calculateV4 scenarios', () => {
  it('returns "همین الان" when S0 already covers P', () => {
    const res = calculateV4({
      P: 1_000_000,
      S0: 1_000_000,
      M0: 0,
      r01: 0.8,
      inf01: 0.25,
      g01: 0,
      assetGrowth01: 0,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.months).toBe(0);
      expect(res.display).toBe('همین الان');
    }
  });

  it('returns VERY_LONG_TEXT when monthly saving is zero and cannot catch up', () => {
    const res = calculateV4({
      P: 5_000_000_000,
      S0: 0,
      M0: 0,
      r01: 0.8,
      inf01: 0.25,
      g01: 0,
      assetGrowth01: 0,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.display).toBe(VERY_LONG_TEXT);
  });

  it('produces a short horizon (<12 months) in a high-saving scenario', () => {
    const res = calculateV4({
      P: 100_000_000,
      S0: 0,
      M0: 20_000_000,
      r01: 1,
      inf01: 0,
      g01: 0,
      assetGrowth01: 0,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.months).toBeGreaterThan(0);
      expect(res.months).toBeLessThan(12);
      expect(res.display).toContain('ماه');
    }
  });

  it('very-long boundary: months >= 240 must show VERY_LONG_TEXT even if reached', () => {
    const res = calculateV4({
      P: 10_000_000_000,
      S0: 0,
      M0: 1_000_000,
      r01: 1,
      inf01: 0.25,
      g01: 0,
      assetGrowth01: 0,
    });
    expect(res.ok).toBe(true);
    if (res.ok && res.months >= VERY_LONG_MONTHS_THRESHOLD) {
      expect(res.display).toBe(VERY_LONG_TEXT);
    }
  });

  it('caps to 100 years when unreachable within max months (meta.capped=true)', () => {
    const res = calculateV4({
      P: 50_000_000_000,
      S0: 0,
      M0: 100_000, // extremely small
      r01: 1,
      inf01: 0.35,
      g01: 0,
      assetGrowth01: -0.2,
    });
    expect(res.ok).toBe(true);
    if (res.ok && res.meta.capped) {
      expect(res.display).toBe(VERY_LONG_TEXT);
      expect(res.months).toBe(1200);
    }
  });

  it('monotonicity stronger: higher monthly saving should not worsen the horizon (10M → 15M → 20M)', () => {
    const make = (M0: number) =>
      calculateV4({
        P: 2_000_000_000,
        S0: 0,
        M0,
        r01: 1,
        inf01: 0.25,
        g01: 0,
        assetGrowth01: 0,
      });

    const m10 = make(10_000_000);
    const m15 = make(15_000_000);
    const m20 = make(20_000_000);

    expect(m10.ok).toBe(true);
    expect(m15.ok).toBe(true);
    expect(m20.ok).toBe(true);

    if (m10.ok && m15.ok && m20.ok) {
      expect(m15.months).toBeLessThanOrEqual(m10.months);
      expect(m20.months).toBeLessThanOrEqual(m15.months);
    }
  });

  it('negative asset growth vs housing inflation tends to be long (sanity)', () => {
    const res = calculateV4({
      P: 5_000_000_000,
      S0: 0,
      M0: 5_000_000,
      r01: 1,
      inf01: 0.30,
      g01: 0,
      assetGrowth01: -0.10, // lagging behind housing inflation
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.months).toBeGreaterThan(60);
    }
  });

  it('handles huge numbers without NaN/Infinity', () => {
    const res = calculateV4({
      P: 10_000_000_000_000, // 10 trillion
      S0: 1_000_000_000,
      M0: 50_000_000,
      r01: 0.8,
      inf01: 0.25,
      g01: 0.1,
      assetGrowth01: 0.27,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Number.isFinite(res.months)).toBe(true);
      expect(typeof res.display).toBe('string');
    }
  });
});
