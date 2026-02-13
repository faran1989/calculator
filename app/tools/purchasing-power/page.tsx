'use client';

import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calculator, TrendingDown, Zap } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

/**
 * Takhmino - Purchasing Power Calculator (RTL)
 * ✅ UI حفظ شده
 * ✅ گزارش دقت کامل حذف شد
 * ✅ آیکن چرخشی کاملاً دایره‌ای شد
 * ✅ فونت Vazirmatn + استک یکان (اگر در پروژه موجود باشد)
 */

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

type HistoricalPoint = {
  year: number;
  rate: number;
  note?: string;
};

const historicalData: HistoricalPoint[] = [
  { year: 1393, rate: 15.6 },
  { year: 1394, rate: 11.9 },
  { year: 1395, rate: 9.0 },
  { year: 1396, rate: 9.6 },
  { year: 1397, rate: 31.2 },
  { year: 1398, rate: 41.2 },
  { year: 1399, rate: 36.4 },
  { year: 1400, rate: 40.2 },
  { year: 1401, rate: 45.8 },
  { year: 1402, rate: 42.3 },
  { year: 1403, rate: 40.0 },
  { year: 1404, rate: 44.6 },
  { year: 1405, rate: 42.0, note: 'پیش‌بینی' },
];

function calculatePower(p: number, i: number, n: number) {
  return p / Math.pow(1 + i / 100, n);
}

function toPersianNum(input: number | string) {
  return String(input).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function formatCurrency(val: number) {
  if (!Number.isFinite(val)) return '—';
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + ' میلیارد';
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' میلیون';
  return Math.round(val).toLocaleString('fa-IR');
}

type Scenario = {
  label: string;
  rate: number;
  color: string;
  bg: string;
  val: number;
};

export default function Page() {
  const [amount, setAmount] = useState<number>(10_000_000);
  const [inflationRate, setInflationRate] = useState<number>(35);
  const [years, setYears] = useState<number>(5);

  const scenarios: Scenario[] = useMemo(
    () => [
      {
        label: 'خوش‌بینانه',
        rate: 20,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        val: calculatePower(amount, 20, years),
      },
      {
        label: 'متوسط (تاریخی)',
        rate: 30,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        val: calculatePower(amount, 30, years),
      },
      {
        label: 'بدبینانه (واقعی اخیر)',
        rate: 45,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        val: calculatePower(amount, 45, years),
      },
    ],
    [amount, years],
  );

  const mainResult = useMemo(
    () => calculatePower(amount, inflationRate, years),
    [amount, inflationRate, years],
  );

  return (
    <div
      className={`${vazirmatn.className} min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden`}
      dir="rtl"
      style={{
        fontFamily:
          'Vazirmatn, Yekan, "Yekan Bakh", "IRANYekan", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
      }}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-200 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[150px]"></div>
      </div>

      <main className="w-full max-w-5xl bg-white/75 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col">
        {/* Header (دکمه گزارش دقت حذف شد) */}
        <div className="px-10 pt-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
              <Calculator className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">تخمینو</h1>
              <p className="text-xs text-slate-400 font-bold">سنجش شفاف و هنری ارزش سرمایه</p>
            </div>
          </div>

          {/* جای دکمه خالی بماند تا چیدمان خیلی تغییر نکند */}
          <div aria-hidden className="h-10 w-[170px]" />
        </div>

        <div className="flex flex-col md:flex-row mt-6">
          {/* Right: Inputs */}
          <div className="flex-1 p-10 md:p-14 border-l border-slate-100 order-1 md:order-2">
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    مبلغ فعلی شما
                  </label>
                  <span className="text-xl font-black text-blue-600">
                    {formatCurrency(amount)} <span className="text-xs font-normal">تومان</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="1000000000"
                  step="1000000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    نرخ تورم سالانه
                  </label>
                  <span className="text-xl font-black text-blue-600">{toPersianNum(inflationRate)}٪</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>میانگین تاریخی: ۳۰٪</span>
                  <span>تورم نقطه‌ای: ۴۴٪+</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    تعداد سال‌های انتظار
                  </label>
                  <span className="text-xl font-black text-blue-600">
                    {toPersianNum(years)} <span className="text-xs font-normal">سال</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Left: Results & Scenarios */}
          <div className="flex-1 p-10 md:p-14 bg-gradient-to-bl from-blue-50/40 to-white order-2 md:order-1 border-t md:border-t-0">
            <div className="flex flex-col items-center text-center">
              {/* ✅ فقط این قسمت دایره‌ای شد */}
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-100 relative mb-8 group overflow-hidden">
                <TrendingDown className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 border-2 border-dashed border-blue-100 rounded-full animate-[spin_30s_linear_infinite]"></div>
              </div>

              <div className="mb-10">
                <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest">
                  قدرت خرید تقریبی در سال {toPersianNum(1404 + years)}:
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                  حدود <span className="text-blue-600">{formatCurrency(mainResult)}</span>
                </h2>
              </div>

              {/* Scenario Cards */}
              <div className="w-full grid grid-cols-1 gap-3 mb-10">
                <p className="text-[10px] font-black text-slate-400 text-right mb-1">
                  دامنه تخمین (سناریوهای محتمل):
                </p>
                {scenarios.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 ${s.bg} rounded-2xl border border-white/50 shadow-sm transition-transform hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.color.replace('text', 'bg')}`}></div>
                      <span className={`text-xs font-black ${s.color}`}>
                        {s.label} ({toPersianNum(s.rate)}٪)
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-700">{formatCurrency(s.val)}</span>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    روند تورم ایران (۱۳۹۳ - ۱۴۰۵)
                  </p>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="h-44 w-full bg-white/40 rounded-3xl p-4 border border-blue-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="year"
                        fontSize={9}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={toPersianNum}
                      />
                      <YAxis
                        fontSize={9}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={toPersianNum}
                      />
                      <RechartsTooltip
                        labelFormatter={(l) => `سال ${toPersianNum(l)}`}
                        formatter={(v) => [`${toPersianNum(v as number)}٪`, 'نرخ تورم']}
                        contentStyle={{
                          borderRadius: '20px',
                          border: 'none',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                          direction: 'rtl',
                          fontFamily: 'inherit',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRate)"
                      />
                      <ReferenceLine
                        x={1404}
                        stroke="#cbd5e1"
                        strokeDasharray="4 4"
                        label={{ position: 'top', value: 'امروز', fontSize: 8, fill: '#94a3b8' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[11px] text-slate-400 font-black tracking-widest uppercase">
          <span className="hover:text-blue-500 cursor-default transition-colors">تخمین شفاف</span>
          <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
          <span className="hover:text-blue-500 cursor-default transition-colors">دقت آماری</span>
          <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
          <span className="hover:text-blue-500 cursor-default transition-colors">هنر محاسبات</span>
        </div>
        <p className="text-[10px] text-slate-300 font-medium">
          پلتفرم تخمینو © ۱۴۰۳-۱۴۰۵ | طراحی شده برای درک بهتر آینده مالی
        </p>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 22px; width: 22px;
              border-radius: 50%;
              background: white;
              border: 5px solid #3b82f6;
              cursor: pointer;
              box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.3);
              transition: all 0.2s ease;
            }
            input[type=range]::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 20px 25px -5px rgb(59 130 246 / 0.4);
            }
            input[type=range] { direction: ltr; }
          `,
        }}
      />
    </div>
  );
}
