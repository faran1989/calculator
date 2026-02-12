'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
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

const VERY_LONG_MONTHS_THRESHOLD = 20 * 12;
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

function pctTo01_0_100(rawPct: number): number {
  return clamp(rawPct, 0, 100) / 100;
}

function pctTo01_signed(rawPct: number): number {
  return clamp(rawPct, -100, 200) / 100;
}

function formatMoneyInput(raw: string): string {
  const n = toNumber(raw);
  if (!Number.isFinite(n) || n === 0) return raw;
  return nfFa.format(Math.max(0, Math.floor(n)));
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
  const inf = sp.get('inf');
  const sav = sp.get('sav');
  if (inf && ['low', 'base', 'high', 'custom'].includes(inf)) out.inflationScenario = inf as InflationScenario;
  if (sav && ['bank', 'value', 'growth', 'custom'].includes(sav)) out.savingScenario = sav as SavingScenario;
  
  const p = sp.get('p'), s0 = sp.get('s0'), m0 = sp.get('m0'), r = sp.get('r');
  if (p) out.price = sanitizeNumericString(p);
  if (s0) out.currentSavings = sanitizeNumericString(s0);
  if (m0) out.monthlySaving = sanitizeNumericString(m0);
  if (r) out.realizationPercent = sanitizeNumericString(r);
  return out;
}

function formatResultFromMonths(months: number): string {
  if (months <= 0) return 'همین الان';
  if (months < 12) return `حدود ${nfFa.format(months)} ماه`;
  if (months >= VERY_LONG_MONTHS_THRESHOLD) return VERY_LONG_TEXT;
  return `حدود ${nfFa.format(ceilDiv(months, 12))} سال`;
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

function BuyHouseCalculatorInner() {
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);
  const [inputs, setInputs] = useState<Inputs>({ ...DEFAULT_INPUTS });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [inputsOpen, setInputsOpen] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

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
    return { P, S0, M0, r01, inf01, assetGrowth01: pctTo01_signed(assetGrowthPct), g01: pctTo01_0_100(toNumber(inputs.growthPercent)) };
  }, [inputs]);

  const onCalculate = () => {
    if (!(parsed.P > 0)) {
        setResult({ ok: false, error: 'قیمت فعلی خانه را وارد کنید.' });
        return;
    }
    const sim = simulateMonthByMonth({ ...parsed, maxMonths: 1200 });
    const res: CalcResult = sim.monthsToReach === null 
        ? { ok: true, months: 1200, display: VERY_LONG_TEXT, meta: { capped: true } }
        : { ok: true, months: sim.monthsToReach, display: formatResultFromMonths(sim.monthsToReach), meta: { capped: false } };
    
    setResult(res);
    setInputsOpen(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <main dir="rtl" className={vazirmatn.className} style={{ minHeight: '100vh', background: '#F9FAFB', color: '#0F172A', padding: '20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {result && (
          <section ref={resultRef} style={{ background: '#FFF', padding: '20px', borderRadius: '18px', border: '1px solid #EEE', marginBottom: '20px' }}>
            {result.ok ? (
              <>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{result.display}</h2>
                <button onClick={() => setInputsOpen(true)} style={{ marginTop: '15px', padding: '10px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>ویرایش اطلاعات</button>
              </>
            ) : <p style={{ color: 'red' }}>{result.error}</p>}
          </section>
        )}

        {(inputsOpen || !result) && (
          <section style={{ background: '#FFF', padding: '20px', borderRadius: '18px', border: '1px solid #EEE' }}>
            <ToolHeader icon={<Home />} title="چند سال دیگه می‌تونم خونه بخرم؟" subtitle="تخمین زمان خرید خانه" />
            <div style={{ marginTop: '20px' }}>
              <FieldMoney label="قیمت فعلی خانه" value={inputs.price} onChange={(v: string) => setInputs({...inputs, price: v})} placeholder="مثلا ۵,۰۰۰,۰۰۰,۰۰۰" helper="تومان" />
              <FieldMoney label="پس‌انداز فعلی" value={inputs.currentSavings} onChange={(v: string) => setInputs({...inputs, currentSavings: v})} placeholder="مثلا ۵۰۰,۰۰۰,۰۰۰" helper="تومان" />
              <FieldMoney label="پس‌انداز ماهانه" value={inputs.monthlySaving} onChange={(v: string) => setInputs({...inputs, monthlySaving: v})} placeholder="مثلا ۲۰,۰۰۰,۰۰۰" helper="تومان" />
              
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

interface FieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    helper: string;
}

function FieldMoney({ label, value, onChange, placeholder, helper }: FieldProps) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 700, marginBottom: '5px', fontSize: '14px' }}>{label}</label>
      <input 
        type="text" 
        value={formatMoneyInput(value)} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(sanitizeNumericString(e.target.value))} 
        placeholder={placeholder}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DDD', outline: 'none' }}
      />
      <small style={{ color: '#888' }}>{helper}</small>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <BuyHouseCalculatorInner />
    </Suspense>
  );
}