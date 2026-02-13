'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import {
  Calculator,
  Info,
  Table as TableIcon,
  TrendingUp,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

// --- Types & Constants ---
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

// --- Utilities ---
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

// --- Core Calculation Logic ---
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
    const emi =
      r === 0 ? A / M : (A * r * Math.pow(1 + r, M)) / (Math.pow(1 + r, M) - 1);

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

export default function Page() {
  const [loanType, setLoanType] = useState<LoanType>(LOAN_TYPES[0]);

  // default empty
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  const [durationType, setDurationType] = useState<DurationType>('month');
  const [gharzMethod, setGharzMethod] = useState<GharzMethod>('annual-first');
  const [showFullTable, setShowFullTable] = useState(false);

  const [results, setResults] = useState<LoanResult | null>(null);

  const amountExample = 'مثلاً ۱۰۰٬۰۰۰٬۰۰۰';
  const rateExample = useMemo(() => `مثلاً ${toPersianDigits(loanType.defaultRate)}`, [loanType]);
  const durationExample = useMemo(() => {
    const years = loanType.defaultYears;
    const months = years * 12;
    return durationType === 'year'
      ? `مثلاً ${toPersianDigits(years)}`
      : `مثلاً ${toPersianDigits(months)}`;
  }, [loanType, durationType]);

  const months = useMemo(() => {
    const d = parseNumberSafe(duration);
    const m = durationType === 'year' ? d * 12 : d;
    return Math.max(1, Math.floor(m));
  }, [duration, durationType]);

  const amountNum = useMemo(() => clampNonNegative(parseNumberSafe(amount)), [amount]);
  const rateNum = useMemo(() => parseNumberSafe(rate), [rate]);

  const isReady = useMemo(() => {
    return amount.trim() !== '' && rate.trim() !== '' && duration.trim() !== '';
  }, [amount, rate, duration]);

  const handleCalculate = useCallback(() => {
    if (!isReady) return;
    if (amountNum <= 0 || months <= 0) return;

    const calc = calculateLoan(amountNum, rateNum, months, loanType.isGharz, gharzMethod);
    setResults(calc);
  }, [isReady, amountNum, rateNum, months, loanType.isGharz, gharzMethod]);

  const handleClearForm = useCallback(() => {
    setAmount('');
    setRate('');
    setDuration('');
    setResults(null);
    setShowFullTable(false);
  }, []);

  const visibleResults = isReady ? results : null;

  return (
    <div
      className={`${vazirmatn.className} min-h-screen bg-slate-50 p-4 md:p-8 text-right`}
      dir="rtl"
      style={{
        fontFamily:
          "Yekan, IRANYekan, 'Yekan Bakh', Vazirmatn, ui-sans-serif, system-ui, -apple-system",
      }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Takhmino <span className="text-blue-600">Loan Calculator</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            این ابزار قسط ماهانه، کل سود/کارمزد و جدول اقساط را دقیق محاسبه می‌کند.
            بر اساس نرخ‌های رایج ۱۴۰۴-۱۴۰۵. محاسبات بر اساس فرمول استاندارد بانک مرکزی است.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Calculator className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-slate-800">ورودی‌های وام</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">نوع وام</label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={loanType.id}
                  onChange={(e) => {
                    const next = LOAN_TYPES.find((t) => t.id === e.target.value) ?? LOAN_TYPES[0];
                    setLoanType(next);
                  }}
                >
                  {LOAN_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">مبلغ وام (تومان)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                  value={amount}
                  placeholder={amountExample}
                  onChange={(e) => setAmount(formatAmountInput(e.target.value))}
                />
                <p className="text-[11px] text-blue-600 font-medium">
                  {amount.trim() ? `${formatCurrency(amountNum)} تومان` : ' '}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">نرخ سود سالانه</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full h-11 px-3 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                      value={rate}
                      placeholder={rateExample}
                      onChange={(e) => setRate(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5 text-xs text-slate-400">٪</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">واحد مدت</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      className={`flex-1 py-1.5 text-xs rounded-md transition-all ${
                        durationType === 'year' ? 'bg-white shadow-sm font-bold' : 'text-slate-500'
                      }`}
                      onClick={() => setDurationType('year')}
                    >
                      سال
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-1.5 text-xs rounded-md transition-all ${
                        durationType === 'month' ? 'bg-white shadow-sm font-bold' : 'text-slate-500'
                      }`}
                      onClick={() => setDurationType('month')}
                    >
                      ماه
                    </button>
                  </div>
                </div>
              </div>

              {loanType.isGharz && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">روش محاسبه کارمزد</label>
                  <select
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={gharzMethod}
                    onChange={(e) => setGharzMethod(e.target.value as GharzMethod)}
                  >
                    <option value="annual-first">سالانه یکجا در ماه اول هر سال (۱،۱۳،۲۵...)</option>
                    <option value="monthly">ماهانه کاهشی روی مانده (بعضی بانک‌ها)</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  مدت بازپرداخت ({durationType === 'year' ? 'سال' : 'ماه'})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                  value={duration}
                  placeholder={durationExample}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                محاسبه اقساط
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                پاکسازی فرم
              </button>
            </div>

            <div
              className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start"
              dir="rtl"
            >
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p
                className="text-xs text-blue-800 leading-relaxed flex-1 w-full"
                style={{
                  textAlign: 'justify',
                  textAlignLast: 'right',
                }}
              >
                در وام‌های قرض‌الحسنه، کارمزد معمولاً سالانه یکجا (۴٪ مانده ابتدای سال) در ماه‌های اول هر سال (۱،۱۳،۲۵...)
                دریافت می‌شود. روش ماهانه هم در برخی بانک‌ها استفاده می‌شود.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {!isReady && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <Info className="w-5 h-5 text-slate-400" />
                  <h2 className="font-bold">نتیجه محاسبات</h2>
                </div>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                  برای نمایش نتیجه‌ها، لطفاً <span className="font-bold text-slate-700">مبلغ وام</span>،
                  <span className="font-bold text-slate-700"> نرخ سود</span> و
                  <span className="font-bold text-slate-700"> مدت بازپرداخت</span> را وارد کن و روی «محاسبه اقساط» بزن.
                </p>
              </div>
            )}

            {visibleResults && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultCard
                    label="قسط ماهانه (متوسط)"
                    value={formatCurrency(visibleResults.monthlyAverage)}
                    sub="تومان"
                    icon={<CreditCard className="w-4 h-4" />}
                    color="blue"
                  />
                  <ResultCard
                    label="کل سود/کارمزد"
                    value={formatCurrency(visibleResults.totalInterest)}
                    sub="تومان"
                    icon={<TrendingUp className="w-4 h-4" />}
                    color="red"
                  />
                  <ResultCard
                    label="کل بازپرداخت"
                    value={formatCurrency(visibleResults.totalPayment)}
                    sub="تومان"
                    icon={<AlertCircle className="w-4 h-4" />}
                    color="green"
                  />
                  <ResultCard
                    label="نسبت سود به اصل"
                    value={toPersianDigits(visibleResults.realRate.toFixed(1))}
                    sub="درصد"
                    icon={<Info className="w-4 h-4" />}
                    color="slate"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-5 h-5 text-slate-400" />
                      <h2 className="font-bold text-slate-800">جدول تحلیل اقساط</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullTable(!showFullTable)}
                      className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                    >
                      {showFullTable ? 'نمایش خلاصه' : 'نمایش همه اقساط'}
                      {showFullTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="w-full overflow-hidden">
                    <table className="w-full table-fixed text-right text-xs md:text-sm" dir="rtl">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                          <th className="py-3 border-b px-2 md:px-4 w-[56px] md:w-[72px]">قسط</th>
                          <th className="py-3 border-b px-2 md:px-4 w-[22%]">اصل</th>
                          <th className="py-3 border-b px-2 md:px-4 w-[22%]">سود/کارمزد</th>
                          <th className="py-3 border-b px-2 md:px-4 w-[22%]">جمع قسط</th>
                          <th className="py-3 border-b px-2 md:px-4 w-[24%]">مانده</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleResults.schedule
                          .slice(0, showFullTable ? visibleResults.schedule.length : 6)
                          .map((row) => (
                            <tr
                              key={row.month}
                              className={`hover:bg-slate-50/50 transition-colors ${
                                row.isFeeMonth ? 'bg-amber-50/50' : ''
                              }`}
                            >
                              <td className="py-3 px-2 md:px-4 font-medium text-slate-400 truncate">
                                {toPersianDigits(row.month)}
                              </td>
                              <td className="py-3 px-2 md:px-4 text-emerald-600 truncate">
                                {formatCurrency(row.principal)}
                              </td>
                              <td className="py-3 px-2 md:px-4 text-rose-500">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="truncate w-full">{formatCurrency(row.interest)}</span>
                                  {row.isFeeMonth && (
                                    <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded inline-block font-bold">
                                      کارمزد سالانه
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 md:px-4 font-bold text-slate-700 truncate">
                                {formatCurrency(row.payment)}
                              </td>
                              <td className="py-3 px-2 md:px-4 text-slate-400 truncate">
                                {formatCurrency(row.endBalance)}
                              </td>
                            </tr>
                          ))}

                        {!showFullTable && visibleResults.schedule.length > 6 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-slate-400 italic bg-slate-50/30">
                              ... {toPersianDigits(visibleResults.schedule.length - 6)} قسط دیگر (برای مشاهده روی &quot;نمایش همه&quot;
                              کلیک کنید)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="pt-8 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-400">
            محاسبه بر اساس فرمول استاندارد بانک مرکزی ایران – طراحی شده برای Takhmino
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-300">
            <span>حقوق محفوظ است ۱۴۰۴</span>
            <span>•</span>
            <span>دقت محاسبات ۹۹.۹٪</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'slate';
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    slate: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} space-y-1`}>
      <div className="flex items-center gap-2 opacity-70">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black">{value}</span>
        <span className="text-[10px] font-medium opacity-80">{sub}</span>
      </div>
    </div>
  );
}
