'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import Head from 'next/head';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ToolHeader from '../../components/ToolHeader';
import { Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

type InflationScenario = 'low' | 'base' | 'high' | 'custom';
type SavingScenario = 'bank' | 'value' | 'growth' | 'custom';

type Inputs = {
  price: string;
  currentSavings: string;
  monthlySaving: string;
  realizationPercent: string;
  inflationScenario: InflationScenario;
  inflationCustomPercent: string;
  savingScenario: SavingScenario;
  savingDeltaPercent: string;
  growthPercent: string;
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
  growth_gt_inflation: 'رشد توان پس‌انداز شما از تورم قیمت خانه بیشتر در نظر گرفته شده؛ این حالت برای اکثر افراد نادر است.',
  high_realization_high_growth: 'این ترکیب فرض می‌کند تقریباً همیشه و با رشد بالا پس‌انداز می‌کنید؛ نتیجه ممکن است خوش‌بینانه باشد.',
  optimistic_scenario: 'این سناریو خوش‌بینانه است؛ نتیجه ممکن است کمتر از واقعیت سختی مسیر را نشان دهد.',
  very_conservative: 'با این فرض‌ها، مدل بسیار محافظه‌کارانه است و ممکن است بدبینانه باشد.',
  monthly_saving_too_high: 'پس‌انداز شما نسبت به قیمت خانه بسیار بالا در نظر گرفته شده؛ مطمئن شوید عددها با واقعیت زندگی شما سازگارند.',
  very_long_horizon_possible: 'با این فرض‌ها، زمان خرید ممکن است بسیار طولانی شود.',
  asset_delta_too_negative: 'سناریوی پس‌انداز انتخابی شما نسبت به رشد مسکن «عقب‌مانده» است؛ نتیجه می‌تواند بسیار طولانی شود.',
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

const VERY_LONG_YEARS_THRESHOLD = 20;
const VERY_LONG_MONTHS_THRESHOLD = VERY_LONG_YEARS_THRESHOLD * 12;
const VERY_LONG_TEXT = 'با این فرض‌ها، زمان خرید خانه بسیار طولانی است.';

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

// --- Helpers ---
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
  return clamp(rawPct, -100, 200) / 100;
}

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

function parseInputsFromSearchParams(sp: URLSearchParams): Partial<Inputs> {
  const out: Partial<Inputs> = {};
  const inflationScenario = sp.get('inf');
  const savingScenario = sp.get('sav');
  if (inflationScenario && ['low', 'base', 'high', 'custom'].includes(inflationScenario)) {
    out.inflationScenario = inflationScenario as InflationScenario;
  }
  if (savingScenario && ['bank', 'value', 'growth', 'custom'].includes(savingScenario)) {
    out.savingScenario = savingScenario as SavingScenario;
  }
  const price = sp.get('p'), s0 = sp.get('s0'), m0 = sp.get('m0'), r = sp.get('r'), infc = sp.get('infc'), del = sp.get('del'), g = sp.get('g');
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
  if (inputs.inflationScenario === 'custom') qs.set('infc', sanitizeNumericString(inputs.inflationCustomPercent));
  qs.set('sav', inputs.savingScenario);
  if (inputs.savingScenario === 'custom') qs.set('del', sanitizeNumericString(inputs.savingDeltaPercent, { allowMinus: true }));
  if (inputs.growthPercent) qs.set('g', sanitizeNumericString(inputs.growthPercent));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function formatResultFromMonths(months: number): string {
  if (months <= 0) return 'همین الان';
  if (months < 12) return `حدود ${nfFa.format(months)} ماه`;
  if (months >= VERY_LONG_MONTHS_THRESHOLD) return VERY_LONG_TEXT;
  return `حدود ${nfFa.format(ceilDiv(months, 12))} سال`;
}

function buildWarnings(args: { P: number; M0: number; r01: number; inf01: number; g01: number; deltaPct: number; }): WarningKey[] {
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

function simulateMonthByMonth(params: { P: number; S0: number; M0: number; r01: number; inf01: number; g01: number; assetGrowth01: number; maxMonths: number; }): { monthsToReach: number | null; capped: boolean } {
  const { P, S0, M0, r01, inf01, g01, assetGrowth01, maxMonths } = params;
  let month = 0, housePrice = P, saving = S0, nominalMonthlySaving = M0;
  if (saving >= housePrice) return { monthsToReach: 0, capped: false };
  const inf_m = inf01 / 12, g_m = g01 / 12, asset_m = clamp(assetGrowth01 / 12, -0.95, 2);
  while (month < maxMonths) {
    saving *= (1 + asset_m);
    saving += nominalMonthlySaving * r01;
    housePrice *= (1 + inf_m);
    nominalMonthlySaving *= (1 + g_m);
    month++;
    if (saving >= housePrice) return { monthsToReach: month, capped: false };
  }
  return { monthsToReach: null, capped: true };
}

function calculateV4(params: { P: number; S0: number; M0: number; r01: number; inf01: number; g01: number; assetGrowth01: number; }): CalcResult {
  const { P, S0, M0, r01, inf01, g01, assetGrowth01 } = params;
  if (!(P > 0)) return { ok: false, error: 'قیمت فعلی خانه باید بیشتر از صفر باشد.' };
  const sim = simulateMonthByMonth({ P, S0, M0, r01, inf01, g01, assetGrowth01, maxMonths: 1200 });
  if (sim.capped || sim.monthsToReach === null) return { ok: true, months: 1200, display: VERY_LONG_TEXT, meta: { capped: true } };
  return { ok: true, months: sim.monthsToReach, display: formatResultFromMonths(sim.monthsToReach), meta: { capped: false } };
}

function buildAnnualDetails(params: any): any[] {
  const { P, S0, M0, r01, inf01, g01, assetGrowth01, yearsToShow } = params;
  let housePrice = P, saving = S0, nominalMonthlySaving = M0;
  const rows = [];
  const inf_m = inf01 / 12, g_m = g01 / 12, asset_m = clamp(assetGrowth01 / 12, -0.95, 2);
  for (let y = 1; y <= yearsToShow; y++) {
    for (let m = 0; m < 12; m++) {
      saving *= (1 + asset_m);
      saving += nominalMonthlySaving * r01;
      housePrice *= (1 + inf_m);
      nominalMonthlySaving *= (1 + g_m);
    }
    rows.push({ year: y, housePrice, savings: saving, gap: Math.max(0, housePrice - saving), reached: saving >= housePrice });
  }
  return rows;
}

function BuyHouseCalculatorInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);
  const [inputs, setInputs] = useState<Inputs>({ ...DEFAULT_INPUTS });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [inputsOpen, setInputsOpen] = useState(true);
  const [showInflationHelp, setShowInflationHelp] = useState(false);
  const [showDeltaHelp, setShowDeltaHelp] = useState(false);
  const [toast, setToast] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const fromUrl = parseInputsFromSearchParams(new URLSearchParams(searchParams.toString()));
    if (Object.keys(fromUrl).length > 0) setInputs((prev) => ({ ...prev, ...fromUrl }));
  }, [searchParams]);

  const parsed = useMemo(() => {
    const P = toNumber(inputs.price), S0 = toNumber(inputs.currentSavings), M0 = toNumber(inputs.monthlySaving);
    const r01 = pctTo01_0_100(toNumber(inputs.realizationPercent));
    const infPct = inputs.inflationScenario === 'custom' ? toNumber(inputs.inflationCustomPercent) : INFLATION_DEFAULTS[inputs.inflationScenario];
    const inf01 = pctTo01_0_100(infPct);
    const deltaPct = inputs.savingScenario === 'custom' ? toNumber(inputs.savingDeltaPercent) : SAVING_DELTA_DEFAULTS[inputs.savingScenario];
    const assetGrowthPct = infPct + deltaPct;
    return { P, S0, M0, r01, inf01, deltaPct, assetGrowth01: pctTo01_signed(assetGrowthPct), g01: pctTo01_0_100(toNumber(inputs.growthPercent)), infPct, assetGrowthPct, rPct: toNumber(inputs.realizationPercent), gPct: toNumber(inputs.growthPercent) };
  }, [inputs]);

  const warnings = useMemo(() => (parsed.P > 0 ? buildWarnings(parsed as any) : []), [parsed]);

  const onCalculate = () => {
    const res = calculateV4(parsed as any);
    setResult(res);
    if (res.ok) {
      setInputsOpen(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const annualDetails = useMemo(() => {
    if (!result || !result.ok || parsed.P <= 0) return [];
    const yearsToShow = result.display === VERY_LONG_TEXT ? 10 : Math.min(10, ceilDiv(result.months, 12));
    return buildAnnualDetails({ ...parsed, yearsToShow });
  }, [parsed, result]);

  return (
    <main dir="rtl" className={vazirmatn.className} style={{ minHeight: '100vh', background: '#F9FAFB', color: '#0F172A', padding: '20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {result && (
          <section ref={resultRef} style={{ background: '#FFF', padding: '20px', borderRadius: '18px', border: '1px solid #EEE', marginBottom: '20px' }}>
            {result.ok ? (
              <>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{result.display}</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>بر اساس فرضیات وارد شده.</p>
                <button onClick={() => setInputsOpen(true)} style={{ marginTop: '15px', padding: '10px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>ویرایش اطلاعات</button>
                <div style={{ marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ background: '#f9f9f9' }}>
                                <th style={{ padding: '8px', border: '1px solid #EEE' }}>سال</th>
                                <th style={{ padding: '8px', border: '1px solid #EEE' }}>قیمت خانه</th>
                                <th style={{ padding: '8px', border: '1px solid #EEE' }}>پس‌انداز</th>
                            </tr>
                        </thead>
                        <tbody>
                            {annualDetails.map((row: any) => (
                                <tr key={row.year}>
                                    <td style={{ padding: '8px', border: '1px solid #EEE' }}>{nfFa.format(row.year)}</td>
                                    <td style={{ padding: '8px', border: '1px solid #EEE' }}>{nfFa.format(Math.round(row.housePrice))}</td>
                                    <td style={{ padding: '8px', border: '1px solid #EEE' }}>{nfFa.format(Math.round(row.savings))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </>
            ) : <p style={{ color: 'red' }}>{result.error}</p>}
          </section>
        )}

        {(inputsOpen || !result) && (
          <section style={{ background: '#FFF', padding: '20px', borderRadius: '18px', border: '1px solid #EEE' }}>
            <ToolHeader icon={<Home />} title="چند سال دیگه می‌تونم خونه بخرم؟" subtitle="تخمین زمان خرید خانه" />
            <div style={{ marginTop: '20px' }}>
              <FieldMoney label="قیمت فعلی خانه" value={inputs.price} onChange={(v) => setInputs({...inputs, price: v})} onBlur={() => {}} placeholder="مثلا ۵,۰۰۰,۰۰۰,۰۰۰" id="p" helper="تومان" />
              <FieldMoney label="پس‌انداز فعلی" value={inputs.currentSavings} onChange={(v) => setInputs({...inputs, currentSavings: v})} onBlur={() => {}} placeholder="مثلا ۵۰۰,۰۰۰,۰۰۰" id="s0" helper="تومان" />
              <FieldMoney label="پس‌انداز ماهانه" value={inputs.monthlySaving} onChange={(v) => setInputs({...inputs, monthlySaving: v})} onBlur={() => {}} placeholder="مثلا ۲۰,۰۰۰,۰۰۰" id="m0" helper="تومان" />
              
              <button onClick={onCalculate} style={{ width: '100%', padding: '15px', background: '#111827', color: '#FFF', borderRadius: '12px', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                محاسبه زمان خرید
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// --- UI Components ---
function FieldMoney({ label, value, onChange, placeholder, helper }: any) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 700, marginBottom: '5px', fontSize: '14px' }}>{label}</label>
      <input 
        type="text" 
        value={formatMoneyInput(value)} 
        onChange={(e) => onChange(sanitizeNumericString(e.target.value))} 
        placeholder={placeholder}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DDD', outline: 'none' }}
      />
      <small style={{ color: '#888' }}>{helper}</small>
    </div>
  );
}

// --- Main Export ---
export default function Page() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <BuyHouseCalculatorInner />
    </Suspense>
  );
}