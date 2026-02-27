import {
  ExpenseLeakCategoryBreakdown,
  ExpenseLeakCategoryId,
  ExpenseLeakDetectedLeak,
  ExpenseLeakHealthLevel,
  ExpenseLeakHealthScore,
  ExpenseLeakInput,
  ExpenseLeakLeakSeverity,
  ExpenseLeakOutput,
  ExpenseLeakOutputSummary,
  ExpenseLeakPeerCard,
  ExpenseLeakToolRunRawData,
  ExpenseLeakToolRunSummary,
} from './types';

const ENGINE_VERSION = '1.0.0';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safePercent(numerator: number, denominator: number): number {
  if (!denominator || !Number.isFinite(denominator)) return 0;
  return (numerator / denominator) * 100;
}

function sumObjectValues(map: Record<string, number> | undefined | null): number {
  if (!map) return 0;
  return Object.values(map).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

function normaliseInput(input: ExpenseLeakInput): ExpenseLeakInput {
  const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

  return {
    ...input,
    monthlyIncome: n(input.monthlyIncome),
    monthlySaving: n(input.monthlySaving),
    emergencyFundBalance: n(input.emergencyFundBalance),
    inflationRatePercent: n(input.inflationRatePercent),
    quick: input.quick
      ? {
          byCategory: Object.fromEntries(
            Object.entries(input.quick.byCategory ?? {}).map(([k, v]) => [k, n(v as number)]),
          ),
        }
      : undefined,
    detailed: input.detailed
      ? {
          byField: Object.fromEntries(
            Object.entries(input.detailed.byField ?? {}).map(([k, v]) => [k, n(v as number)]),
          ),
        }
      : undefined,
    annualItems: (input.annualItems ?? []).map((it) => ({
      ...it,
      amount: n(it.amount),
    })),
    customItems: (input.customItems ?? []).map((it) => ({
      ...it,
      amount: n(it.amount),
    })),
  };
}

function computeCategoryTotals(input: ExpenseLeakInput): Record<ExpenseLeakCategoryId, number> {
  const totals: Record<ExpenseLeakCategoryId, number> = {
    saving: input.monthlySaving,
    housing: 0,
    food: 0,
    transport: 0,
    lifestyle: 0,
    health: 0,
    bills: 0,
    finance: 0,
  };

  if (input.quick?.byCategory) {
    (Object.entries(input.quick.byCategory) as [ExpenseLeakCategoryId, number][]).forEach(
      ([cat, value]) => {
        if (cat === 'saving') return;
        totals[cat] += value || 0;
      },
    );
  }

  if (input.detailed?.byField) {
    const map: Record<string, ExpenseLeakCategoryId> = {
      rent: 'housing',
      mortgage: 'housing',
      charge: 'housing',
      grocery: 'food',
      restaurant: 'food',
      cafe: 'food',
      delivery: 'food',
      lunch_out: 'food',
      fuel: 'transport',
      taxi: 'transport',
      public: 'transport',
      clothing: 'lifestyle',
      entertain: 'lifestyle',
      small: 'lifestyle',
      medicine: 'health',
      doctor: 'health',
      beauty: 'health',
      gym: 'health',
      hygiene: 'health',
      utilities: 'bills',
      internet: 'bills',
      subs: 'bills',
      loan: 'finance',
      installment: 'finance',
      credit_inst: 'finance',
    };

    Object.entries(input.detailed.byField).forEach(([fieldId, value]) => {
      const cat = map[fieldId];
      if (!cat) return;
      totals[cat] += value || 0;
    });
  }

  return totals;
}

function buildSummary(input: ExpenseLeakInput, totals: Record<ExpenseLeakCategoryId, number>): ExpenseLeakOutputSummary {
  const income = input.monthlyIncome;
  const totalExpensesWithoutSaving =
    totals.housing +
    totals.food +
    totals.transport +
    totals.lifestyle +
    totals.health +
    totals.bills +
    totals.finance +
    sumObjectValues(
      Object.fromEntries((input.customItems ?? []).map((c, idx) => [String(idx), c.amount])),
    );

  const totalCustomExpenses = (input.customItems ?? []).reduce((s, c) => s + c.amount, 0);
  const totalAnnualAmount = (input.annualItems ?? []).reduce((s, a) => s + a.amount, 0);
  const annualMonthly = totalAnnualAmount / 12;

  const saving = totals.saving;
  const balance = income - totalExpensesWithoutSaving - saving;
  const balanceWithAnnual = balance - annualMonthly;

  return {
    income,
    totalExpenses: totalExpensesWithoutSaving,
    totalCustomExpenses,
    totalAnnualAmount,
    annualMonthly,
    saving,
    balance,
    balanceWithAnnual,
  };
}

function deriveHealthLevel(score: number): ExpenseLeakHealthLevel {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  if (score >= 30) return 'weak';
  return 'critical';
}

function buildHealthScore(input: ExpenseLeakInput, summary: ExpenseLeakOutputSummary, totals: Record<ExpenseLeakCategoryId, number>): ExpenseLeakHealthScore {
  const income = summary.income || 0;
  if (!income) {
    return {
      score: 0,
      level: 'weak',
      levelLabel: 'بدون درآمد ثبت‌شده',
      factors: [
        {
          label: 'درآمد ثبت نشده است',
          severity: 'warning',
        },
      ],
    };
  }

  const savingR = safePercent(summary.saving, income) / 100;
  let savScore: number;
  let savLabel: string;
  if (savingR >= 0.2) {
    savScore = 100;
    savLabel = 'پس‌انداز عالی (۲۰٪ یا بیشتر)';
  } else if (savingR >= 0.1) {
    savScore = 80;
    savLabel = 'پس‌انداز خوب (۱۰–۲۰٪)';
  } else if (savingR >= 0.05) {
    savScore = 55;
    savLabel = 'پس‌انداز متوسط (۵–۱۰٪)';
  } else {
    savScore = 20;
    savLabel = 'پس‌انداز ضعیف (کمتر از ۵٪)';
  }

  const debtR = safePercent(totals.finance, income) / 100;
  let debtScore: number;
  let debtLabel: string;
  if (debtR === 0) {
    debtScore = 100;
    debtLabel = 'بدون بدهی ماهانه';
  } else if (debtR < 0.15) {
    debtScore = 80;
    debtLabel = 'بدهی پایین (کمتر از ۱۵٪ درآمد)';
  } else if (debtR <= 0.25) {
    debtScore = 55;
    debtLabel = 'بدهی متوسط (۱۵–۲۵٪ درآمد)';
  } else if (debtR <= 0.36) {
    debtScore = 30;
    debtLabel = 'بدهی سنگین (۲۵–۳۶٪ درآمد)';
  } else {
    debtScore = 10;
    debtLabel = 'بدهی بحرانی (بیش از ۳۶٪ درآمد)';
  }

  const fixedApprox = totals.housing + totals.bills + totals.finance;
  const fragR = safePercent(fixedApprox, income) / 100;
  let fragScore: number;
  let fragLabel: string;
  if (fragR < 0.3) {
    fragScore = 100;
    fragLabel = 'شکنندگی پایین (هزینه‌های ثابت زیر ۳۰٪)';
  } else if (fragR < 0.5) {
    fragScore = 75;
    fragLabel = 'شکنندگی قابل‌قبول (۳۰–۵۰٪)';
  } else if (fragR < 0.65) {
    fragScore = 45;
    fragLabel = 'شکنندگی متوسط (۵۰–۶۵٪)';
  } else if (fragR < 0.8) {
    fragScore = 20;
    fragLabel = 'شکنندگی بالا (۶۵–۸۰٪)';
  } else {
    fragScore = 5;
    fragLabel = 'شکنندگی بحرانی (بیش از ۸۰٪)';
  }

  const remainingR = safePercent(summary.balance, income) / 100;
  let marScore: number;
  let marLabel: string;
  if (remainingR >= 0.1) {
    marScore = 100;
    marLabel = 'حاشیه امن عالی (مازاد ۱۰٪ یا بیشتر)';
  } else if (remainingR >= 0.05) {
    marScore = 70;
    marLabel = 'حاشیه امن کافی (مازاد ۵–۱۰٪)';
  } else if (remainingR > 0) {
    marScore = 40;
    marLabel = 'حاشیه امن کم (مازاد کمتر از ۵٪)';
  } else {
    marScore = 10;
    marLabel = 'کسری بودجه ماهانه';
  }

  const score = Math.round(
    0.3 * savScore + //
      0.25 * debtScore +
      0.2 * fragScore +
      0.15 * marScore +
      0.1 * 60,
  );

  const clampedScore = clamp(score, 0, 100);
  const level = deriveHealthLevel(clampedScore);

  const levelLabel =
    level === 'excellent'
      ? 'عالی'
      : level === 'good'
        ? 'خوب'
        : level === 'average'
          ? 'متوسط'
          : level === 'weak'
            ? 'ضعیف'
            : 'بحرانی';

  const factors: ExpenseLeakHealthScore['factors'] = [
    {
      label: savLabel,
      severity: savingR >= 0.1 ? 'positive' : savingR >= 0.05 ? 'neutral' : 'warning',
    },
    {
      label: debtLabel,
      severity: debtR === 0 ? 'positive' : debtR <= 0.25 ? 'neutral' : 'warning',
    },
    {
      label: fragLabel,
      severity: fragR < 0.5 ? 'neutral' : fragR < 0.65 ? 'warning' : 'critical',
    },
    {
      label: marLabel,
      severity: remainingR >= 0.05 ? 'positive' : remainingR > 0 ? 'neutral' : 'warning',
    },
  ];

  return {
    score: clampedScore,
    level,
    levelLabel,
    factors,
  };
}

function buildCategoryLabel(id: ExpenseLeakCategoryId): string {
  switch (id) {
    case 'saving':
      return 'پس‌انداز';
    case 'housing':
      return 'مسکن';
    case 'food':
      return 'خوراک';
    case 'transport':
      return 'حمل‌ونقل';
    case 'lifestyle':
      return 'سبک زندگی';
    case 'health':
      return 'سلامت و بهداشت';
    case 'bills':
      return 'قبوض';
    case 'finance':
      return 'بدهی‌ها';
    default:
      return id;
  }
}

function buildCategories(
  income: number,
  totals: Record<ExpenseLeakCategoryId, number>,
): ExpenseLeakCategoryBreakdown[] {
  const out: ExpenseLeakCategoryBreakdown[] = [];

  const idealRanges: Partial<Record<ExpenseLeakCategoryId, [number, number]>> = {
    saving: [10, 20],
    housing: [15, 35],
    food: [10, 25],
    transport: [5, 15],
    lifestyle: [5, 15],
    health: [3, 7],
    bills: [4, 8],
    finance: [0, 15],
  };

  const warnRanges: Partial<Record<ExpenseLeakCategoryId, [number, number]>> = {
    saving: [5, 10],
    housing: [35, 55],
    food: [25, 40],
    transport: [15, 25],
    lifestyle: [15, 25],
    health: [7, 15],
    bills: [8, 14],
    finance: [15, 30],
  };

  (Object.keys(totals) as ExpenseLeakCategoryId[]).forEach((id) => {
    const amount = totals[id];
    const pct = safePercent(amount, income);
    const ideal = idealRanges[id];
    const warn = warnRanges[id];

    let status: ExpenseLeakCategoryBreakdown['status'] = 'not_set';
    let tagText: string | undefined;

    if (amount <= 0) {
      status = 'not_set';
      tagText = 'ثبت نشده';
    } else if (!ideal) {
      status = 'informational';
    } else if (id === 'saving') {
      if (pct < (warn?.[0] ?? 5)) {
        status = 'too_low';
        tagText = 'خیلی کم';
      } else if (pct < ideal[0]) {
        status = 'slightly_high';
        tagText = 'کم';
      } else if (pct >= ideal[1]) {
        status = 'ok';
        tagText = 'عالی';
      } else {
        status = 'ok';
        tagText = 'قابل بهبود';
      }
    } else {
      if (pct > (warn?.[1] ?? ideal[1] + 10)) {
        status = 'very_high';
        tagText = 'بسیار بالا';
      } else if (pct > (warn?.[0] ?? ideal[1])) {
        status = 'high';
        tagText = 'بالا';
      } else if (pct > ideal[1]) {
        status = 'slightly_high';
        tagText = 'کمی بالا';
      } else {
        status = 'ok';
        tagText = 'نرمال';
      }
    }

    out.push({
      id,
      label: buildCategoryLabel(id),
      amount,
      percentOfIncome: pct,
      idealRangePercent: ideal,
      warnRangePercent: warn,
      status,
      tagText,
    });
  });

  return out;
}

function buildLeaks(
  income: number,
  categories: ExpenseLeakCategoryBreakdown[],
): ExpenseLeakDetectedLeak[] {
  const leakCandidates = categories.filter(
    (c) => c.id !== 'saving' && c.amount > 0 && c.percentOfIncome > (c.idealRangePercent?.[1] ?? 0),
  );

  const sorted = [...leakCandidates].sort(
    (a, b) => b.percentOfIncome - a.percentOfIncome,
  );

  const top = sorted.slice(0, 2);

  const leaks: ExpenseLeakDetectedLeak[] = top.map((c) => {
    const overPct = c.percentOfIncome - (c.idealRangePercent?.[1] ?? c.percentOfIncome);
    let severity: ExpenseLeakLeakSeverity = 'mild';
    if (overPct > 15) severity = 'severe';
    else if (overPct > 5) severity = 'moderate';

    const note =
      severity === 'severe'
        ? 'این دسته بخش بزرگی از درآمد را مصرف می‌کند؛ اگر هدف‌گذاری کوتاه‌مدت دارید، از اینجا شروع کنید.'
        : severity === 'moderate'
          ? 'این دسته نسبت به بازه هدف کمی بالاست؛ یک سقف ماهانه ساده می‌تواند کمک کند.'
          : 'کمی بالاتر از بازه هدف است؛ اگر بودجه تنگ است، این‌جا را بازبینی کنید.';

    return {
      categoryId: c.id,
      categoryLabel: c.label,
      totalAmount: c.amount,
      percentOfIncome: c.percentOfIncome,
      severity,
      topItems: [],
      note,
    };
  });

  if (!income || leaks.length === 0) {
    return [];
  }

  return leaks;
}

function buildPeers(
  income: number,
  categories: ExpenseLeakCategoryBreakdown[],
  profile: ExpenseLeakInput['profile'],
): ExpenseLeakPeerCard[] {
  if (!income) return [];

  const bracket =
    income < 20_000_000 ? 'lt20' : income <= 40_000_000 ? '20to40' : 'gt40';

  const baseRanges: Record<
    'lt20' | '20to40' | 'gt40',
    Partial<Record<ExpenseLeakCategoryId, [number, number]>>
  > = {
    lt20: {
      housing: [38, 42],
      food: [27, 32],
      transport: [10, 14],
      lifestyle: [8, 12],
    },
    '20to40': {
      housing: [30, 35],
      food: [20, 25],
      transport: [10, 14],
      lifestyle: [12, 16],
    },
    gt40: {
      housing: [22, 28],
      food: [14, 18],
      transport: [10, 14],
      lifestyle: [16, 20],
    },
  };

  const base = baseRanges[bracket];

  const items: ExpenseLeakPeerCard[] = [];

  const getRange = (id: ExpenseLeakCategoryId): [number, number] | null => {
    if (id in base && base[id]) {
      return base[id] as [number, number];
    }
    if (id === 'health') return [2, 7];
    if (id === 'bills') return [4, 8];
    if (id === 'finance') return [0, 14];
    return null;
  };

  categories
    .filter((c) => c.id !== 'saving')
    .forEach((c) => {
      const range = getRange(c.id);
      if (!range) return;

      let [min, max] = range;

      if (c.id === 'housing') {
        if (profile.housing === 'owned_paid') {
          [min, max] = [3, 9];
        } else if (profile.housing === 'owned_mortgage') {
          min = Math.round(min * 0.7);
          max = Math.round(max * 0.7);
        } else if (profile.city === 'tehran') {
          min = Math.round(min * 1.2);
          max = Math.round(max * 1.2);
        } else if (profile.city === 'mid') {
          min = Math.round(min * 0.8);
          max = Math.round(max * 0.8);
        } else if (profile.city === 'small') {
          min = Math.round(min * 0.65);
          max = Math.round(max * 0.65);
        }
      }

      if (c.id === 'food') {
        const factor =
          profile.family === 'family5'
            ? 1.35
            : profile.family === 'family4'
              ? 1.2
              : profile.family === 'couple'
                ? 1.1
                : 1;
        min = Math.round(min * factor);
        max = Math.round(max * factor);
      }

      const avg = (min + max) / 2;
      const userPct = c.percentOfIncome;
      let status: ExpenseLeakPeerCard['status'] = 'similar';

      if (userPct > max + 4) status = 'much_higher';
      else if (userPct > max) status = 'higher';
      else if (userPct < min - 3) status = 'much_lower';
      else if (userPct < min) status = 'lower';

      const statusLabelMap: Record<ExpenseLeakPeerCard['status'], string> = {
        much_higher: 'خیلی بالاتر از مشابه‌ها',
        higher: 'کمی بالاتر از مشابه‌ها',
        similar: 'نزدیک به مشابه‌ها',
        lower: 'کمی کمتر از مشابه‌ها',
        much_lower: 'خیلی کمتر از مشابه‌ها',
      };

      items.push({
        categoryId: c.id,
        label: c.label,
        userPercent: userPct,
        peerAveragePercent: avg,
        peerRangePercent: [min, max],
        status,
        statusLabel: statusLabelMap[status],
      });
    });

  return items;
}

export function analyseExpenseLeak(inputRaw: ExpenseLeakInput): ExpenseLeakOutput {
  const input = normaliseInput(inputRaw);
  const totals = computeCategoryTotals(input);
  const summary = buildSummary(input, totals);
  const health = buildHealthScore(input, summary, totals);
  const categories = buildCategories(summary.income, totals);
  const leaks = buildLeaks(summary.income, categories);
  const peers = buildPeers(summary.income, categories, input.profile);

  return {
    input,
    summary,
    health,
    categories,
    leaks,
    peers,
  };
}

export function buildToolRunSummary(output: ExpenseLeakOutput): ExpenseLeakToolRunSummary {
  const mainLeakCategories = output.leaks.map((l) => l.categoryId).slice(0, 3);

  return {
    mode: output.input.mode,
    income: output.summary.income,
    totalExpenses: output.summary.totalExpenses,
    balance: output.summary.balance,
    balanceWithAnnual: output.summary.balanceWithAnnual,
    healthScore: output.health.score,
    healthLevel: output.health.level,
    mainLeakCategories,
  };
}

export function buildToolRunRawData(output: ExpenseLeakOutput): ExpenseLeakToolRunRawData {
  const summary = buildToolRunSummary(output);

  return {
    version: ENGINE_VERSION,
    input: output.input,
    output,
    summary,
  };
}

