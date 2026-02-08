'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

type Inputs = {
  price: string; // P (toman)
  currentSavings: string; // S0 (toman)
  monthlySaving: string; // M0 (toman)
  realizationPercent: string; // r in %
  inflationPercent: string; // inf in %
  growthPercent: string; // g in %
};

type CalcResult =
  | { ok: true; months: number; display: string; meta: { capped: boolean } }
  | { ok: false, error: string };

type WarningKey =
  | 'growth_gt_inflation'
  | 'high_realization_high_growth'
  | 'very_conservative'
  | 'monthly_saving_too_high'
  | 'very_long_horizon_possible';

const WARNING_TEXT: Record<WarningKey, string> = {
  growth_gt_inflation:
    'رشد پس‌انداز شما از تورم قیمت خانه بیشتر در نظر گرفته شده؛ این حالت برای اکثر افراد نادر است.',
  high_realization_high_growth:
    'این ترکیب فرض می‌کند تقریباً همیشه و با رشد بالا پس‌انداز می‌کنید؛ نتیجه ممکن است خوش‌بینانه باشد.',
  very_conservative:
    'با این فرض‌ها، مدل بسیار محافظه‌کارانه است و ممکن است بدبینانه باشد.',
  monthly_saving_too_high:
    'پس‌انداز شما نسبت به قیمت خانه بسیار بالا در نظر گرفته شده؛ مطمئن شوید عددها با واقعیت زندگی شما سازگارند.',
  very_long_horizon_possible: 'با این فرض‌ها، زمان خرید ممکن است بسیار طولانی شود.',
};

const nfFa = new Intl.NumberFormat('fa-IR');

const DEFAULT_INPUTS: Inputs = {
  price: '',
  currentSavings: '',
  monthlySaving: '',
  realizationPercent: '80',
  inflationPercent: '30',
  growthPercent: '10',
};

// --- Policy: "Very long" threshold ---
const VERY_LONG_YEARS_THRESHOLD = 20;
const VERY_LONG_MONTHS_THRESHOLD = VERY_LONG_YEARS_THRESHOLD * 12;
const VERY_LONG_TEXT = 'با این فرض‌ها، زمان خرید خانه بسیار طولانی است.';

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

function safeParsePercent01(rawPct: number): number {
  return clamp(rawPct, 0, 100) / 100;
}

function isFiniteAll(...nums: number[]): boolean {
  return nums.every((n) => Number.isFinite(n));
}

// --- money formatting for inputs (3-digit separators) ---
function formatMoneyInput(raw: string): string {
  const n = toNumber(raw);
  if (!Number.isFinite(n)) return raw;
  return nfFa.format(Math.max(0, Math.floor(n)));
}

function formatPercentInput(raw: string): string {
  const n = toNumber(raw);
  if (!Number.isFinite(n)) return raw;
  return String(clamp(Math.round(n), 0, 100));
}

function formatToman(n: number): string {
  return `${nfFa.format(Math.round(n))} تومان`;
}

// --- Display rules (updated with 20-year threshold) ---
function formatResultFromMonths(months: number): string {
  if (months <= 0) return 'همین الان';
  if (months < 12) return `حدود ${nfFa.format(months)} ماه`;

  // If >= 20 years => very long
  if (months >= VERY_LONG_MONTHS_THRESHOLD) return VERY_LONG_TEXT;

  // Otherwise show years only (no months)
  return `حدود ${nfFa.format(ceilDiv(months, 12))} سال`;
}

// --- Warnings logic ---
function buildWarnings(args: {
  P: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
}): WarningKey[] {
  const { P, M0, r01, inf01, g01 } = args;
  const warnings: WarningKey[] = [];

  if (r01 >= 0.9 && g01 >= 0.2) warnings.push('high_realization_high_growth');
  if (g01 > inf01) warnings.push('growth_gt_inflation');
  if (r01 <= 0.4 && g01 === 0) warnings.push('very_conservative');
  if (M0 > 0 && P > 0 && M0 * 12 > 0.5 * P) warnings.push('monthly_saving_too_high');
  if (r01 < 0.2 && g01 === 0 && inf01 >= 0.3) warnings.push('very_long_horizon_possible');

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
  maxMonths: number;
}): { monthsToReach: number | null; capped: boolean } {
  const { P, S0, M0, r01, inf01, g01, maxMonths } = params;

  let month = 0;
  let housePrice = P;
  let saving = S0;
  let nominalMonthlySaving = M0;

  if (saving >= housePrice) return { monthsToReach: 0, capped: false };

  const inf_m = inf01 / 12;
  const g_m = g01 / 12;

  while (month < maxMonths) {
    saving += nominalMonthlySaving * r01;
    housePrice *= 1 + inf_m;
    nominalMonthlySaving *= 1 + g_m;

    month += 1;

    if (saving >= housePrice) {
      return { monthsToReach: month, capped: false };
    }
  }

  return { monthsToReach: null, capped: true };
}

function calculateV3(params: {
  P: number;
  S0: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
}): CalcResult {
  const { P, S0, M0, r01, inf01, g01 } = params;

  // Validation (locked: P>0, others >=0)
  if (!(P > 0)) return { ok: false, error: 'قیمت فعلی خانه باید بیشتر از صفر باشد.' };
  if (!(S0 >= 0)) return { ok: false, error: 'پس‌انداز فعلی نمی‌تواند منفی باشد.' };
  if (!(M0 >= 0)) return { ok: false, error: 'پس‌انداز ماهانه نمی‌تواند منفی باشد.' };

  if (!(r01 >= 0 && r01 <= 1)) return { ok: false, error: 'درصد تحقق باید بین ۰ تا ۱۰۰ باشد.' };
  if (!(inf01 >= 0 && inf01 <= 1)) return { ok: false, error: 'تورم سالانه باید بین ۰ تا ۱۰۰ باشد.' };
  if (!(g01 >= 0 && g01 <= 1)) return { ok: false, error: 'رشد سالانه باید بین ۰ تا ۱۰۰ باشد.' };

  const MAX_MONTHS = 1200; // hard safety cap (100 years)
  const sim = simulateMonthByMonth({ P, S0, M0, r01, inf01, g01, maxMonths: MAX_MONTHS });

  // If capped (didn't reach in 100 years)
  if (sim.capped || sim.monthsToReach === null) {
    return { ok: true, months: MAX_MONTHS, display: VERY_LONG_TEXT, meta: { capped: true } };
  }

  const months = sim.monthsToReach;
  const display = formatResultFromMonths(months);

  // If reached but beyond 20-year threshold, still show "very long"
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
};

function buildAnnualDetails(params: {
  P: number;
  S0: number;
  M0: number;
  r01: number;
  inf01: number;
  g01: number;
  yearsToShow: number; // e.g. 10
}): AnnualRow[] {
  const { P, S0, M0, r01, inf01, g01, yearsToShow } = params;

  const inf_m = inf01 / 12;
  const g_m = g01 / 12;

  let housePrice = P;
  let saving = S0;
  let nominalMonthlySaving = M0;

  const rows: AnnualRow[] = [];

  for (let y = 1; y <= yearsToShow; y++) {
    for (let m = 0; m < 12; m++) {
      saving += nominalMonthlySaving * r01;
      housePrice *= 1 + inf_m;
      nominalMonthlySaving *= 1 + g_m;
    }

    rows.push({
      year: y,
      housePrice,
      savings: saving,
      gap: Math.max(0, housePrice - saving),
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
  infPct: number;
  gPct: number;
}): string {
  const { display, priceToman, s0Toman, m0Toman, rPct, infPct, gPct } = args;

  const footer = 'این نتیجه بر اساس فرض‌های واردشده محاسبه شده و پیش‌بینی قطعی آینده نیست.';

  return [
    `نتیجه: ${display}`,
    `قیمت خانه: ${nfFa.format(priceToman)} تومان`,
    `پس‌انداز فعلی: ${nfFa.format(s0Toman)} تومان`,
    `پس‌انداز ماهانه: ${nfFa.format(m0Toman)} تومان`,
    `تحقق پس‌انداز: ${nfFa.format(rPct)}٪`,
    `تورم قیمت خانه: ${nfFa.format(infPct)}٪`,
    `رشد توان پس‌انداز: ${nfFa.format(gPct)}٪`,
    '',
    footer,
  ].join('\n');
}

// --- UI presets for Edge Cases (DEV only) ---
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
      price: '10000000000000',
      currentSavings: '1',
      monthlySaving: '1',
      realizationPercent: '80',
      inflationPercent: '30',
      growthPercent: '10',
    },
  },
  {
    id: 'edge_zero_monthly',
    title: 'پس‌انداز ماهانه صفر',
    note: 'اگر پس‌انداز فعلی کافی نباشد، خروجی باید «خیلی طولانی» شود.',
    values: {
      price: '3500000000',
      currentSavings: '400000000',
      monthlySaving: '0',
      realizationPercent: '80',
      inflationPercent: '30',
      growthPercent: '10',
    },
  },
  {
    id: 'edge_already_enough',
    title: 'پس‌انداز فعلی کافی',
    note: 'خروجی باید «همین الان» باشد.',
    values: {
      price: '3500000000',
      currentSavings: '4000000000',
      monthlySaving: '0',
      realizationPercent: '80',
      inflationPercent: '30',
      growthPercent: '10',
    },
  },
];

export default function BuyHouseCalculatorPage() {
  const IS_DEV = process.env.NODE_ENV !== 'production';

  // Edge Case panel: dev-only + user toggle
  const [showEdgeCases, setShowEdgeCases] = useState<boolean>(IS_DEV);

  const [inputs, setInputs] = useState<Inputs>({ ...DEFAULT_INPUTS });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [toast, setToast] = useState<string>('');

  const topRef = useRef<HTMLDivElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);

  const parsed = useMemo(() => {
    const P = toNumber(inputs.price);
    const S0 = toNumber(inputs.currentSavings);
    const M0 = toNumber(inputs.monthlySaving);

    const rPct = toNumber(inputs.realizationPercent);
    const infPct = toNumber(inputs.inflationPercent);
    const gPct = toNumber(inputs.growthPercent);

    const r01 = safeParsePercent01(rPct);
    const inf01 = safeParsePercent01(infPct);
    const g01 = safeParsePercent01(gPct);

    return { P, S0, M0, rPct, infPct, gPct, r01, inf01, g01 };
  }, [inputs]);

  const warnings = useMemo(() => {
    const { P, M0, r01, inf01, g01 } = parsed;
    if (!isFiniteAll(P, M0, r01, inf01, g01)) return [];
    if (!(P > 0)) return [];
    return buildWarnings({ P, M0, r01, inf01, g01 });
  }, [parsed]);

  const annualDetails = useMemo(() => {
    const { P, S0, M0, r01, inf01, g01 } = parsed;
    if (!isFiniteAll(P, S0, M0, r01, inf01, g01)) return [];
    if (!(P > 0)) return [];

    // show up to 10 years always (trust snapshot)
    return buildAnnualDetails({
      P,
      S0,
      M0,
      r01,
      inf01,
      g01,
      yearsToShow: 10,
    });
  }, [parsed]);

  const resultShareText = useMemo(() => {
    if (!result || !result.ok) return '';
    const { P, S0, M0, rPct, infPct, gPct } = parsed;
    if (!isFiniteAll(P, S0, M0, rPct, infPct, gPct)) return '';
    return buildShareText({
      display: result.display,
      priceToman: P,
      s0Toman: S0,
      m0Toman: M0,
      rPct: clamp(rPct, 0, 100),
      infPct: clamp(infPct, 0, 100),
      gPct: clamp(gPct, 0, 100),
    });
  }, [parsed, result]);

  function setField<K extends keyof Inputs>(key: K, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1600);
  }

  function onCalculate() {
    const { P, S0, M0, r01, inf01, g01 } = parsed;

    if ([P, S0, M0, r01, inf01, g01].some((x) => Number.isNaN(x))) {
      setResult({ ok: false, error: 'لطفاً فقط عدد وارد کنید.' });
      return;
    }

    setResult(calculateV3({ P, S0, M0, r01, inf01, g01 }));
  }

  function onEditInputs() {
    setResult(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => priceInputRef.current?.focus(), 250);
    showToast('می‌تونی ورودی‌ها رو تغییر بدی');
  }

  function onResetAll() {
    setInputs({ ...DEFAULT_INPUTS });
    setResult(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => priceInputRef.current?.focus(), 250);
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

  async function onShare() {
    if (!result || !result.ok || !resultShareText) return;
    try {
      const canShare = typeof navigator !== 'undefined' && (navigator as any).share;
      if (canShare) {
        await (navigator as any).share({ text: resultShareText });
        return;
      }
      await navigator.clipboard.writeText(resultShareText);
      showToast('کپی شد (اشتراک‌گذاری پشتیبانی نشد)');
    } catch {
      showToast('اشتراک‌گذاری انجام نشد');
    }
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setInputs(p.values);
    setResult(null);
    showToast('سناریو اعمال شد');
  }

  // --- Light theme tokens ---
  const bg = '#F6F7FB';
  const panel = '#FFFFFF';
  const border = 'rgba(15, 23, 42, 0.10)';
  const text = '#0F172A';
  const muted = 'rgba(15, 23, 42, 0.78)';
  const subtle = 'rgba(15, 23, 42, 0.60)';
  const inputBg = 'rgba(15, 23, 42, 0.04)';
  const btnBg = '#111827';
  const btnText = '#FFFFFF';
  const btnGhostBg = 'rgba(15, 23, 42, 0.06)';

  const effectiveMonthlySaving = useMemo(() => {
    const m = toNumber(inputs.monthlySaving);
    const r = toNumber(inputs.realizationPercent);
    if (!Number.isFinite(m) || !Number.isFinite(r)) return 0;
    return Math.max(0, m) * safeParsePercent01(r);
  }, [inputs.monthlySaving, inputs.realizationPercent]);

  const reachYearCeil = useMemo(() => {
    if (!result || !result.ok) return null;
    if (result.display === VERY_LONG_TEXT) return null;
    if (result.months <= 0) return 0;
    return ceilDiv(result.months, 12);
  }, [result]);

  return (
    <main dir="rtl" className={vazirmatn.className} style={{ minHeight: '100vh', background: bg, color: text }}>
      <div ref={topRef} style={{ maxWidth: 560, margin: '0 auto', padding: '18px 14px 28px' }}>
        {/* Header */}
        <header style={{ marginBottom: 14, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h1 style={{ fontSize: 20, margin: 0, fontWeight: 900, lineHeight: 1.25 }}>ماشین‌حساب خرید خانه</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {IS_DEV ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: subtle }}>
                  <input type="checkbox" checked={showEdgeCases} onChange={(e) => setShowEdgeCases(e.target.checked)} />
                  نمایش Edge Case
                </label>
              ) : null}

              <span
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: `1px solid ${border}`,
                  background: 'rgba(15,23,42,0.04)',
                  color: subtle,
                  whiteSpace: 'nowrap',
                }}
              >
                نسخه ۳
              </span>
            </div>
          </div>

          <p style={{ margin: '8px 0 0', color: muted, lineHeight: 1.85, fontSize: 13 }}>
            نتیجه تقریبی است و بر اساس فرض‌های شما محاسبه می‌شود (آستانه‌ی «خیلی طولانی» = {nfFa.format(VERY_LONG_YEARS_THRESHOLD)} سال).
          </p>
        </header>

        {/* Form */}
        <section
          style={{
            background: panel,
            border: `1px solid ${border}`,
            borderRadius: 18,
            padding: 14,
            boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
          }}
        >
          <FieldMoney
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
            label="در عمل چند٪ از این مبلغ را می‌توانید پس‌انداز کنید؟"
            placeholder="مثلاً ۸۰"
            helper="اگر بعضی ماه‌ها کمتر/هیچ پس‌انداز نمی‌کنید، این درصد را پایین‌تر بگذارید."
            helper2="این درصد روی «پس‌انداز مؤثر ماهانه» اثر می‌گذارد."
            value={inputs.realizationPercent}
            onChange={(v) => setField('realizationPercent', v)}
            onBlur={() => setField('realizationPercent', formatPercentInput(inputs.realizationPercent))}
            inputBg={inputBg}
            border={border}
            text={text}
            muted={muted}
          />

          <FieldPercent
            label="تورم سالانه قیمت خانه"
            placeholder="مثلاً ۳۰"
            helper="حدس شما از رشد سالانه قیمت خانه در آینده."
            value={inputs.inflationPercent}
            onChange={(v) => setField('inflationPercent', v)}
            onBlur={() => setField('inflationPercent', formatPercentInput(inputs.inflationPercent))}
            inputBg={inputBg}
            border={border}
            text={text}
            muted={muted}
          />

          <FieldPercent
            label="افزایش احتمالی توان پس‌انداز در آینده"
            placeholder="مثلاً ۱۰"
            helper="اگر فکر می‌کنید به مرور می‌توانید بیشتر پس‌انداز کنید، این عدد را وارد کنید."
            helper2="نمایش سالانه است؛ نتیجه، پیش‌بینی قطعی آینده نیست."
            value={inputs.growthPercent}
            onChange={(v) => setField('growthPercent', v)}
            onBlur={() => setField('growthPercent', formatPercentInput(inputs.growthPercent))}
            inputBg={inputBg}
            border={border}
            text={text}
            muted={muted}
          />

          {/* Warnings */}
          {warnings.length > 0 && (
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {warnings.map((k) => (
                <div
                  key={k}
                  style={{
                    borderRadius: 14,
                    padding: '10px 12px',
                    background: 'rgba(15,23,42,0.04)',
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
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 12 }}>
            <button
              onClick={onCalculate}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 16,
                border: `1px solid rgba(17,24,39,0.12)`,
                background: btnBg,
                color: btnText,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              محاسبه
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={onCopy}
                disabled={!result || !result.ok}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 16,
                  border: `1px solid ${border}`,
                  background: btnGhostBg,
                  color: text,
                  fontWeight: 800,
                  cursor: !result || !result.ok ? 'not-allowed' : 'pointer',
                  opacity: !result || !result.ok ? 0.55 : 1,
                }}
              >
                کپی نتیجه
              </button>

              <button
                onClick={onShare}
                disabled={!result || !result.ok}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 16,
                  border: `1px solid ${border}`,
                  background: btnGhostBg,
                  color: text,
                  fontWeight: 800,
                  cursor: !result || !result.ok ? 'not-allowed' : 'pointer',
                  opacity: !result || !result.ok ? 0.55 : 1,
                }}
              >
                اشتراک‌گذاری
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={onEditInputs}
                disabled={!result}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 16,
                  border: `1px solid ${border}`,
                  background: 'rgba(15,23,42,0.03)',
                  color: text,
                  fontWeight: 800,
                  cursor: !result ? 'not-allowed' : 'pointer',
                  opacity: !result ? 0.55 : 1,
                }}
              >
                ویرایش ورودی‌ها
              </button>

              <button
                onClick={onResetAll}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 16,
                  border: `1px solid ${border}`,
                  background: 'rgba(15,23,42,0.03)',
                  color: text,
                  fontWeight: 800,
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
        </section>

        {/* Result */}
        <section style={{ marginTop: 12 }}>
          {result && (
            <div
              style={{
                background: panel,
                border: `1px solid ${border}`,
                borderRadius: 18,
                padding: 14,
              }}
            >
              {result.ok ? (
                <>
                  <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.35, textAlign: 'right' }}>
                    {result.display}
                  </div>

                  <div style={{ marginTop: 6, color: muted, lineHeight: 1.85, textAlign: 'right' }}>
                    اگر شرایط فعلی و فرض‌های شما تغییر نکند.
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: subtle, lineHeight: 1.8, textAlign: 'right' }}>
                    این نتیجه بر اساس فرض‌های واردشده محاسبه شده و پیش‌بینی قطعی آینده نیست.
                  </div>

                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    <MiniRow label="قیمت فعلی خانه" value={formatToman(parsed.P || 0)} border={border} />
                    <MiniRow label="پس‌انداز فعلی" value={formatToman(parsed.S0 || 0)} border={border} />
                    <MiniRow label="پس‌انداز ماهانه" value={formatToman(parsed.M0 || 0)} border={border} />
                    <MiniRow label="پس‌انداز مؤثر ماهانه" value={formatToman(effectiveMonthlySaving)} border={border} />
                  </div>

                  {/* Annual details (expandable) */}
                  <div style={{ marginTop: 12 }}>
                    <details
                      style={{
                        border: `1px solid ${border}`,
                        borderRadius: 16,
                        background: 'rgba(15,23,42,0.02)',
                        padding: '10px 12px',
                      }}
                    >
                      <summary style={{ cursor: 'pointer', fontWeight: 900 }}>
                        جزئیات محاسبه (سالانه، تقریبی)
                      </summary>

                      <div style={{ marginTop: 10, color: muted, fontSize: 13, lineHeight: 1.9 }}>
                        <div>تورم سالانه قیمت خانه: <b>{nfFa.format(clamp(parsed.infPct || 0, 0, 100))}٪</b></div>
                        <div>رشد سالانه توان پس‌انداز: <b>{nfFa.format(clamp(parsed.gPct || 0, 0, 100))}٪</b></div>
                        <div>تحقق پس‌انداز: <b>{nfFa.format(clamp(parsed.rPct || 0, 0, 100))}٪</b></div>

                        {reachYearCeil !== null ? (
                          <div style={{ marginTop: 8, color: subtle }}>
                            هدف به‌صورت تقریبی در <b>سال {nfFa.format(reachYearCeil)}</b> قابل دستیابی می‌شود.
                          </div>
                        ) : (
                          <div style={{ marginTop: 8, color: subtle }}>
                            جدول زیر فقط «۱۰ سال اول» را نشان می‌دهد تا مسیر رشد روشن شود.
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 10, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                          <thead>
                            <tr>
                              <Th border={border}>سال</Th>
                              <Th border={border}>قیمت خانه</Th>
                              <Th border={border}>پس‌انداز کل</Th>
                              <Th border={border}>فاصله</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {annualDetails.map((row) => (
                              <tr key={row.year}>
                                <Td border={border}>{nfFa.format(row.year)}</Td>
                                <Td border={border}>{formatToman(row.housePrice)}</Td>
                                <Td border={border}>{formatToman(row.savings)}</Td>
                                <Td border={border}>{formatToman(row.gap)}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: 10, fontSize: 12, color: subtle, lineHeight: 1.8 }}>
                        نکته: محاسبات داخلی ماه‌به‌ماه انجام می‌شود، اما این گزارش برای جلوگیری از دقت کاذب، سالانه و گرد شده نمایش داده شده است.
                      </div>
                    </details>
                  </div>
                </>
              ) : (
                <div style={{ lineHeight: 1.9, textAlign: 'right' }}>
                  <strong style={{ fontWeight: 900 }}>خطا:</strong> {result.error}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Edge Cases (DEV ONLY + user toggle) */}
        {IS_DEV && showEdgeCases ? (
          <section style={{ marginTop: 12 }}>
            <div
              style={{
                background: panel,
                border: `1px solid ${border}`,
                borderRadius: 18,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 900, textAlign: 'right' }}>تست Edge Case</div>
                <div style={{ fontSize: 12, color: subtle }}>فقط محیط توسعه</div>
              </div>

              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    style={{
                      textAlign: 'right',
                      padding: '12px 12px',
                      borderRadius: 16,
                      border: `1px solid ${border}`,
                      background: 'rgba(15,23,42,0.03)',
                      color: text,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 900, lineHeight: 1.4 }}>{p.title}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: subtle, lineHeight: 1.7 }}>{p.note}</div>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: subtle, lineHeight: 1.7, textAlign: 'right' }}>
                نکته: این سناریوها فقط برای تست رفتار سیستم هستند و توصیه مالی محسوب نمی‌شوند.
              </div>
            </div>
          </section>
        ) : null}

        {/* Toast */}
        {toast ? (
          <div
            style={{
              position: 'fixed',
              left: 14,
              right: 14,
              bottom: 14,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'none',
                maxWidth: 560,
                width: '100%',
                borderRadius: 16,
                padding: '10px 12px',
                border: `1px solid ${border}`,
                background: 'rgba(17,24,39,0.92)',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {toast}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Th(props: { children: React.ReactNode; border: string }) {
  return (
    <th
      style={{
        padding: '10px 10px',
        textAlign: 'right',
        fontSize: 12,
        fontWeight: 900,
        color: 'rgba(15, 23, 42, 0.75)',
        borderBottom: `1px solid ${props.border}`,
        whiteSpace: 'nowrap',
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
        padding: '10px 10px',
        textAlign: 'right',
        fontSize: 13,
        borderBottom: `1px solid ${props.border}`,
        whiteSpace: 'nowrap',
        color: '#0F172A',
      }}
    >
      {props.children}
    </td>
  );
}

function MiniRow(props: { label: string; value: string; border: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 14,
        border: `1px solid ${props.border}`,
        background: 'rgba(15,23,42,0.03)',
      }}
    >
      <div style={{ opacity: 0.9 }}>{props.label}</div>
      <div style={{ fontWeight: 900 }}>{props.value}</div>
    </div>
  );
}

function FieldMoney(props: {
  label: string;
  placeholder: string;
  helper: string;
  helper2?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  inputBg: string;
  border: string;
  text: string;
  muted: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const { label, placeholder, helper, helper2, value, onChange, onBlur, inputBg, border, text, muted, inputRef } =
    props;

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 14, fontWeight: 900, textAlign: 'right', display: 'block' }}>{label}</label>

      <div style={{ position: 'relative', marginTop: 6 }}>
        <input
          ref={inputRef}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 12px',
            paddingLeft: 86,
            borderRadius: 16,
            border: `1px solid ${border}`,
            background: inputBg,
            color: text,
            outline: 'none',
            fontSize: 14,
            textAlign: 'right',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12,
            color: muted,
            border: `1px solid ${border}`,
            background: 'rgba(15,23,42,0.03)',
            padding: '4px 10px',
            borderRadius: 999,
            pointerEvents: 'none',
          }}
        >
          تومان
        </div>
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: muted, lineHeight: 1.7, textAlign: 'right' }}>{helper}</div>
      {helper2 ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(15,23,42,0.60)', lineHeight: 1.7, textAlign: 'right' }}>
          {helper2}
        </div>
      ) : null}
    </div>
  );
}

function FieldPercent(props: {
  label: string;
  placeholder: string;
  helper: string;
  helper2?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  inputBg: string;
  border: string;
  text: string;
  muted: string;
}) {
  const { label, placeholder, helper, helper2, value, onChange, onBlur, inputBg, border, text, muted } = props;

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 14, fontWeight: 900, textAlign: 'right', display: 'block' }}>{label}</label>

      <div style={{ position: 'relative', marginTop: 6 }}>
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 12px',
            paddingLeft: 60,
            borderRadius: 16,
            border: `1px solid ${border}`,
            background: inputBg,
            color: text,
            outline: 'none',
            fontSize: 14,
            textAlign: 'right',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12,
            color: muted,
            border: `1px solid ${border}`,
            background: 'rgba(15,23,42,0.03)',
            padding: '4px 10px',
            borderRadius: 999,
            pointerEvents: 'none',
          }}
        >
          ٪
        </div>
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: muted, lineHeight: 1.7, textAlign: 'right' }}>{helper}</div>
      {helper2 ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(15,23,42,0.60)', lineHeight: 1.7, textAlign: 'right' }}>
          {helper2}
        </div>
      ) : null}
    </div>
  );
}
