'use client';

// app/(public)/tools/loan/LoanForm.tsx
// فقط فرم + نتایج + مقایسه سناریوها — بدون هدر، فوتر، تب، یا کانتینر تیره

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, RotateCcw, CheckCircle2, Wallet,
  TrendingUp, Table as TableIcon, CreditCard,
  AlertCircle, ChevronDown, ChevronUp, Info,
  GitCompare, Plus, X, Crown,
} from 'lucide-react';
import { toolConfig } from './tool.config';
import { saveToolRun } from '@/lib/toolRun/client';

/* ─── Types ─── */
type LoanType     = { id: string; name: string; defaultRate: number; defaultYears: number; isGharz: boolean };
type DurationType = 'month' | 'year';
type GharzMethod  = 'annual-first' | 'monthly';
type ScheduleRow  = { month: number; startBalance: number; interest: number; principal: number; payment: number; endBalance: number; isFeeMonth: boolean };
type LoanResult   = { schedule: ScheduleRow[]; totalInterest: number; totalPayment: number; monthlyAverage: number; realRate: number };

type Scenario = {
  id: number;
  label: string;
  loanTypeName: string;
  isGharz: boolean;
  amount: number;
  rate: number;
  months: number;
  result: LoanResult;
};

const LOAN_TYPES: LoanType[] = [
  { id: 'gharz',      name: 'قرض‌الحسنه',    defaultRate: 4,  defaultYears: 10, isGharz: true  },
  { id: 'moshavereh', name: 'مضاربه/مشارکت', defaultRate: 23, defaultYears: 1,  isGharz: false },
  { id: 'maskan',     name: 'مسکن',           defaultRate: 18, defaultYears: 20, isGharz: false },
  { id: 'shakhsi',    name: 'شخصی/نقدی',      defaultRate: 23, defaultYears: 5,  isGharz: false },
  { id: 'custom',     name: 'سایر (دستی)',     defaultRate: 0,  defaultYears: 1,  isGharz: false },
];

/* ─── Helpers ─── */
const clampNonNegative     = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);
const toPersianDigits      = (n: number | string) => String(n).replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[Number(x)] ?? x);
const formatCurrency       = (val: number) => toPersianDigits(new Intl.NumberFormat('fa-IR').format(Math.round(Number.isFinite(val) ? val : 0)));

const normalizeNumericString = (input: string) => {
  const fa = '۰۱۲۳۴۵۶۷۸۹', ar = '٠١٢٣٤٥٦٧٨٩';
  let s = (input ?? '').toString();
  for (let i = 0; i < 10; i++) { s = s.replaceAll(fa[i], String(i)); s = s.replaceAll(ar[i], String(i)); }
  s = s.replaceAll('٬','').replaceAll('،','').replaceAll(',','').replaceAll(' ','').replaceAll('٫','.');
  const parts = s.split('.'); if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
  return s;
};

const parseNumberSafe    = (value: string) => { const v = normalizeNumericString((value ?? '').trim()); if (!v) return 0; const num = Number(v); return Number.isFinite(num) ? num : 0; };
const formatAmountInput  = (raw: string) => { const norm = normalizeNumericString(raw); const digitsOnly = norm.replace(/[^\d]/g, ''); if (!digitsOnly) return ''; const n = Number(digitsOnly); if (!Number.isFinite(n) || n <= 0) return toPersianDigits(digitsOnly); return toPersianDigits(new Intl.NumberFormat('fa-IR').format(n)); };
const keepNumericPersian = (raw: string, allowDecimal: boolean) => { const norm = normalizeNumericString(raw); if (!norm) return ''; if (allowDecimal) { let c = norm.replace(/[^\d.]/g, ''); const p = c.split('.'); if (p.length > 2) c = p[0] + '.' + p.slice(1).join(''); return toPersianDigits(c); } return toPersianDigits(norm.replace(/[^\d]/g, '')); };
const selectAllOnFocus   = (e: React.FocusEvent<HTMLInputElement>) => requestAnimationFrame(() => { try { e.target.select(); } catch {} });

/* ─── Calculation ─── */
const calculateLoan = (amount: number, annualRate: number, months: number, isGharz: boolean, gharzMethod: GharzMethod = 'annual-first'): LoanResult => {
  const schedule: ScheduleRow[] = []; let totalInterest = 0, totalPayment = 0;
  const A = clampNonNegative(amount), M = Math.max(1, Math.floor(months)), R = Number.isFinite(annualRate) ? annualRate : 0;
  if (isGharz) {
    if (gharzMethod === 'annual-first') {
      let bal = A; const totalYears = Math.ceil(M / 12), feeCnt = totalYears, principalCnt = M - feeCnt;
      if (principalCnt <= 0) return calculateLoan(A, R, M, isGharz, 'monthly');
      const mp = A / principalCnt;
      for (let i = 1; i <= M; i++) {
        let mi = 0, mpp = 0, fee = false;
        if ((i - 1) % 12 === 0) { fee = true; mi = bal * (R / 100); } else { mpp = mp; if (i === M || bal - mpp < 1) mpp = bal; }
        const sb = bal; bal -= mpp;
        const inst = mpp + mi;
        schedule.push({ month: i, startBalance: sb, interest: mi, principal: mpp, payment: inst, endBalance: Math.max(0, bal), isFeeMonth: fee });
        totalInterest += mi; totalPayment += inst;
      }
    } else {
      let bal = A; const mp = A / M;
      for (let i = 1; i <= M; i++) {
        const mi = (bal * (R / 100)) / 12, inst = mp + mi, sb = bal; bal -= mp;
        schedule.push({ month: i, startBalance: sb, interest: mi, principal: mp, payment: inst, endBalance: Math.max(0, bal), isFeeMonth: false });
        totalInterest += mi; totalPayment += inst;
      }
    }
  } else {
    if (R === 0) {
      const mp = A / M; let bal = A;
      for (let i = 1; i <= M; i++) {
        const sb = bal; bal -= mp;
        schedule.push({ month: i, startBalance: sb, interest: 0, principal: mp, payment: mp, endBalance: Math.max(0, bal), isFeeMonth: false });
        totalPayment += mp;
      }
    } else {
      const mr = R / 100 / 12, inst = A * (mr * Math.pow(1 + mr, M)) / (Math.pow(1 + mr, M) - 1); let bal = A;
      for (let i = 1; i <= M; i++) {
        const mi = bal * mr, mpp = inst - mi, sb = bal; bal -= mpp;
        schedule.push({ month: i, startBalance: sb, interest: mi, principal: mpp, payment: inst, endBalance: Math.max(0, bal), isFeeMonth: false });
        totalInterest += mi; totalPayment += inst;
      }
    }
  }
  return { schedule, totalInterest, totalPayment, monthlyAverage: totalPayment / M, realRate: A > 0 ? (totalInterest / A) * 100 : 0 };
};

/* ─── Summary Card (light) ─── */
const TONE_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-100',    text: 'text-rose-700',    icon: 'bg-rose-100 text-rose-600'       },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700',    icon: 'bg-blue-100 text-blue-600'       },
  slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700',   icon: 'bg-slate-100 text-slate-500'     },
};

function SummaryCard({ title, value, sub, icon, tone }: { title: string; value: string; sub: string; icon: React.ReactNode; tone: keyof typeof TONE_MAP }) {
  const t = TONE_MAP[tone];
  return (
    <div className={`rounded-2xl border p-4 ${t.bg} ${t.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.icon}`}>{icon}</div>
        <span className="text-xs font-bold text-slate-500">{title}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-xl font-black ${t.text}`}>{value}</span>
        <span className="text-xs text-slate-400 font-semibold">{sub}</span>
      </div>
    </div>
  );
}

/* ─── Scenario Comparison Card ─── */
type MetricBests = { monthlyAverage: number; totalInterest: number; totalPayment: number };

function ScenarioCard({
  scenario, bests, onRemove,
}: {
  scenario: Scenario;
  bests: MetricBests;
  onRemove: (id: number) => void;
}) {
  const r = scenario.result;
  const isBestMonthly  = r.monthlyAverage  <= bests.monthlyAverage  + 0.01;
  const isBestInterest = r.totalInterest   <= bests.totalInterest   + 0.01;
  const isBestTotal    = r.totalPayment    <= bests.totalPayment    + 0.01;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="bg-white rounded-3xl border border-black/6 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-800 text-sm">{scenario.label}</span>
          <span className="text-[10px] font-bold text-slate-400 bg-white border border-black/8 px-2 py-0.5 rounded-full">
            {scenario.loanTypeName}
          </span>
        </div>
        <button
          onClick={() => onRemove(scenario.id)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inputs summary */}
      <div className="px-5 pt-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 border-b border-black/5">
        <span><span className="font-bold text-slate-700">{formatCurrency(scenario.amount)}</span> تومان</span>
        <span><span className="font-bold text-slate-700">{toPersianDigits(scenario.rate)}</span>٪ سالانه</span>
        <span><span className="font-bold text-slate-700">{toPersianDigits(scenario.months)}</span> ماه</span>
      </div>

      {/* Metrics */}
      <div className="px-5 py-4 space-y-3">
        <MetricRow
          label="قسط ماهانه (متوسط)"
          value={formatCurrency(r.monthlyAverage)}
          sub="تومان"
          isBest={isBestMonthly}
        />
        <MetricRow
          label={scenario.isGharz ? 'کل کارمزد' : 'کل سود'}
          value={formatCurrency(r.totalInterest)}
          sub="تومان"
          isBest={isBestInterest}
        />
        <MetricRow
          label="کل بازپرداخت"
          value={formatCurrency(r.totalPayment)}
          sub="تومان"
          isBest={isBestTotal}
        />
        <MetricRow
          label="نسبت سود به اصل"
          value={toPersianDigits(r.realRate.toFixed(1))}
          sub="٪"
          isBest={false}
        />
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value, sub, isBest }: { label: string; value: string; sub: string; isBest: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${isBest ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'}`}>
      <div className="flex items-center gap-1.5">
        {isBest && <Crown className="w-3 h-3 text-emerald-500" />}
        <span className={`text-xs font-semibold ${isBest ? 'text-emerald-700' : 'text-slate-500'}`}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-sm font-black ${isBest ? 'text-emerald-700' : 'text-slate-800'}`}>{value}</span>
        <span className={`text-[10px] font-semibold ${isBest ? 'text-emerald-500' : 'text-slate-400'}`}>{sub}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LoanForm() {
  const [loanType, setLoanType]         = useState<LoanType>(LOAN_TYPES[0]);
  const [gharzMethod, setGharzMethod]   = useState<GharzMethod>('annual-first');
  const [loanAmount, setLoanAmount]     = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration]         = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationType>('month');
  const [results, setResults]           = useState<LoanResult | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);
  const [calcStartedAt, setCalcStartedAt] = useState<number | null>(null);

  /* ─ Scenario state ─ */
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const scenarioCounter = useRef(0);

  const isLoggingRef = useRef(false);

  const amountNum = useMemo(() => clampNonNegative(parseNumberSafe(loanAmount)), [loanAmount]);
  const rateNum   = useMemo(() => parseNumberSafe(interestRate), [interestRate]);
  const months    = useMemo(() => { const d = parseNumberSafe(duration); return Math.max(1, Math.floor(durationUnit === 'year' ? d * 12 : d)); }, [duration, durationUnit]);
  const isReady   = useMemo(() => loanAmount.trim() !== '' && interestRate.trim() !== '' && duration.trim() !== '', [loanAmount, interestRate, duration]);

  const rateExample     = useMemo(() => `مثلاً ${toPersianDigits(loanType.defaultRate)}`, [loanType]);
  const durationExample = useMemo(() => { const y = loanType.defaultYears; return durationUnit === 'year' ? `مثلاً ${toPersianDigits(y)}` : `مثلاً ${toPersianDigits(y * 12)}`; }, [loanType, durationUnit]);

  const handleCalculate = useCallback(() => {
    if (!isReady || amountNum <= 0 || months <= 0) return;
    const startedAt = Date.now();
    setCalcStartedAt(startedAt);
    setResults(calculateLoan(amountNum, rateNum, months, loanType.isGharz, gharzMethod));
    setShowFullTable(false);
  }, [isReady, amountNum, months, rateNum, loanType.isGharz, gharzMethod]);

  const handleClear = useCallback(() => {
    setLoanType(LOAN_TYPES[0]); setGharzMethod('annual-first');
    setLoanAmount(''); setInterestRate(''); setDuration('');
    setDurationUnit('month'); setResults(null); setShowFullTable(false); setCalcStartedAt(null);
  }, []);

  const addScenario = useCallback(() => {
    if (!results || scenarios.length >= 3) return;
    scenarioCounter.current += 1;
    const num = scenarioCounter.current;
    setScenarios((prev) => [
      ...prev,
      {
        id: num,
        label: `سناریو ${toPersianDigits(num)}`,
        loanTypeName: loanType.name,
        isGharz: loanType.isGharz,
        amount: amountNum,
        rate: rateNum,
        months,
        result: results,
      },
    ]);
  }, [results, scenarios.length, loanType, amountNum, rateNum, months]);

  const removeScenario = useCallback((id: number) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /* ─ Best values across scenarios (for highlighting) ─ */
  const bests = useMemo<MetricBests>(() => {
    if (scenarios.length === 0) return { monthlyAverage: Infinity, totalInterest: Infinity, totalPayment: Infinity };
    return {
      monthlyAverage: Math.min(...scenarios.map((s) => s.result.monthlyAverage)),
      totalInterest:  Math.min(...scenarios.map((s) => s.result.totalInterest)),
      totalPayment:   Math.min(...scenarios.map((s) => s.result.totalPayment)),
    };
  }, [scenarios]);

  /* ─ Auto-log tool run ─ */
  useEffect(() => {
    if (!results || !calcStartedAt) return;
    const savedKey = `takhmino_${toolConfig.slug}__saved_run_${calcStartedAt}`;
    if (sessionStorage.getItem(savedKey) || isLoggingRef.current) return;
    isLoggingRef.current = true;
    (async () => {
      try {
        const summary = `قسط ماهانه ${formatCurrency(results.monthlyAverage)} تومان. مدت ${toPersianDigits(months)} ماه. کل ${loanType.isGharz ? 'کارمزد' : 'سود'} ${formatCurrency(results.totalInterest)} تومان.`;
        await saveToolRun({ toolSlug: toolConfig.slug, toolName: toolConfig.toolName, summary, rawData: { inputs: { loanTypeId: loanType.id, isGharz: loanType.isGharz, gharzMethod, amount: amountNum, annualRate: rateNum, months }, result: { monthlyAverage: results.monthlyAverage, totalInterest: results.totalInterest, totalPayment: results.totalPayment, realRate: results.realRate } } });
        sessionStorage.setItem(savedKey, '1');
      } catch {} finally { isLoggingRef.current = false; }
    })();
  }, [results, calcStartedAt]);

  const inputCls = 'w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-slate-800 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all';

  const canAddScenario = !!results && scenarios.length < 3;

  return (
    <div dir="rtl" className="space-y-5">

      {/* ── فرم + نتایج ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── فرم ── */}
        <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-black text-slate-800 text-sm">مشخصات وام</div>
              <div className="text-xs text-slate-400 mt-0.5">نوع وام، مبلغ، نرخ و مدت را وارد کنید</div>
            </div>
          </div>

          <div className="space-y-4">
            {/* نوع وام */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع وام</label>
              <select value={loanType.id} onChange={(e) => setLoanType(LOAN_TYPES.find((t) => t.id === e.target.value) ?? LOAN_TYPES[0])} className={inputCls}>
                {LOAN_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* مبلغ */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">مبلغ وام (تومان)</label>
              <div className="relative">
                <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={loanAmount} placeholder="مثلاً ۱۰۰٬۰۰۰٬۰۰۰" onFocus={(e) => loanAmount && selectAllOnFocus(e)} onChange={(e) => setLoanAmount(formatAmountInput(e.target.value))} className={`${inputCls} pl-12 text-left font-bold text-base`} />
                <Wallet className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {loanAmount.trim() && <div className="mt-1.5 text-xs text-emerald-600 font-bold">{formatCurrency(amountNum)} تومان</div>}
            </div>

            {/* نرخ سود */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">{loanType.isGharz ? 'نرخ کارمزد سالانه (٪)' : 'نرخ سود سالانه (٪)'}</label>
              <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" placeholder={rateExample} value={interestRate} onFocus={(e) => interestRate && selectAllOnFocus(e)} onChange={(e) => setInterestRate(keepNumericPersian(e.target.value, true))} className={`${inputCls} text-right`} />
            </div>

            {/* مدت */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">مدت بازپرداخت</label>
              <div className="flex items-center rounded-2xl border border-black/10 bg-white overflow-hidden focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={duration} placeholder={durationExample} onFocus={(e) => duration && selectAllOnFocus(e)} onChange={(e) => setDuration(keepNumericPersian(e.target.value, false))} className="flex-1 bg-transparent px-4 py-3 text-center font-bold text-base text-slate-800 outline-none" />
                <div className="flex border-r border-black/8 shrink-0">
                  {(['year', 'month'] as const).map((u) => (
                    <button key={u} type="button" onClick={() => setDurationUnit(u)} className={`px-4 py-3 text-xs font-bold transition-colors ${durationUnit === u ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-700'}`}>
                      {u === 'year' ? 'سال' : 'ماه'}
                    </button>
                  ))}
                </div>
              </div>
              {duration.trim() && <div className="mt-1.5 text-xs text-slate-400 font-semibold">معادل: {toPersianDigits(months)} ماه</div>}
            </div>

            {/* روش قرض‌الحسنه */}
            {loanType.isGharz && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">روش محاسبه کارمزد</label>
                <select value={gharzMethod} onChange={(e) => setGharzMethod(e.target.value as GharzMethod)} className={inputCls}>
                  <option value="annual-first">سالانه یکجا در ماه اول هر سال (۱،۱۳،۲۵...)</option>
                  <option value="monthly">ماهانه کاهشی روی مانده</option>
                </select>
              </div>
            )}

            {/* دکمه‌ها */}
            <div className="pt-1 space-y-2.5">
              <button type="button" onClick={handleCalculate} disabled={!isReady} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-emerald-100 active:scale-[0.98]">
                محاسبه اقساط
              </button>

              {/* افزودن به مقایسه */}
              <button
                type="button"
                onClick={addScenario}
                disabled={!canAddScenario}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 border ${
                  canAddScenario
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-black/8 bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {scenarios.length >= 3 ? 'حداکثر ۳ سناریو' : 'افزودن به مقایسه'}
                {scenarios.length > 0 && scenarios.length < 3 && (
                  <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-black">
                    {toPersianDigits(scenarios.length)}/۳
                  </span>
                )}
              </button>

              <button type="button" onClick={handleClear} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                پاکسازی
              </button>
            </div>

            {/* disclaimer */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-amber-700">ارقام صرفاً تخمینی است. برای اطلاع از ارقام نهایی با موسسه مربوطه تماس بگیرید.</p>
            </div>
          </div>
        </div>

        {/* ── نتایج ── */}
        <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <TableIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-black text-slate-800 text-sm">نتیجه محاسبات</div>
                <div className="text-xs text-slate-400 mt-0.5">خلاصه + جدول اقساط</div>
              </div>
            </div>
            {results && (
              <button type="button" onClick={() => { setResults(null); setShowFullTable(false); setCalcStartedAt(null); }} className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" />
                ریست
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-black/6 flex items-center justify-center mb-4">
                  <Calculator className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="font-black text-slate-700 mb-2">هنوز محاسبه‌ای انجام نشده</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">اطلاعات وام را وارد کنید و روی «محاسبه اقساط» بزنید.</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* کارت‌های خلاصه */}
                <div className="grid grid-cols-2 gap-3">
                  <SummaryCard title="قسط ماهانه (متوسط)" value={formatCurrency(results.monthlyAverage)} sub="تومان" icon={<CreditCard className="w-4 h-4" />} tone="blue" />
                  <SummaryCard title={loanType.isGharz ? 'کل کارمزد' : 'کل سود'} value={formatCurrency(results.totalInterest)} sub="تومان" icon={<TrendingUp className="w-4 h-4" />} tone="rose" />
                  <SummaryCard title="کل بازپرداخت" value={formatCurrency(results.totalPayment)} sub="تومان" icon={<AlertCircle className="w-4 h-4" />} tone="emerald" />
                  <SummaryCard title="نسبت سود به اصل" value={toPersianDigits(results.realRate.toFixed(1))} sub="٪" icon={<Info className="w-4 h-4" />} tone="slate" />
                </div>

                {/* جدول اقساط */}
                <div className="rounded-2xl border border-black/6 overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-black text-slate-700 text-xs">جدول اقساط</span>
                    </div>
                    <button type="button" onClick={() => setShowFullTable((v) => !v)} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition-colors">
                      {showFullTable ? 'نمایش خلاصه' : 'نمایش همه'}
                      {showFullTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-right text-xs" dir="rtl">
                      <thead className="bg-slate-50 text-slate-500 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">قسط</th>
                          <th className="py-2.5 px-3">اصل</th>
                          <th className="py-2.5 px-3">{loanType.isGharz ? 'کارمزد' : 'سود'}</th>
                          <th className="py-2.5 px-3">جمع</th>
                          <th className="py-2.5 px-3">مانده</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/4">
                        {results.schedule.slice(0, showFullTable ? results.schedule.length : 6).map((row) => (
                          <tr key={row.month} className={`hover:bg-slate-50 transition-colors ${row.isFeeMonth ? 'bg-amber-50' : ''}`}>
                            <td className="py-2.5 px-3 font-bold text-slate-400">{toPersianDigits(row.month)}</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700">{formatCurrency(row.principal)}</td>
                            <td className="py-2.5 px-3 text-rose-600 font-semibold">
                              {formatCurrency(row.interest)}
                              {row.isFeeMonth && <span className="mr-1 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black">سالانه</span>}
                            </td>
                            <td className="py-2.5 px-3 font-black text-slate-800">{formatCurrency(row.payment)}</td>
                            <td className="py-2.5 px-3 text-slate-400">{formatCurrency(row.endBalance)}</td>
                          </tr>
                        ))}
                        {!showFullTable && results.schedule.length > 6 && (
                          <tr><td colSpan={5} className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">... {toPersianDigits(results.schedule.length - 6)} قسط دیگر</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* شفافیت */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-black text-emerald-800 text-xs">فرمول محاسبه</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['برای وام‌های معمولی از فرمول قسط ثابت (EMI) استفاده می‌شود.', 'برای قرض‌الحسنه دو روش کارمزد (سالانه / ماهانه) پشتیبانی می‌شود.', 'جدول اقساط سهم اصل و سود را ماه‌به‌ماه نمایش می‌دهد.'].map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-emerald-700"><span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />{t}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── مقایسه سناریوها ─────────────────────────── */}
      <AnimatePresence>
        {scenarios.length > 0 && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            {/* عنوان بخش */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <GitCompare className="w-4 h-4 text-violet-600" />
                </div>
                <span className="font-black text-slate-800 text-sm">مقایسه سناریوها</span>
                <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full">
                  {toPersianDigits(scenarios.length)} از ۳
                </span>
              </div>
              <div className="flex-1 h-px bg-black/5" />
              <p className="text-xs text-slate-400 hidden sm:block">
                بهترین مقدار هر معیار با
                <Crown className="inline w-3 h-3 text-emerald-500 mx-1" />
                مشخص شده
              </p>
            </div>

            {/* کارت‌های سناریو */}
            <div className={`grid gap-4 ${
              scenarios.length === 1
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : scenarios.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-3'
            }`}>
              <AnimatePresence>
                {scenarios.map((s) => (
                  <ScenarioCard key={s.id} scenario={s} bests={bests} onRemove={removeScenario} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
