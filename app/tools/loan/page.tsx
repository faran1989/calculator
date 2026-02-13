'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import {
  Calculator,
  Info,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  LayoutGrid,
  HelpCircle,
  Wallet,
  TrendingUp,
  Users,
  BarChart3,
  Globe,
  MessageSquare,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

// =========================
// Types (from full loan tool)
// =========================
type LoanType = {
  id: string;
  name: string;
  defaultRate: number;
  defaultYears: number;
  isGharz: boolean;
};

type DurationType = 'month' | 'year';
type GharzMethod = 'annual-first' | 'monthly';

type ScheduleRow = {
  month: number;
  startBalance: number;
  interest: number;
  principal: number;
  payment: number;
  endBalance: number;
  isFeeMonth: boolean;
};

type LoanResult = {
  schedule: ScheduleRow[];
  totalInterest: number;
  totalPayment: number;
  monthlyAverage: number;
  realRate: number;
};

const LOAN_TYPES: LoanType[] = [
  { id: 'gharz', name: 'قرض‌الحسنه', defaultRate: 4, defaultYears: 10, isGharz: true },
  { id: 'moshavereh', name: 'مضاربه/مشارکت', defaultRate: 23, defaultYears: 1, isGharz: false },
  { id: 'maskan', name: 'مسکن', defaultRate: 18, defaultYears: 20, isGharz: false },
  { id: 'shakhsi', name: 'شخصی/نقدی', defaultRate: 23, defaultYears: 5, isGharz: false },
  { id: 'custom', name: 'سایر (دستی)', defaultRate: 0, defaultYears: 1, isGharz: false },
];

// =========================
// Utilities (from full loan tool)
// =========================
const formatCurrency = (val: number) => {
  const safe = Number.isFinite(val) ? val : 0;
  return new Intl.NumberFormat('fa-IR').format(Math.round(safe));
};

const toPersianDigits = (n: number | string) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (x) => farsiDigits[Number(x)] ?? x);
};

const clampNonNegative = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

const normalizeNumericString = (input: string) => {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';

  let s = (input ?? '').toString();

  for (let i = 0; i < 10; i++) {
    s = s.replaceAll(fa[i], String(i));
    s = s.replaceAll(ar[i], String(i));
  }

  s = s.replaceAll('٬', '');
  s = s.replaceAll('،', '');
  s = s.replaceAll(',', '');
  s = s.replaceAll(' ', '');

  s = s.replaceAll('٫', '.');

  const parts = s.split('.');
  if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');

  return s;
};

const parseNumberSafe = (value: string) => {
  const v = normalizeNumericString((value ?? '').trim());
  if (!v) return 0;
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};

// Amount input formatting: three-by-three grouping while typing
const formatAmountInput = (raw: string) => {
  const norm = normalizeNumericString(raw);
  const digitsOnly = norm.replace(/[^\d]/g, '');
  if (!digitsOnly) return '';
  const n = Number(digitsOnly);
  if (!Number.isFinite(n) || n <= 0) return digitsOnly;
  return new Intl.NumberFormat('fa-IR').format(n);
};

// =========================
// Core Calculation Logic (FULL)
// =========================
const calculateLoan = (
  amount: number,
  annualRate: number,
  months: number,
  isGharz: boolean,
  gharzMethod: GharzMethod = 'annual-first'
): LoanResult => {
  const schedule: ScheduleRow[] = [];
  let totalInterest = 0;
  let totalPayment = 0;

  const A = clampNonNegative(amount);
  const M = Math.max(1, Math.floor(months));
  const R = Number.isFinite(annualRate) ? annualRate : 0;

  if (isGharz) {
    if (gharzMethod === 'annual-first') {
      let remainingBalance = A;
      const totalYears = Math.ceil(M / 12);

      const feeMonthsCount = totalYears;
      const principalInstallmentsCount = M - feeMonthsCount;

      if (principalInstallmentsCount <= 0) {
        return calculateLoan(A, R, M, isGharz, 'monthly');
      }

      const monthlyPrincipal = A / principalInstallmentsCount;

      for (let i = 1; i <= M; i++) {
        let monthlyInterest = 0;
        let monthlyPrincipalPayment = 0;
        let isFeeMonth = false;

        if ((i - 1) % 12 === 0) {
          isFeeMonth = true;
          monthlyInterest = remainingBalance * (R / 100);
          monthlyPrincipalPayment = 0;
        } else {
          isFeeMonth = false;
          monthlyInterest = 0;
          monthlyPrincipalPayment = monthlyPrincipal;

          if (i === M || remainingBalance - monthlyPrincipalPayment < 1) {
            monthlyPrincipalPayment = remainingBalance;
          }
        }

        const startBalance = remainingBalance;
        remainingBalance -= monthlyPrincipalPayment;

        const monthlyInstallment = monthlyPrincipalPayment + monthlyInterest;

        schedule.push({
          month: i,
          startBalance,
          interest: monthlyInterest,
          principal: monthlyPrincipalPayment,
          payment: monthlyInstallment,
          endBalance: Math.max(0, remainingBalance),
          isFeeMonth,
        });

        totalInterest += monthlyInterest;
        totalPayment += monthlyInstallment;
      }
    } else {
      let remainingBalance = A;
      const monthlyPrincipal = A / M;

      for (let i = 1; i <= M; i++) {
        const monthlyInterest = (remainingBalance * (R / 100)) / 12;
        const monthlyInstallment = monthlyPrincipal + monthlyInterest;

        const startBalance = remainingBalance;
        remainingBalance -= monthlyPrincipal;

        schedule.push({
          month: i,
          startBalance,
          interest: monthlyInterest,
          principal: monthlyPrincipal,
          payment: monthlyInstallment,
          endBalance: Math.max(0, remainingBalance),
          isFeeMonth: false,
        });

        totalInterest += monthlyInterest;
        totalPayment += monthlyInstallment;
      }
    }
  } else {
    const r = R / 12 / 100;
    const emi = r === 0 ? A / M : (A * r * Math.pow(1 + r, M)) / (Math.pow(1 + r, M) - 1);

    let remainingBalance = A;

    for (let i = 1; i <= M; i++) {
      const monthlyInterest = remainingBalance * r;
      const monthlyPrincipal = emi - monthlyInterest;

      const startBalance = remainingBalance;
      remainingBalance -= monthlyPrincipal;

      schedule.push({
        month: i,
        startBalance,
        interest: monthlyInterest,
        principal: monthlyPrincipal,
        payment: emi,
        endBalance: Math.max(0, remainingBalance),
        isFeeMonth: false,
      });

      totalInterest += monthlyInterest;
      totalPayment += emi;
    }
  }

  return {
    schedule,
    totalInterest,
    totalPayment,
    monthlyAverage: totalPayment / M,
    realRate: A > 0 ? (totalInterest / A) * 100 : 0,
  };
};

export default function LoanToolPage() {
  const [activeTab, setActiveTab] = useState<'calc' | 'about'>('about');

  // --- Full tool states (ported) ---
  const [loanType, setLoanType] = useState<LoanType>(LOAN_TYPES[0]);
  const [gharzMethod, setGharzMethod] = useState<GharzMethod>('annual-first');

  const [loanAmount, setLoanAmount] = useState('80,000,000');
  const [interestRate, setInterestRate] = useState(''); // user input
  const [duration, setDuration] = useState('56');
  const [durationUnit, setDurationUnit] = useState<DurationType>('month');

  const [results, setResults] = useState<LoanResult | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  // --- Derived values ---
  const amountNum = useMemo(() => clampNonNegative(parseNumberSafe(loanAmount)), [loanAmount]);
  const rateNum = useMemo(() => parseNumberSafe(interestRate), [interestRate]);

  const months = useMemo(() => {
    const d = parseNumberSafe(duration);
    const m = durationUnit === 'year' ? d * 12 : d;
    return Math.max(1, Math.floor(m));
  }, [duration, durationUnit]);

  const isReady = useMemo(
    () => loanAmount.trim() !== '' && interestRate.trim() !== '' && duration.trim() !== '',
    [loanAmount, interestRate, duration]
  );

  // --- Placeholders like original tool ---
  const amountExample = 'مثلاً ۱۰۰٬۰۰۰٬۰۰۰';
  const rateExample = useMemo(() => `مثلاً ${toPersianDigits(loanType.defaultRate)}`, [loanType]);
  const durationExample = useMemo(() => {
    const years = loanType.defaultYears;
    const m = years * 12;
    return durationUnit === 'year' ? `مثلاً ${toPersianDigits(years)}` : `مثلاً ${toPersianDigits(m)}`;
  }, [loanType, durationUnit]);

  // --- Actions ---
  const handleCalculate = useCallback(() => {
    if (!isReady) return;
    if (amountNum <= 0 || months <= 0) return;

    const calc = calculateLoan(amountNum, rateNum, months, loanType.isGharz, gharzMethod);
    setResults(calc);
    setShowFullTable(false);
  }, [isReady, amountNum, months, rateNum, loanType.isGharz, gharzMethod]);

  const handleClearForm = useCallback(() => {
    setLoanType(LOAN_TYPES[0]);
    setGharzMethod('annual-first');
    setLoanAmount('');
    setInterestRate('');
    setDuration('');
    setDurationUnit('month');
    setResults(null);
    setShowFullTable(false);
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <div
      className={[
        vazirmatn.className,
        'min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-12 transition-colors duration-300',
      ].join(' ')}
      dir="rtl"
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0f172a]">Takhmino</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-[#10B981] transition-colors">
              ابزارها
            </a>
            <a href="#" className="hover:text-[#10B981] transition-colors">
              درباره ما
            </a>
            <a href="#" className="hover:text-[#10B981] transition-colors">
              ارتباط
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
            {activeTab === 'calc' ? 'محاسبه قسط وام' : 'درباره این تخمین'}
          </h1>
          <p className="text-slate-500 text-lg">این ابزار برای تخمین است و به تصمیم‌گیری شما کمک می‌کند.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-0 relative z-10">
          <div className="bg-white border border-slate-200 p-1.5 rounded-t-3xl flex gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-8 py-3 rounded-t-2xl text-sm font-bold transition-all ${
                activeTab === 'calc' ? 'bg-[#f8fafc] text-[#10B981]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              محاسبه اقساط
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-3 rounded-t-2xl text-sm font-bold transition-all ${
                activeTab === 'about' ? 'bg-[#f8fafc] text-[#10B981]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              درباره این تخمین
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden">
          {activeTab === 'calc' ? (
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Left Panel: Results */}
              <div className="flex-[1.5] bg-[#f8fafc] p-8 lg:p-12 border-l border-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    آخرین بروزرسانی: امروز
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResults(null);
                      setShowFullTable(false);
                    }}
                    className="flex items-center gap-1 text-slate-400 text-xs hover:text-slate-600 transition-colors"
                  >
                    <RotateCcw size={14} />
                    تغییر به آخرین تنظیمات
                  </button>
                </div>

                {!results ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 mb-8 flex flex-col items-center justify-center text-center py-16">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                      <Calculator size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0f172a] mb-3">نتیجه محاسبات</h2>
                    <p className="text-slate-500 max-w-sm leading-relaxed">
                      ابتدا «نوع وام»، «مبلغ»، «نرخ سود/کارمزد» و «مدت بازپرداخت» را وارد کنید و روی «محاسبه اقساط» بزنید.
                    </p>
                    <button className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                      راهنمای سریع
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <SummaryCard
                        title="قسط ماهانه (متوسط)"
                        value={formatCurrency(results.monthlyAverage)}
                        sub="تومان"
                        icon={<CreditCard size={18} />}
                        tone="blue"
                      />
                      <SummaryCard
                        title={loanType.isGharz ? 'کل کارمزد' : 'کل سود'}
                        value={formatCurrency(results.totalInterest)}
                        sub="تومان"
                        icon={<TrendingUp size={18} />}
                        tone="rose"
                      />
                      <SummaryCard
                        title="کل بازپرداخت"
                        value={formatCurrency(results.totalPayment)}
                        sub="تومان"
                        icon={<AlertCircle size={18} />}
                        tone="emerald"
                      />
                      <SummaryCard
                        title="نسبت سود به اصل"
                        value={toPersianDigits(results.realRate.toFixed(1))}
                        sub="٪"
                        icon={<Info size={18} />}
                        tone="slate"
                      />
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden mb-8">
                      <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TableIcon size={18} className="text-blue-500" />
                          <h3 className="font-bold text-[#0f172a]">جدول تحلیل اقساط</h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowFullTable((v) => !v)}
                          className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                        >
                          {showFullTable ? 'نمایش خلاصه' : 'نمایش همه'}
                          {showFullTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-right text-sm" dir="rtl">
                          <thead className="bg-slate-50 text-slate-500 font-bold">
                            <tr>
                              <th className="py-3 px-4 whitespace-nowrap w-[72px]">قسط</th>
                              <th className="py-3 px-4 whitespace-nowrap">اصل</th>
                              <th className="py-3 px-4 whitespace-nowrap">
                                {loanType.isGharz ? 'کارمزد' : 'سود'}
                              </th>
                              <th className="py-3 px-4 whitespace-nowrap">جمع قسط</th>
                              <th className="py-3 px-4 whitespace-nowrap">مانده</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {results.schedule
                              .slice(0, showFullTable ? results.schedule.length : 6)
                              .map((row) => (
                                <tr
                                  key={row.month}
                                  className={[
                                    'hover:bg-slate-50 transition-colors',
                                    row.isFeeMonth ? 'bg-amber-50/70' : '',
                                  ].join(' ')}
                                >
                                  <td className="py-3 px-4 font-bold text-slate-500">
                                    {toPersianDigits(row.month)}
                                  </td>

                                  <td className="py-3 px-4 font-bold text-emerald-700">
                                    {formatCurrency(row.principal)}
                                  </td>

                                  <td className="py-3 px-4 text-rose-700 font-semibold">
                                    <div className="flex flex-col gap-1">
                                      <span>{formatCurrency(row.interest)}</span>
                                      {row.isFeeMonth && (
                                        <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-lg inline-block font-extrabold w-fit">
                                          کارمزد سالانه
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 font-black text-[#0f172a]">
                                    {formatCurrency(row.payment)}
                                  </td>

                                  <td className="py-3 px-4 text-slate-500 font-semibold">
                                    {formatCurrency(row.endBalance)}
                                  </td>
                                </tr>
                              ))}

                            {!showFullTable && results.schedule.length > 6 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-4 text-center text-slate-400 italic bg-slate-50">
                                  ... {toPersianDigits(results.schedule.length - 6)} قسط دیگر (روی «نمایش همه» بزنید)
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* "How it works" - kept + aligned to full logic */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <LayoutGrid size={20} className="text-blue-500" />
                    <h3 className="font-bold text-[#0f172a]">چطور تخمین ساخته شده؟</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#10B981] mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-600">برای وام‌های معمولی، فرمول قسط ثابت (EMI) استفاده می‌شود.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#10B981] mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-600">
                        برای قرض‌الحسنه، دو روش محاسبه کارمزد (سالانه یکجا / ماهانه کاهشی) پشتیبانی می‌شود.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#10B981] mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-600">جدول اقساط سهم اصل و سود/کارمزد را ماه‌به‌ماه نشان می‌دهد.</span>
                    </li>
                  </ul>
                  <button className="mt-8 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    جزئیات بیشتر
                  </button>
                </div>
              </div>

              {/* Right Panel: Form */}
              <div className="flex-1 p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-8">
                  <Calculator size={20} className="text-blue-500" />
                  <h3 className="text-lg font-bold text-[#0f172a]">مشخصات وام</h3>
                </div>

                <div className="space-y-6">
                  {/* Loan type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">نوع وام</label>
                    <select
                      value={loanType.id}
                      onChange={(e) => {
                        const next = LOAN_TYPES.find((t) => t.id === e.target.value) ?? LOAN_TYPES[0];
                        setLoanType(next);
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-right font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                    >
                      {LOAN_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">مبلغ وام (تومان)</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={loanAmount}
                        placeholder={amountExample}
                        onChange={(e) => setLoanAmount(formatAmountInput(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-left font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <Wallet size={18} />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 font-bold">
                      {loanAmount.trim() ? `${formatCurrency(amountNum)} تومان` : ' '}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">
                      {loanType.isGharz ? 'نرخ کارمزد سالانه (٪)' : 'نرخ سود سالانه (٪)'}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={rateExample}
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-right font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                    />
                  </div>

                  {/* Duration + unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">مدت بازپرداخت</label>
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={duration}
                        placeholder={durationExample}
                        onChange={(e) => setDuration(e.target.value)}
                        className="flex-1 bg-transparent px-5 py-4 text-center font-bold text-lg focus:outline-none"
                      />
                      <div className="flex border-r border-slate-100">
                        <button
                          type="button"
                          onClick={() => setDurationUnit('year')}
                          className={`px-4 py-4 text-xs font-bold transition-colors ${
                            durationUnit === 'year' ? 'bg-white text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          سال
                        </button>
                        <button
                          type="button"
                          onClick={() => setDurationUnit('month')}
                          className={`px-4 py-4 text-xs font-bold transition-colors ${
                            durationUnit === 'month' ? 'bg-white text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          ماه
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 font-bold">
                      معادل: {toPersianDigits(months)} ماه
                    </div>
                  </div>

                  {/* Gharz method (full feature) */}
                  {loanType.isGharz && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">روش محاسبه کارمزد</label>
                      <select
                        value={gharzMethod}
                        onChange={(e) => setGharzMethod(e.target.value as GharzMethod)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-right font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                      >
                        <option value="annual-first">سالانه یکجا در ماه اول هر سال (۱،۱۳،۲۵...)</option>
                        <option value="monthly">ماهانه کاهشی روی مانده (بعضی بانک‌ها)</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleCalculate}
                      className="w-full bg-[#10B981] text-white py-5 rounded-[20px] font-black text-xl shadow-lg shadow-emerald-200 hover:bg-[#059669] transform active:scale-[0.98] transition-all"
                    >
                      محاسبه اقساط
                    </button>

                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="w-full bg-slate-100 text-slate-500 py-4 rounded-[20px] font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                      پاکسازی فرم
                    </button>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start mt-8">
                    <Info size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-emerald-800">
                      ارقام نمایش داده شده صرفاً تخمینی است و بر اساس فرمول‌های کلی محاسبه شده است. برای اطلاع از ارقام نهایی با
                      موسسه مربوطه تماس بگیرید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // About (unchanged from template)
            <div className="p-8 lg:p-12 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-10">
                <HelpCircle size={24} className="text-blue-500" />
                <h3 className="text-xl font-bold text-[#0f172a]">چه کسانی می‌توانند استفاده کنند؟</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-6">
                    <Users size={32} />
                  </div>
                  <h4 className="font-bold mb-3 text-lg">مشاوران و تسهیل‌گران</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    ابزاری کارآمد برای بررسی سناریوهای مختلف بازپرداخت برای مراجعان شما.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                    <BarChart3 size={32} />
                  </div>
                  <h4 className="font-bold mb-3 text-lg">قصد مقایسه سناریو ها</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    امکان بررسی و مقایسه نرخ‌های سود و مدت‌های مختلف برای یافتن بهترین گزینه.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]"></div>
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#10B981] mb-6">
                    <TrendingUp size={32} />
                  </div>
                  <h4 className="font-bold mb-3 text-lg">نیاز به مدیریت مالی دارید</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    برای افرادی که مایلند هزینه‌های آتی خود را دقیق‌تر پیش‌بینی و برنامه‌ریزی کنند.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-10">
                <CheckCircle2 size={24} className="text-blue-500" />
                <h3 className="text-xl font-bold text-[#0f172a]">چه چیزی دریافت می‌کنید؟</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                    <Calculator size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">جدول اقساط کامل</h4>
                    <p className="text-xs text-slate-400">نمایش دقیق سهم اصل و سود وام در هر قسط به صورت تفکیکی.</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                    <Globe size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">گزارش‌های تحلیلی</h4>
                    <p className="text-xs text-slate-400">بررسی مجموع سود پرداختی و هزینه‌های جانبی در طول دوره.</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-8">
                  <MessageSquare size={24} className="text-blue-500" />
                  <h3 className="text-xl font-bold text-[#0f172a]">سوالات پرتکرار (FAQ)</h3>
                </div>

                <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 rounded-[32px] overflow-hidden shadow-2xl relative">
                  <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-white mb-4">آزمون بعدی را امتحان کن</h3>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/40 text-sm">
                        مشاهده ابزارهای بیشتر
                      </button>
                    </div>

                    <div className="flex-[1.5] w-full">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                            <MessageSquare size={20} />
                          </div>
                          <span className="text-white font-bold text-sm md:text-base">
                            معمولاً قسط وام چگونه محاسبه می‌شود؟
                          </span>
                        </div>

                        <div className="flex gap-3 items-center">
                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center min-w-[80px]">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-1">
                              <BarChart3 size={16} />
                            </div>
                            <span className="text-[10px] text-white/70">محاسبه نوین</span>
                          </div>

                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center min-w-[80px]">
                            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-1">
                              <Wallet size={16} />
                            </div>
                            <span className="text-[10px] text-white/70">مدیریت مالی</span>
                          </div>

                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center min-w-[80px]">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-1">
                              <HelpCircle size={16} />
                            </div>
                            <span className="text-[10px] text-white/70">سوالات رایج</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0f172a]">محاسبه تمدید وام</h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">درخواست آنلاین</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Wallet size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0f172a]">سپرده مرکز</h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">مدیریت حساب ها</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0f172a]">محاسبه حقوق</h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">تخمین سالانه</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <footer className="mt-16 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center text-white font-bold text-[10px]">
                T
              </div>
              <span className="font-bold text-slate-600">Takhmino</span>
            </div>
            <span>© ۱۴۰۴ تمامی حقوق محفوظ است.</span>
          </div>

          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">
              توییتر
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              تلگرام
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              اینستاگرام
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              لینکدین
            </a>
          </div>

          <div className="text-left font-mono">
            TAKHMINO.COM <span className="text-emerald-500">✔</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  sub,
  icon,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: 'emerald' | 'rose' | 'blue' | 'slate';
}) {
  const toneMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100 text-rose-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-700' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', iconBg: 'bg-slate-100 text-slate-700' },
  };

  const t = toneMap[tone];

  return (
    <div className={`border border-slate-100 rounded-3xl p-5 ${t.bg}`}>
      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.iconBg}`}>{icon}</div>
        <span>{title}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl font-black ${t.text}`}>{value}</span>
        <span className="text-xs font-bold text-slate-500">{sub}</span>
      </div>
    </div>
  );
}
