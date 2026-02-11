'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import Head from 'next/head';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ToolHeader from '../../components/ToolHeader';
import { Home } from 'lucide-react';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

type InflationScenario = 'low' | 'base' | 'high' | 'custom';
type SavingScenario = 'bank' | 'value' | 'growth' | 'custom';

type Inputs = {
  price: string; // P (toman)
  currentSavings: string; // S0
  monthlySaving: string; // M0

  realizationPercent: string; // r (%)

  inflationScenario: InflationScenario;
  inflationCustomPercent: string; // annual %

  savingScenario: SavingScenario;
  savingDeltaPercent: string; // annual % (delta vs housing inflation)

  growthPercent: string; // g (%)
};

type CalcResult =
  | { ok: true; months: number; display: string; meta: { capped: boolean } }
  | { ok: false; error: string };

type WarningKey =
  | 'growth_gt_inflation'
  | 'high_realization_high_growth'
  | 'very_conservative'
  | 'monthly_saving_too_high'
  | 'very_long_horizon_possible'
  | 'asset_delta_too_negative'
  | 'optimistic_scenario';

const WARNING_TEXT: Record<WarningKey, string> = {
  growth_gt_inflation:
    'رشد توان پس‌انداز شما از تورم قیمت خانه بیشتر در نظر گرفته شده؛ این حالت برای اکثر افراد نادر است.',
  high_realization_high_growth:
    'این ترکیب فرض می‌کند تقریباً همیشه و با رشد بالا پس‌انداز می‌کنید؛ نتیجه ممکن است خوش‌بینانه باشد.',
  optimistic_scenario: 'این سناریو خوش‌بینانه است؛ نتیجه ممکن است کمتر از واقعیت سختی مسیر را نشان دهد.',
  very_conservative: 'با این فرض‌ها، مدل بسیار محافظه‌کارانه است و ممکن است بدبینانه باشد.',
  monthly_saving_too_high:
    'پس‌انداز شما نسبت به قیمت خانه بسیار بالا در نظر گرفته شده؛ مطمئن شوید عددها با واقعیت زندگی شما سازگارند.',
  very_long_horizon_possible: 'با این فرض‌ها، زمان خرید ممکن است بسیار طولانی شود.',
  asset_delta_too_negative:
    'سناریوی پس‌انداز انتخابی شما نسبت به رشد مسکن «عقب‌مانده» است؛ نتیجه می‌تواند بسیار طولانی شود.',
};

const nfFa = new Intl.NumberFormat('fa-IR');

const DEFAULT_INPUTS: Inputs = {
  price: '',
  currentSavings: '',
  monthlySaving: '',

  realizationPercent: '80',

  inflationScenario: 'base',
  inflationCustomPercent: '25',

  savingScenario: 'value',
  savingDeltaPercent: '2',

  growthPercent: '10',
};

// --- Policy: "Very long" threshold ---
const VERY_LONG_YEARS_THRESHOLD = 20;
const VERY_LONG_MONTHS_THRESHOLD = VERY_LONG_YEARS_THRESHOLD * 12;
const VERY_LONG_TEXT = 'با این فرض‌ها، زمان خرید خانه بسیار طولانی است.';

// --- Scenario defaults ---
const INFLATION_DEFAULTS: Record<Exclude<InflationScenario, 'custom'>, number> = {
  low: 15,
  base: 25,
  high: 35,
};

const SAVING_DELTA_DEFAULTS: Record<Exclude<SavingScenario, 'custom'>, number> = {
  bank: -10,
  value: 2,
  growth: 10,
};

const INFLATION_LABEL: Record<InflationScenario, string> = {
  low: 'پایین',
  base: 'محتمل',
  high: 'بالا',
  custom: 'سفارشی',
};

const SAVING_LABEL: Record<SavingScenario, string> = {
  bank: 'سپرده بانکی (ریالی)',
  value: 'حفظ ارزش (طلا/ارز)',
  growth: 'رشد بیشتر (ریسکی)',
  custom: 'سفارشی',
};

// --- parsing helpers ---
function toNumber(raw: string): number {
  const normalized = raw
    .replace(/[٬,]/g, '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .trim();

  if (!normalized) return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function ceilDiv(a: number, b: number): number {
  return Math.ceil(a / b);
}

function isFiniteAll(...nums: number[]): boolean {
  return nums.every((n) => Number.isFinite(n));
}

function pctTo01_0_100(rawPct: number): number {
  return clamp(rawPct, 0, 100) / 100;
}

function pctTo01_signed(rawPct: number): number {
  const clamped = clamp(rawPct, -100, 200);
  return clamped / 100;
}

// --- formatting ---
function formatMoneyInput(raw: string): string {
  const n = toNumber(raw);
  if (!Number.isFinite(n)) return raw;
  return nfFa.format(Math.max(0, Math.floor(n)));
}

function formatPercentInput0to100(raw: string): string {
  const n = toNumber(raw);
  if (!Number.isFinite(n)) return raw;
  return String(clamp(Math.round(n), 0, 100));
}

function formatPercentInputSigned(raw: string): string {
  const n = toNumber(raw);
  if (!Number.isFinite(n)) return raw;
  return String(clamp(Math.round(n), -100, 200));
}

function formatToman(n: number): string {
  return `${nfFa.format(Math.round(n))} تومان`;
}

// --- URL share (scenario in query string) ---
function sanitizeNumericString(raw: string, opts?: { allowMinus?: boolean }): string {
  const allowMinus = !!opts?.allowMinus;
  const cleaned = raw
    .replace(/[\s]/g, '')
    .replace(/[٬,]/g, '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(allowMinus ? /[^0-9\-]/g : /[^0-9]/g, '');

  if (allowMinus) {
    const firstMinus = cleaned.indexOf('-');
    if (firstMinus > 0) return cleaned.replace(/-/g, '');
    if (firstMinus === 0) return '-' + cleaned.slice(1).replace(/-/g, '');
  }

  return cleaned;
}

function parseInputsFromSearchParams(sp: ReadonlyURLSearchParams): Partial<Inputs> {
  const out: Partial<Inputs> = {};

  const inflationScenario = sp.get('inf');
  const savingScenario = sp.get('sav');

  if (inflationScenario && ['low', 'base', 'high', 'custom'].includes(inflationScenario)) {
    out.inflationScenario = inflationScenario as InflationScenario;
  }
  if (savingScenario && ['bank', 'value', 'growth', 'custom'].includes(savingScenario)) {
    out.savingScenario = savingScenario as SavingScenario;
  }

  const price = sp.get('p');
  const s0 = sp.get('s0');
  const m0 = sp.get('m0');
  const r = sp.get('r');
  const infc = sp.get('infc');
  const del = sp.get('del');
  const g = sp.get('g');

  if (price) out.price = sanitizeNumericString(price);
  if (s0) out.currentSavings = sanitizeNumericString(s0);
  if (m0) out.monthlySaving = sanitizeNumericString(m0);
  if (r) out.realizationPercent = sanitizeNumericString(r);
  if (infc) out.inflationCustomPercent = sanitizeNumericString(infc);
  if (del) out.savingDeltaPercent = sanitizeNumericString(del, { allowMinus: true });
  if (g) out.growthPercent = sanitizeNumericString(g);

  return out;
}

function buildShareQuery(inputs: Inputs): string {
  const qs = new URLSearchParams();

  if (inputs.price) qs.set('p', sanitizeNumericString(inputs.price));
  if (inputs.currentSavings) qs.set('s0', sanitizeNumericString(inputs.currentSavings));
  if (inputs.monthlySaving) qs.set('m0', sanitizeNumericString(inputs.monthlySaving));
  if (inputs.realizationPercent) qs.set('r', sanitizeNumericString(inputs.realizationPercent));

  qs.set('inf', inputs.inflationScenario);
  if (inputs.inflationScenario === 'custom') {
    qs.set('infc', sanitizeNumericString(inputs.inflationCustomPercent));
  }

  qs.set('sav', inputs.savingScenario);
  if (inputs.savingScenario === 'custom') {
    qs.set('del', sanitizeNumericString(inputs.savingDeltaPercent, { allowMinus: true }));
  }

  if (inputs.growthPercent) qs.set('g', sanitizeNumericString(inputs.growthPercent));

  const s = qs.toString();
  return s ? `?${s}` : '';
}

// --- Display rules ---
function formatResultFromMonths(months: number): string {
  if (months <= 0) return 'همین الان';
  if (months < 12) return `حدود ${nfFa.format(months)} ماه`;
  if (months >= VERY_LONG_MONTHS_THRESHOLD) return VERY_LONG_TEXT;
  return `حدود ${nfFa.format(ceilDiv(months, 12))} سال`;
}

// --- Warnings ---
function buildWarnings(args: {
  P: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
  deltaPct: number;
}): WarningKey[] {
  const { P, M0, r01, inf01, g01, deltaPct } = args;
  const warnings: WarningKey[] = [];

  if (deltaPct >= 8 || g01 >= 0.2) warnings.push('optimistic_scenario');
  if (r01 >= 0.9 && g01 >= 0.2) warnings.push('high_realization_high_growth');
  if (g01 > inf01) warnings.push('growth_gt_inflation');
  if (r01 <= 0.4 && g01 === 0) warnings.push('very_conservative');
  if (M0 > 0 && P > 0 && M0 * 12 > 0.5 * P) warnings.push('monthly_saving_too_high');
  if (r01 < 0.2 && g01 === 0 && inf01 >= 0.3) warnings.push('very_long_horizon_possible');
  if (deltaPct <= -15) warnings.push('asset_delta_too_negative');

  return warnings.slice(0, 3);
}

// --- Core simulation (month-by-month) ---
function simulateMonthByMonth(params: {
  P: number;
  S0: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
  assetGrowth01: number;
  maxMonths: number;
}): { monthsToReach: number | null; capped: boolean } {
  const { P, S0, M0, r01, inf01, g01, assetGrowth01, maxMonths } = params;

  let month = 0;
  let housePrice = P;
  let saving = S0;
  let nominalMonthlySaving = M0;

  if (saving >= housePrice) return { monthsToReach: 0, capped: false };

  const inf_m = inf01 / 12;
  const g_m = g01 / 12;

  const asset_m_raw = assetGrowth01 / 12;
  const asset_m = clamp(asset_m_raw, -0.95, 2);

  const HYBRID_SWITCH_MONTH = 240;

  const a = 1 + asset_m;
  const i = 1 + inf_m;
  const q = 1 + g_m;

  while (month < maxMonths) {
    const remaining = maxMonths - month;

    if (month < HYBRID_SWITCH_MONTH || remaining < 12) {
      saving *= a;
      saving += nominalMonthlySaving * r01;

      housePrice *= i;
      nominalMonthlySaving *= q;

      month += 1;

      if (saving >= housePrice) return { monthsToReach: month, capped: false };
      continue;
    }

    const a12 = Math.pow(a, 12);
    const i12 = Math.pow(i, 12);
    const q12 = Math.pow(q, 12);

    let contrib = 0;
    for (let k = 0; k < 12; k++) {
      contrib += Math.pow(a, 11 - k) * Math.pow(q, k);
    }

    saving = saving * a12 + nominalMonthlySaving * r01 * contrib;
    housePrice = housePrice * i12;
    nominalMonthlySaving = nominalMonthlySaving * q12;
    month += 12;

    if (saving >= housePrice) return { monthsToReach: month, capped: false };
  }

  return { monthsToReach: null, capped: true };
}

function calculateV4(params: {
  P: number;
  S0: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
  assetGrowth01: number;
}): CalcResult {
  const { P, S0, M0, r01, inf01, g01, assetGrowth01 } = params;

  if (!(P > 0)) return { ok: false, error: 'قیمت فعلی خانه باید بیشتر از صفر باشد.' };
  if (!(S0 >= 0)) return { ok: false, error: 'پس‌انداز فعلی نمی‌تواند منفی باشد.' };
  if (!(M0 >= 0)) return { ok: false, error: 'پس‌انداز ماهانه نمی‌تواند منفی باشد.' };

  if (!(r01 >= 0 && r01 <= 1)) return { ok: false, error: 'درصد تحقق باید بین ۰ تا ۱۰۰ باشد.' };
  if (!(inf01 >= 0 && inf01 <= 1)) return { ok: false, error: 'تورم سالانه باید بین ۰ تا ۱۰۰ باشد.' };
  if (!(g01 >= 0 && g01 <= 1)) return { ok: false, error: 'رشد سالانه توان پس‌انداز باید بین ۰ تا ۱۰۰ باشد.' };

  if (!(assetGrowth01 >= -1 && assetGrowth01 <= 2)) {
    return { ok: false, error: 'عملکرد پس‌انداز (سالانه) باید بین −۱۰۰٪ تا ۲۰۰٪ باشد.' };
  }

  const MAX_MONTHS = 1200;
  const sim = simulateMonthByMonth({
    P,
    S0,
    M0,
    r01,
    inf01,
    g01,
    assetGrowth01,
    maxMonths: MAX_MONTHS,
  });

  if (sim.capped || sim.monthsToReach === null) {
    return { ok: true, months: MAX_MONTHS, display: VERY_LONG_TEXT, meta: { capped: true } };
  }

  const months = sim.monthsToReach;
  const display = formatResultFromMonths(months);

  if (months >= VERY_LONG_MONTHS_THRESHOLD) {
    return { ok: true, months, display: VERY_LONG_TEXT, meta: { capped: false } };
  }

  return { ok: true, months, display, meta: { capped: false } };
}

// --- Annual details (for trust) ---
type AnnualRow = {
  year: number;
  housePrice: number;
  savings: number;
  gap: number;
  reached: boolean;
};

function buildAnnualDetails(params: {
  P: number;
  S0: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
  assetGrowth01: number;
  yearsToShow: number;
}): AnnualRow[] {
  const { P, S0, M0, r01, inf01, g01, assetGrowth01, yearsToShow } = params;

  const inf_m = inf01 / 12;
  const g_m = g01 / 12;
  const asset_m = clamp(assetGrowth01 / 12, -0.95, 2);

  let housePrice = P;
  let saving = S0;
  let nominalMonthlySaving = M0;

  const rows: AnnualRow[] = [];

  for (let y = 1; y <= yearsToShow; y++) {
    for (let m = 0; m < 12; m++) {
      saving *= 1 + asset_m;
      saving += nominalMonthlySaving * r01;

      housePrice *= 1 + inf_m;
      nominalMonthlySaving *= 1 + g_m;
    }

    const reached = saving >= housePrice;

    rows.push({
      year: y,
      housePrice,
      savings: saving,
      gap: Math.max(0, housePrice - saving),
      reached,
    });
  }

  return rows;
}

function buildShareText(args: {
  display: string;
  priceToman: number;
  s0Toman: number;
  m0Toman: number;

  rPct: number;

  inflationScenario: InflationScenario;
  infPct: number;

  savingScenario: SavingScenario;
  deltaPct: number;
  assetGrowthPct: number;

  gPct: number;
}): string {
  const {
    display,
    priceToman,
    s0Toman,
    m0Toman,
    rPct,
    inflationScenario,
    infPct,
    savingScenario,
    deltaPct,
    assetGrowthPct,
    gPct,
  } = args;

  const footer = 'این نتیجه بر اساس فرض‌های واردشده محاسبه شده و پیش‌بینی قطعی آینده نیست.';

  return [
    `نتیجه: ${display}`,
    `قیمت خانه: ${nfFa.format(priceToman)} تومان`,
    `پس‌انداز فعلی: ${nfFa.format(s0Toman)} تومان`,
    `پس‌انداز ماهانه: ${nfFa.format(m0Toman)} تومان`,
    `تحقق پس‌انداز: ${nfFa.format(rPct)}٪`,
    `سناریوی رشد مسکن: ${INFLATION_LABEL[inflationScenario]} (${nfFa.format(infPct)}٪)`,
    `سناریوی پس‌انداز: ${SAVING_LABEL[savingScenario]} (اختلاف با مسکن: ${nfFa.format(deltaPct)}٪)`,
    `رشد سالانه دارایی پس‌انداز (تقریبی): ${nfFa.format(assetGrowthPct)}٪`,
    `رشد توان پس‌انداز: ${nfFa.format(gPct)}٪`,
    '',
    footer,
  ].join('\n');
}

// --- DEV presets ---
const PRESETS: Array<{
  id: string;
  title: string;
  note: string;
  values: Inputs;
}> = [
  {
    id: 'edge_huge_price_tiny_saving',
    title: 'قیمت خیلی بالا + پس‌انداز خیلی کم',
    note: 'خروجی باید «خیلی طولانی» شود و هشدارها ممکن است ظاهر شوند.',
    values: {
      ...DEFAULT_INPUTS,
      price: '10000000000000',
      currentSavings: '1',
      monthlySaving: '1',
      inflationScenario: 'base',
      savingScenario: 'value',
    },
  },
  {
    id: 'edge_zero_monthly',
    title: 'پس‌انداز ماهانه صفر',
    note: 'اگر پس‌انداز فعلی کافی نباشد، خروجی باید «خیلی طولانی» شود.',
    values: {
      ...DEFAULT_INPUTS,
      price: '3500000000',
      currentSavings: '400000000',
      monthlySaving: '0',
      inflationScenario: 'base',
      savingScenario: 'value',
    },
  },
  {
    id: 'edge_already_enough',
    title: 'پس‌انداز فعلی کافی',
    note: 'خروجی باید «همین الان» باشد.',
    values: {
      ...DEFAULT_INPUTS,
      price: '3500000000',
      currentSavings: '4000000000',
      monthlySaving: '0',
      inflationScenario: 'base',
      savingScenario: 'value',
    },
  },
];

export default function BuyHouseCalculatorPage() {
  const IS_DEV = process.env.NODE_ENV !== 'production';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);

  const [showEdgeCases, setShowEdgeCases] = useState<boolean>(IS_DEV);

  const [showInflationHelp, setShowInflationHelp] = useState(false);
  const [showDeltaHelp, setShowDeltaHelp] = useState(false);

  // ✅ inputs collapsible after result
  const [inputsOpen, setInputsOpen] = useState(true);

  const [inputs, setInputs] = useState<Inputs>({ ...DEFAULT_INPUTS });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [toast, setToast] = useState<string>('');

  const topRef = useRef<HTMLDivElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;

    try {
      const fromUrl = parseInputsFromSearchParams(searchParams);
      if (Object.keys(fromUrl).length > 0) {
        setInputs((prev) => ({ ...prev, ...fromUrl }));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = useMemo(() => {
    const P = toNumber(inputs.price);
    const S0 = toNumber(inputs.currentSavings);
    const M0 = toNumber(inputs.monthlySaving);

    const rPct = toNumber(inputs.realizationPercent);
    const r01 = pctTo01_0_100(rPct);

    const infPct =
      inputs.inflationScenario === 'custom'
        ? toNumber(inputs.inflationCustomPercent)
        : INFLATION_DEFAULTS[inputs.inflationScenario];
    const inf01 = pctTo01_0_100(infPct);

    const deltaPct =
      inputs.savingScenario === 'custom'
        ? toNumber(inputs.savingDeltaPercent)
        : SAVING_DELTA_DEFAULTS[inputs.savingScenario];

    const assetGrowthPct = infPct + deltaPct;
    const assetGrowth01 = pctTo01_signed(assetGrowthPct);

    const gPct = toNumber(inputs.growthPercent);
    const g01 = pctTo01_0_100(gPct);

    return {
      P,
      S0,
      M0,
      rPct,
      r01,
      infPct,
      inf01,
      deltaPct,
      assetGrowthPct,
      assetGrowth01,
      gPct,
      g01,
    };
  }, [inputs]);

  const warnings = useMemo(() => {
    const { P, M0, r01, inf01, g01, deltaPct } = parsed;
    if (!isFiniteAll(P, M0, r01, inf01, g01, deltaPct)) return [];
    if (!(P > 0)) return [];
    return buildWarnings({ P, M0, r01, inf01, g01, deltaPct });
  }, [parsed]);

  const effectiveMonthlySaving = useMemo(() => {
    const m = toNumber(inputs.monthlySaving);
    const r = toNumber(inputs.realizationPercent);
    if (!Number.isFinite(m) || !Number.isFinite(r)) return 0;
    return Math.max(0, m) * pctTo01_0_100(r);
  }, [inputs.monthlySaving, inputs.realizationPercent]);

  const reachYearCeil = useMemo(() => {
    if (!result || !result.ok) return null;
    if (result.display === VERY_LONG_TEXT) return null;
    if (result.months <= 0) return 0;
    return ceilDiv(result.months, 12);
  }, [result]);

  const annualDetails = useMemo(() => {
    const { P, S0, M0, r01, inf01, g01, assetGrowth01 } = parsed;
    if (!isFiniteAll(P, S0, M0, r01, inf01, g01, assetGrowth01)) return [];
    if (!(P > 0)) return [];

    const baseYears = 10;
    const yearsToShow =
      reachYearCeil !== null ? Math.max(0, Math.min(baseYears, reachYearCeil)) : baseYears;

    if (yearsToShow === 0) return [];

    return buildAnnualDetails({
      P,
      S0,
      M0,
      r01,
      inf01,
      g01,
      assetGrowth01,
      yearsToShow,
    });
  }, [parsed, reachYearCeil]);

  const resultShareText = useMemo(() => {
    if (!result || !result.ok) return '';
    const { P, S0, M0, rPct, infPct, deltaPct, assetGrowthPct, gPct } = parsed;
    if (!isFiniteAll(P, S0, M0, rPct, infPct, deltaPct, assetGrowthPct, gPct)) return '';
    return buildShareText({
      display: result.display,
      priceToman: P,
      s0Toman: S0,
      m0Toman: M0,
      rPct: clamp(rPct, 0, 100),
      inflationScenario: inputs.inflationScenario,
      infPct: clamp(infPct, 0, 100),
      savingScenario: inputs.savingScenario,
      deltaPct: clamp(deltaPct, -100, 200),
      assetGrowthPct: clamp(assetGrowthPct, -100, 200),
      gPct: clamp(gPct, 0, 100),
    });
  }, [parsed, result, inputs.inflationScenario, inputs.savingScenario]);

  function setField<K extends keyof Inputs>(key: K, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1600);
  }

  function onCalculate() {
    const { P, S0, M0, r01, inf01, g01, assetGrowth01 } = parsed;

    if ([P, S0, M0, r01, inf01, g01, assetGrowth01].some((x) => Number.isNaN(x))) {
      setResult({ ok: false, error: 'لطفاً فقط عدد وارد کنید.' });
      setInputsOpen(true);
      return;
    }

    const res = calculateV4({ P, S0, M0, r01, inf01, g01, assetGrowth01 });
    setResult(res);

    if (res.ok) {
      setInputsOpen(false);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        resultRef.current?.focus();
      }, 40);
    } else {
      setInputsOpen(true);
      window.setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        priceInputRef.current?.focus();
      }, 40);
    }

    try {
      const qs = buildShareQuery(inputs);
      router.replace(`${pathname}${qs}`, { scroll: false });
    } catch {
      // ignore
    }
  }

  function onEditInputs() {
    setInputsOpen(true);
    window.setTimeout(() => {
      priceInputRef.current?.focus();
      priceInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    showToast('می‌تونی ورودی‌ها رو تغییر بدی');
  }

  function onResetAll() {
    setInputs({ ...DEFAULT_INPUTS });
    setResult(null);
    setInputsOpen(true);
    setShowInflationHelp(false);
    setShowDeltaHelp(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => priceInputRef.current?.focus(), 200);
    showToast('ریست شد');
  }

  async function onCopy() {
    if (!result || !result.ok || !resultShareText) return;
    try {
      await navigator.clipboard.writeText(resultShareText);
      showToast('کپی شد');
    } catch {
      showToast('کپی انجام نشد');
    }
  }

  function buildCurrentShareUrl(): string {
    const qs = buildShareQuery(inputs);
    if (typeof window === 'undefined') return `${pathname}${qs}`;
    const url = new URL(window.location.href);
    url.pathname = pathname;
    url.search = qs.startsWith('?') ? qs.slice(1) : qs;
    return url.toString();
  }

  async function onCopyLink() {
    try {
      const link = buildCurrentShareUrl();
      await navigator.clipboard.writeText(link);
      showToast('لینک کپی شد');
    } catch {
      showToast('کپی لینک انجام نشد');
    }
  }

  async function onShare() {
    if (!result || !result.ok || !resultShareText) return;
    try {
      const canShare = typeof navigator !== 'undefined' && (navigator as any).share;
      if (canShare) {
        await (navigator as any).share({ text: resultShareText, url: buildCurrentShareUrl() });
        return;
      }
      await navigator.clipboard.writeText(buildCurrentShareUrl());
      showToast('لینک کپی شد (اشتراک‌گذاری پشتیبانی نشد)');
    } catch {
      showToast('اشتراک‌گذاری انجام نشد');
    }
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setInputs(p.values);
    setResult(null);
    setInputsOpen(true);
    setShowInflationHelp(false);
    setShowDeltaHelp(false);
    showToast('سناریو اعمال شد');
  }

  // --- tokens ---
  const bg = '#F9FAFB';
  const panel = '#FFFFFF';
  const border = 'rgba(15, 23, 42, 0.10)';
  const text = '#0F172A';
  const muted = 'rgba(15, 23, 42, 0.72)';
  const subtle = 'rgba(15, 23, 42, 0.56)';
  const inputBg = '#FFFFFF';
  const btnBg = '#111827';
  const btnText = '#FFFFFF';
  const btnGhostBg = 'rgba(15, 23, 42, 0.05)';

  const isVeryLong = !!(result && result.ok && result.display === VERY_LONG_TEXT);

  return (
    <>
      <Head>
        <title>تخمین زمان خرید خانه | تخمینو</title>
        <meta
          name="description"
          content="تخمین زمان خرید خانه بر اساس پس‌انداز فعلی، پس‌انداز ماهانه و سناریوی رشد قیمت مسکن (نتیجه تقریبی است)."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main dir="rtl" className={vazirmatn.className} style={{ minHeight: '100vh', background: bg, color: text }}>
        <style jsx global>{`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div ref={topRef} style={{ maxWidth: 640, margin: '0 auto', padding: '18px 14px 28px' }}>
          

          {/* RESULT */}
          {result ? (
            <section style={{ marginBottom: 12 }}>
              <div
                ref={resultRef}
                tabIndex={-1}
                style={{
                  background: panel,
                  border: `1px solid ${border}`,
                  borderRadius: 18,
                  padding: 14,
                  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
                  animation: 'fadeUp 220ms ease-out',
                  outline: 'none',
                }}
              >
                {result.ok ? (
                  <>
                    <div
                      style={{
                        borderRadius: 16,
                        padding: '12px 12px',
                        border: `1px solid ${border}`,
                        background: isVeryLong ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      }}
                    >
                      <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.35, textAlign: 'right' }}>
                        {result.display}
                      </div>
                      <div style={{ marginTop: 6, color: muted, lineHeight: 1.85, textAlign: 'right', fontSize: 13 }}>
                        اگر شرایط فعلی و سناریوهای شما تغییر نکند.
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: subtle, lineHeight: 1.8, textAlign: 'right' }}>
                        این نتیجه بر اساس فرض‌های واردشده محاسبه شده و پیش‌بینی قطعی آینده نیست.
                      </div>
                    </div>

                    <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                      <MiniRow label="قیمت فعلی خانه" value={formatToman(parsed.P || 0)} border={border} />
                      <MiniRow label="پس‌انداز فعلی" value={formatToman(parsed.S0 || 0)} border={border} />
                      <MiniRow label="پس‌انداز ماهانه" value={formatToman(parsed.M0 || 0)} border={border} />
                      <MiniRow label="پس‌انداز مؤثر ماهانه" value={formatToman(effectiveMonthlySaving)} border={border} />
                    </div>

                    {/* Actions (single set) */}
                    <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                          onClick={onCopy}
                          style={{
                            width: '100%',
                            padding: '12px 12px',
                            borderRadius: 16,
                            border: `1px solid ${border}`,
                            background: btnGhostBg,
                            color: text,
                            fontWeight: 900,
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                          }}
                          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
                          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          کپی نتیجه
                        </button>

                        <button
                          onClick={onCopyLink}
                          style={{
                            width: '100%',
                            padding: '12px 12px',
                            borderRadius: 16,
                            border: `1px solid ${border}`,
                            background: btnGhostBg,
                            color: text,
                            fontWeight: 900,
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                          }}
                          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
                          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          کپی لینک
                        </button>
                      </div>

                      <button
                        onClick={onShare}
                        style={{
                          width: '100%',
                          padding: '12px 12px',
                          borderRadius: 16,
                          border: `1px solid ${border}`,
                          background: btnGhostBg,
                          color: text,
                          fontWeight: 900,
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        اشتراک‌گذاری
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                          onClick={onEditInputs}
                          style={{
                            width: '100%',
                            padding: '12px 12px',
                            borderRadius: 16,
                            border: `1px solid ${border}`,
                            background: 'rgba(15,23,42,0.03)',
                            color: text,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          ویرایش ورودی‌ها
                        </button>

                        <button
                          onClick={onResetAll}
                          style={{
                            width: '100%',
                            padding: '12px 12px',
                            borderRadius: 16,
                            border: `1px solid ${border}`,
                            background: 'rgba(15,23,42,0.03)',
                            color: text,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          ریست کامل
                        </button>
                      </div>

                      <div style={{ fontSize: 12, color: subtle, lineHeight: 1.7, textAlign: 'right' }}>
                        نتیجه اصلی فقط «حدود زمان» را نشان می‌دهد؛ جزئیات برای شفافیت محاسبه، سالانه و تقریبی است.
                      </div>
                    </div>

                    {/* Annual details */}
                    <div style={{ marginTop: 12 }}>
                      <details
                        style={{
                          border: `1px solid ${border}`,
                          borderRadius: 16,
                          background: 'rgba(15,23,42,0.02)',
                          padding: '10px 12px',
                        }}
                      >
                        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>جزئیات محاسبه (سالانه، تقریبی)</summary>

                        <div style={{ marginTop: 10, color: muted, fontSize: 13, lineHeight: 1.9 }}>
                          <div>
                            سناریوی رشد مسکن:{' '}
                            <b>
                              {INFLATION_LABEL[inputs.inflationScenario]} ({nfFa.format(clamp(parsed.infPct || 0, 0, 100))}٪)
                            </b>
                          </div>
                          <div>
                            سناریوی پس‌انداز:{' '}
                            <b>
                              {SAVING_LABEL[inputs.savingScenario]} (اختلاف با مسکن: {nfFa.format(clamp(parsed.deltaPct || 0, -100, 200))}٪)
                            </b>
                          </div>
                          <div>
                            رشد سالانه دارایی پس‌انداز (تقریبی): <b>{nfFa.format(clamp(parsed.assetGrowthPct || 0, -100, 200))}٪</b>
                          </div>
                          <div>
                            رشد سالانه توان پس‌انداز: <b>{nfFa.format(clamp(parsed.gPct || 0, 0, 100))}٪</b>
                          </div>
                          <div>
                            تحقق پس‌انداز: <b>{nfFa.format(clamp(parsed.rPct || 0, 0, 100))}٪</b>
                          </div>

                          {reachYearCeil !== null ? (
                            <div style={{ marginTop: 8, color: subtle }}>
                              جدول زیر فقط تا <b>سال {nfFa.format(reachYearCeil)}</b> نمایش داده می‌شود.
                            </div>
                          ) : (
                            <div style={{ marginTop: 8, color: subtle }}>جدول زیر فقط «۱۰ سال اول» را نشان می‌دهد.</div>
                          )}
                        </div>

                        <div style={{ marginTop: 10, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 12 }}>
                            <thead>
                              <tr>
                                <Th border={border}>سال</Th>
                                <Th border={border}>قیمت خانه</Th>
                                <Th border={border}>پس‌انداز</Th>
                                <Th border={border}>کمبود</Th>
                              </tr>
                            </thead>
                            <tbody>
                              {annualDetails.map((r) => (
                                <tr key={r.year}>
                                  <Td border={border}>{nfFa.format(r.year)}</Td>
                                  <Td border={border}>{nfFa.format(Math.round(r.housePrice))}</Td>
                                  <Td border={border}>{nfFa.format(Math.round(r.savings))}</Td>
                                  <Td border={border}>{r.reached ? '✅ صفر' : nfFa.format(Math.round(r.gap))}</Td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      borderRadius: 16,
                      border: `1px solid ${border}`,
                      padding: '12px 12px',
                      background: 'rgba(239,68,68,0.06)',
                      color: text,
                      fontWeight: 900,
                      lineHeight: 1.9,
                    }}
                  >
                    {result.error}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* INPUTS */}
          {!result || inputsOpen ? (
            <section
              style={{
                background: panel,
                border: `1px solid ${border}`,
                borderRadius: 18,
                boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
                overflow: 'hidden',
              }}
            >
              <ToolHeader
                icon={<Home className="w-11 h-11 stroke-[1.75] text-[#16A34A]" />}
                title="چند سال دیگه می‌تونم خونه بخرم؟"
                subtitle="تخمین تقریبی با شرایط فعلی شما"
                helpText="این محاسبه بر اساس سناریوهای انتخابی شما انجام می‌شود و پیش‌بینی قطعی آینده نیست.
"
              />

              <div style={{ padding: 14 }}>
              <FieldMoney
                id="price"
                label="قیمت فعلی خانه"
                placeholder="مثلاً ۳٬۵۰۰٬۰۰۰٬۰۰۰"
                helper="قیمت امروز خانه‌ای که می‌خواهید بخرید. (تومان)"
                value={inputs.price}
                onChange={(v) => setField('price', v)}
                onBlur={() => setField('price', formatMoneyInput(inputs.price))}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
                inputRef={priceInputRef}
              />

              <FieldMoney
                id="currentSavings"
                label="پس‌انداز فعلی"
                placeholder="مثلاً ۴۰۰٬۰۰۰٬۰۰۰"
                helper="مقداری که همین الان دارید. (تومان)"
                value={inputs.currentSavings}
                onChange={(v) => setField('currentSavings', v)}
                onBlur={() => setField('currentSavings', formatMoneyInput(inputs.currentSavings))}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
              />

              <FieldMoney
                id="monthlySaving"
                label="پس‌انداز ماهانه"
                placeholder="مثلاً ۱۵٬۰۰۰٬۰۰۰"
                helper="مبلغی که دوست دارید هر ماه کنار بگذارید. (تومان)"
                value={inputs.monthlySaving}
                onChange={(v) => setField('monthlySaving', v)}
                onBlur={() => setField('monthlySaving', formatMoneyInput(inputs.monthlySaving))}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
              />

              <FieldPercent
                id="realizationPercent"
                label="در عمل چند٪ از این مبلغ را می‌توانید پس‌انداز کنید؟"
                placeholder="مثلاً ۸۰"
                helper="اگر بعضی ماه‌ها کمتر/هیچ پس‌انداز نمی‌کنید، این درصد را پایین‌تر بگذارید."
                helper2="این درصد روی «پس‌انداز مؤثر ماهانه» اثر می‌گذارد."
                value={inputs.realizationPercent}
                onChange={(v) => setField('realizationPercent', v)}
                onBlur={() => setField('realizationPercent', formatPercentInput0to100(inputs.realizationPercent))}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
              />

              <FieldSelect
                id="inflationScenario"
                label="سناریوی رشد قیمت مسکن"
                helper="به‌جای یک عدد قطعی، یک سناریو انتخاب کنید."
                value={inputs.inflationScenario}
                onChange={(v) => setField('inflationScenario', v as InflationScenario)}
                options={[
                  { value: 'low', label: `پایین (${nfFa.format(INFLATION_DEFAULTS.low)}٪)` },
                  { value: 'base', label: `محتمل (${nfFa.format(INFLATION_DEFAULTS.base)}٪)` },
                  { value: 'high', label: `بالا (${nfFa.format(INFLATION_DEFAULTS.high)}٪)` },
                  { value: 'custom', label: 'سفارشی' },
                ]}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
              />

              {inputs.inflationScenario === 'custom' && (
                <>
                  <InlineHelpToggle
                    label="راهنمای تورم سفارشی"
                    isOpen={showInflationHelp}
                    onToggle={() => setShowInflationHelp((s) => !s)}
                    border={border}
                    subtle={subtle}
                  />
                  {showInflationHelp ? (
                    <HelpBox border={border} muted={muted}>
                      <div>برای شروع، می‌توانید از این بازه‌ها ایده بگیرید:</div>
                      <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>
                        <li>پایین: {nfFa.format(INFLATION_DEFAULTS.low)}٪</li>
                        <li>محتمل: {nfFa.format(INFLATION_DEFAULTS.base)}٪</li>
                        <li>بالا: {nfFa.format(INFLATION_DEFAULTS.high)}٪</li>
                      </ul>
                    </HelpBox>
                  ) : null}

                  <FieldPercent
                    id="inflationCustomPercent"
                    label="تورم سالانه قیمت مسکن (سفارشی)"
                    placeholder="مثلاً ۳۰"
                    helper="این عدد فقط برای سناریوی سفارشی استفاده می‌شود."
                    value={inputs.inflationCustomPercent}
                    onChange={(v) => setField('inflationCustomPercent', v)}
                    onBlur={() =>
                      setField('inflationCustomPercent', formatPercentInput0to100(inputs.inflationCustomPercent))
                    }
                    inputBg={inputBg}
                    border={border}
                    text={text}
                    muted={muted}
                  />
                </>
              )}

              <FieldSelect
                id="savingScenario"
                label="سناریوی حفظ ارزش پس‌انداز"
                helper="پس‌انداز شما نسبت به رشد مسکن عقب می‌ماند یا هم‌راستا/جلوتر است."
                value={inputs.savingScenario}
                onChange={(v) => setField('savingScenario', v as SavingScenario)}
                options={[
                  { value: 'bank', label: `سپرده بانکی (ریالی) (اختلاف: ${nfFa.format(SAVING_DELTA_DEFAULTS.bank)}٪)` },
                  { value: 'value', label: `حفظ ارزش (طلا/ارز) (اختلاف: +${nfFa.format(SAVING_DELTA_DEFAULTS.value)}٪)` },
                  { value: 'growth', label: `رشد بیشتر (ریسکی) (اختلاف: +${nfFa.format(SAVING_DELTA_DEFAULTS.growth)}٪)` },
                  { value: 'custom', label: 'سفارشی' },
                ]}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
              />

              {inputs.savingScenario === 'custom' && (
                <>
                  <InlineHelpToggle
                    label="راهنمای دلتا سفارشی"
                    isOpen={showDeltaHelp}
                    onToggle={() => setShowDeltaHelp((s) => !s)}
                    border={border}
                    subtle={subtle}
                  />
                  {showDeltaHelp ? (
                    <HelpBox border={border} muted={muted}>
                      <div>نمونه‌های رایج (تقریبی):</div>
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <Pill border={border}>بانک: −۱۰٪</Pill>
                        <Pill border={border}>طلا/ارز: ۰ تا +۵٪</Pill>
                        <Pill border={border}>ریسکی: +۱۰٪+</Pill>
                      </div>
                      <div style={{ marginTop: 6, opacity: 0.8 }}>«دلتا» یعنی اختلاف رشد پس‌انداز شما نسبت به رشد مسکن.</div>
                    </HelpBox>
                  ) : null}

                  <FieldPercentSigned
                    id="savingDeltaPercent"
                    label="اختلاف رشد پس‌انداز نسبت به رشد مسکن (٪)"
                    placeholder="مثلاً -۱۰ یا +۵"
                    helper="اگر فکر می‌کنید سرمایه‌گذاری شما از رشد مسکن عقب می‌ماند عدد منفی بدهید."
                    helper2="بازه پیشنهادی: از −۲۰٪ تا +۲۰٪"
                    value={inputs.savingDeltaPercent}
                    onChange={(v) => setField('savingDeltaPercent', v)}
                    onBlur={() => setField('savingDeltaPercent', formatPercentInputSigned(inputs.savingDeltaPercent))}
                    inputBg={inputBg}
                    border={border}
                    text={text}
                    muted={muted}
                  />
                </>
              )}

              <FieldPercent
                id="growthPercent"
                label="افزایش احتمالی توان پس‌انداز در آینده"
                placeholder="مثلاً ۱۰"
                helper="اگر فکر می‌کنید به مرور می‌توانید بیشتر پس‌انداز کنید، این عدد را وارد کنید."
                helper2="نتیجه، پیش‌بینی قطعی آینده نیست."
                value={inputs.growthPercent}
                onChange={(v) => setField('growthPercent', v)}
                onBlur={() => setField('growthPercent', formatPercentInput0to100(inputs.growthPercent))}
                inputBg={inputBg}
                border={border}
                text={text}
                muted={muted}
              />

              {warnings.length > 0 ? (
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {warnings.map((k) => (
                    <div
                      key={k}
                      style={{
                        borderRadius: 14,
                        padding: '10px 12px',
                        background: 'rgba(15,23,42,0.03)',
                        border: `1px solid ${border}`,
                        lineHeight: 1.8,
                        fontSize: 13,
                        color: muted,
                      }}
                    >
                      {WARNING_TEXT[k]}
                    </div>
                  ))}
                </div>
              ) : null}

              <div style={{ marginTop: 14 }}>
                <button
                  onClick={onCalculate}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 16,
                    border: `1px solid rgba(17,24,39,0.12)`,
                    background: btnBg,
                    color: btnText,
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {result ? 'محاسبه دوباره' : 'محاسبه'}
                </button>
              </div>
              </div>
            </section>
          ) : null}

          

          {toast ? (
            <div
              style={{
                position: 'fixed',
                left: 14,
                right: 14,
                bottom: 14,
                margin: '0 auto',
                maxWidth: 640,
                background: '#111827',
                color: '#fff',
                borderRadius: 14,
                padding: '10px 12px',
                fontWeight: 900,
                textAlign: 'center',
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              }}
            >
              {toast}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ---------------- UI blocks ---------------- */

function InlineHelpToggle(props: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  border: string;
  subtle: string;
}) {
  const { label, isOpen, onToggle, border, subtle } = props;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 14,
        border: `1px solid ${border}`,
        background: 'rgba(15,23,42,0.02)',
        cursor: 'pointer',
        marginBottom: 10,
        color: subtle,
        fontWeight: 900,
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 12 }}>{isOpen ? 'بستن' : 'نمایش'}</span>
    </button>
  );
}

function HelpBox(props: { children: React.ReactNode; border: string; muted: string }) {
  const { children, border, muted } = props;
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${border}`,
        background: 'rgba(15,23,42,0.03)',
        padding: '10px 12px',
        color: muted,
        fontSize: 12,
        lineHeight: 1.8,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Pill(props: { children: React.ReactNode; border: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${props.border}`,
        background: 'rgba(15,23,42,0.02)',
        fontWeight: 900,
      }}
    >
      {props.children}
    </span>
  );
}

function FieldMoney(props: {
  id: string;
  label: string;
  placeholder: string;
  helper: string;
  helper2?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  inputBg: string;
  border: string;
  text: string;
  muted: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const { id, label, placeholder, helper, helper2, value, onChange, onBlur, inputBg, border, text, muted, inputRef } =
    props;

  const helpId = `${id}-help`;
  const help2Id = helper2 ? `${id}-help2` : undefined;
  const describedBy = help2Id ? `${helpId} ${help2Id}` : helpId;

  return (
    <div style={{ marginBottom: 18 }}>
      <label
        htmlFor={id}
        style={{
          fontWeight: 800,
          marginBottom: 6,
          display: 'block',
          fontSize: 13,
          color: 'rgba(15,23,42,0.78)',
        }}
      >
        {label}
      </label>

      <input
        ref={inputRef}
        id={id}
        aria-label={label}
        aria-describedby={describedBy}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode="numeric"
        style={{
          width: '100%',
          borderRadius: 14,
          border: `1px solid ${border}`,
          background: inputBg,
          padding: '12px 12px',
          outline: 'none',
          color: text,
          fontSize: 16,
          fontWeight: 800,
        }}
      />

      <div id={helpId} style={{ marginTop: 6, color: 'rgba(15,23,42,0.60)', fontSize: 12, lineHeight: 1.7 }}>
        {helper}
      </div>

      {helper2 ? (
        <div id={help2Id} style={{ marginTop: 6, color: 'rgba(15,23,42,0.60)', fontSize: 12, lineHeight: 1.7 }}>
          {helper2}
        </div>
      ) : null}
    </div>
  );
}

function FieldPercent(props: {
  id: string;
  label: string;
  placeholder: string;
  helper: string;
  helper2?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  inputBg: string;
  border: string;
  text: string;
  muted: string;
}) {
  const { id, label, placeholder, helper, helper2, value, onChange, onBlur, inputBg, border, text, muted } = props;
  const helpId = `${id}-help`;
  const help2Id = helper2 ? `${id}-help2` : undefined;
  const describedBy = help2Id ? `${helpId} ${help2Id}` : helpId;

  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ fontWeight: 800, marginBottom: 6, display: 'block', fontSize: 13 }}>
        {label}
      </label>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          id={id}
          aria-label={label}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode="numeric"
          style={{
            width: '100%',
            borderRadius: 14,
            border: `1px solid ${border}`,
            background: inputBg,
            padding: '12px 12px',
            outline: 'none',
            color: text,
            fontSize: 16,
            fontWeight: 800,
          }}
        />
        <div style={{ fontWeight: 900, color: 'rgba(15,23,42,0.65)' }}>٪</div>
      </div>

      <div id={helpId} style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.7 }}>
        {helper}
      </div>
      {helper2 ? (
        <div id={help2Id} style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.7 }}>
          {helper2}
        </div>
      ) : null}
    </div>
  );
}

function FieldPercentSigned(props: {
  id: string;
  label: string;
  placeholder: string;
  helper: string;
  helper2?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  inputBg: string;
  border: string;
  text: string;
  muted: string;
}) {
  const { id, label, placeholder, helper, helper2, value, onChange, onBlur, inputBg, border, text, muted } = props;
  const helpId = `${id}-help`;
  const help2Id = helper2 ? `${id}-help2` : undefined;
  const describedBy = help2Id ? `${helpId} ${help2Id}` : helpId;

  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ fontWeight: 800, marginBottom: 6, display: 'block', fontSize: 13 }}>
        {label}
      </label>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          id={id}
          aria-label={label}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode="numeric"
          style={{
            width: '100%',
            borderRadius: 14,
            border: `1px solid ${border}`,
            background: inputBg,
            padding: '12px 12px',
            outline: 'none',
            color: text,
            fontSize: 16,
            fontWeight: 800,
          }}
        />
        <div style={{ fontWeight: 900, color: 'rgba(15,23,42,0.65)' }}>٪</div>
      </div>

      <div id={helpId} style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.7 }}>
        {helper}
      </div>
      {helper2 ? (
        <div id={help2Id} style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.7 }}>
          {helper2}
        </div>
      ) : null}
    </div>
  );
}

function FieldSelect(props: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  inputBg: string;
  border: string;
  text: string;
  muted: string;
}) {
  const { id, label, helper, value, onChange, options, inputBg, border, text, muted } = props;
  const helpId = `${id}-help`;

  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ fontWeight: 800, marginBottom: 6, display: 'block', fontSize: 13 }}>
        {label}
      </label>

      <select
        id={id}
        aria-label={label}
        aria-describedby={helpId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          borderRadius: 14,
          border: `1px solid ${border}`,
          background: inputBg,
          padding: '12px 12px',
          outline: 'none',
          color: text,
          fontSize: 16,
          fontWeight: 800,
          appearance: 'none',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div id={helpId} style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.7 }}>
        {helper}
      </div>
    </div>
  );
}

function MiniRow(props: { label: string; value: string; border: string }) {
  const { label, value, border } = props;
  return (
    <div
      style={{
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: '10px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Th(props: { children: React.ReactNode; border: string }) {
  return (
    <th
      style={{
        textAlign: 'right',
        padding: '10px 10px',
        borderTop: `1px solid ${props.border}`,
        borderBottom: `1px solid ${props.border}`,
        background: 'rgba(15,23,42,0.02)',
        fontWeight: 900,
      }}
    >
      {props.children}
    </th>
  );
}

function Td(props: { children: React.ReactNode; border: string }) {
  return (
    <td
      style={{
        textAlign: 'right',
        padding: '10px 10px',
        borderBottom: `1px solid ${props.border}`,
        fontWeight: 800,
      }}
    >
      {props.children}
    </td>
  );
}

// ------------------------------
// Test-only exports
// ------------------------------
export {
  toNumber,
  sanitizeNumericString,
  parseInputsFromSearchParams,
  buildShareQuery,
  formatResultFromMonths,
  simulateMonthByMonth,
  calculateV4,
  VERY_LONG_MONTHS_THRESHOLD,
  VERY_LONG_TEXT,
};