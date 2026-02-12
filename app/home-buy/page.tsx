'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import Head from 'next/head';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';

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
  inflationCustom: string;

  savingScenario: SavingScenario;
  savingCustom: string;

  salaryScenario?: 'none' | 'custom';
  salaryCustom?: string;

  showDetails?: boolean;
};

type ParsedNumber = number | null;

function isFiniteNumber(n: number) {
  return Number.isFinite(n) && !Number.isNaN(n);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toEnDigits(input: string) {
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };

  return input.replace(/[۰-۹٠-٩]/g, (d) => map[d] ?? d);
}

function sanitizeNumericString(raw: string) {
  // keep digits + separators, remove letters
  const s = toEnDigits(raw ?? '')
    .replace(/[^\d.,\-]/g, '')
    .trim();

  // allow only one minus at start
  const minusStripped = s.replace(/(?!^)-/g, '');

  // normalize commas
  // keep dots as decimal if user enters
  return minusStripped;
}

function parseNumber(raw: string): ParsedNumber {
  const s = sanitizeNumericString(raw);
  if (!s) return null;

  // remove thousand separators (commas)
  const normalized = s.replace(/,/g, '');
  const n = Number(normalized);

  if (!Number.isFinite(n)) return null;
  return n;
}

function formatToman(n: number) {
  try {
    return new Intl.NumberFormat('fa-IR').format(Math.round(n));
  } catch {
    return String(Math.round(n));
  }
}

function formatPercent(n: number) {
  const v = Math.round(n * 10) / 10;
  try {
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(v);
  } catch {
    return String(v);
  }
}

function safeGet(sp: ReadonlyURLSearchParams, key: string) {
  const v = sp.get(key);
  return v == null ? '' : v;
}

function sanitizeQueryValue(v: string) {
  // Keep short values to avoid huge URLs.
  // Also remove line breaks.
  const cleaned = (v ?? '').replace(/[\r\n]+/g, ' ').trim();
  if (cleaned.length > 120) return cleaned.slice(0, 120);
  return cleaned;
}

function parseInputsFromSearchParams(sp: ReadonlyURLSearchParams): Partial<Inputs> {
  const out: Partial<Inputs> = {};

  const inflationScenario = sp.get('inf');
  const savingScenario = sp.get('sav');
  const salaryScenario = sp.get('sal');

  const showDetails = sp.get('d');

  out.price = sanitizeQueryValue(safeGet(sp, 'p'));
  out.currentSavings = sanitizeQueryValue(safeGet(sp, 's0'));
  out.monthlySaving = sanitizeQueryValue(safeGet(sp, 'm0'));

  out.realizationPercent = sanitizeQueryValue(safeGet(sp, 'r'));

  if (inflationScenario === 'low' || inflationScenario === 'base' || inflationScenario === 'high' || inflationScenario === 'custom') {
    out.inflationScenario = inflationScenario;
  }

  out.inflationCustom = sanitizeQueryValue(safeGet(sp, 'infc'));

  if (savingScenario === 'bank' || savingScenario === 'value' || savingScenario === 'growth' || savingScenario === 'custom') {
    out.savingScenario = savingScenario;
  }

  out.savingCustom = sanitizeQueryValue(safeGet(sp, 'savc'));

  if (salaryScenario === 'none' || salaryScenario === 'custom') {
    out.salaryScenario = salaryScenario;
  }
  out.salaryCustom = sanitizeQueryValue(safeGet(sp, 'salc'));

  out.showDetails = showDetails === '1';

  return out;
}

function buildSearchParamsFromInputs(i: Inputs) {
  const sp = new URLSearchParams();

  const setIf = (key: string, val: string) => {
    const v = sanitizeQueryValue(val);
    if (v !== '') sp.set(key, v);
  };

  setIf('p', i.price);
  setIf('s0', i.currentSavings);
  setIf('m0', i.monthlySaving);

  setIf('r', i.realizationPercent);

  if (i.inflationScenario) sp.set('inf', i.inflationScenario);
  setIf('infc', i.inflationCustom);

  if (i.savingScenario) sp.set('sav', i.savingScenario);
  setIf('savc', i.savingCustom);

  if (i.salaryScenario) sp.set('sal', i.salaryScenario);
  setIf('salc', i.salaryCustom ?? '');

  if (i.showDetails) sp.set('d', '1');

  return sp;
}

function monthsToHuman(m: number) {
  if (!isFiniteNumber(m) || m <= 0) return 'همین الان';
  const months = Math.round(m);

  if (months < 12) return `حدود ${formatToman(months)} ماه`;
  const years = Math.ceil(months / 12);
  return `حدود ${formatToman(years)} سال`;
}

function calcMonthsToBuyHouse(params: {
  price: number;
  currentSavings: number;
  monthlySaving: number;
  realizationPercent: number; // percent
  inflationRateYearly: number; // percent
  savingReturnYearly: number; // percent
  salaryGrowthYearly?: number; // percent
}) {
  // NOTE: This is whatever your original model is — untouched.
  const {
    price,
    currentSavings,
    monthlySaving,
    realizationPercent,
    inflationRateYearly,
    savingReturnYearly,
    salaryGrowthYearly = 0,
  } = params;

  // Guard
  if (!isFiniteNumber(price) || price <= 0) return { months: Infinity, details: [] as any[] };
  if (!isFiniteNumber(currentSavings) || currentSavings < 0) return { months: Infinity, details: [] as any[] };
  if (!isFiniteNumber(monthlySaving) || monthlySaving < 0) return { months: Infinity, details: [] as any[] };

  const r = clamp(realizationPercent / 100, 0, 1);
  const infM = Math.pow(1 + inflationRateYearly / 100, 1 / 12) - 1;
  const savM = Math.pow(1 + savingReturnYearly / 100, 1 / 12) - 1;
  const salM = Math.pow(1 + salaryGrowthYearly / 100, 1 / 12) - 1;

  let p = price;
  let s = currentSavings;
  let m0 = monthlySaving;

  const details: Array<{
    month: number;
    housePrice: number;
    savings: number;
    monthlySaving: number;
  }> = [];

  // hard safety cap
  const MAX_MONTHS = 1200; // 100y
  for (let month = 1; month <= MAX_MONTHS; month++) {
    // house price inflation
    p *= 1 + infM;

    // savings return
    s *= 1 + savM;

    // add monthly saving
    s += m0;

    // salary growth affects monthly saving baseline
    m0 *= 1 + salM;

    if (details.length < 240) {
      details.push({ month, housePrice: p, savings: s, monthlySaving: m0 });
    }

    if (s >= p * r) {
      return { months: month, details };
    }
  }

  return { months: Infinity, details };
}

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputs, setInputs] = useState<Inputs>({
    price: '',
    currentSavings: '',
    monthlySaving: '',
    realizationPercent: '20',

    inflationScenario: 'base',
    inflationCustom: '30',

    savingScenario: 'bank',
    savingCustom: '20',

    salaryScenario: 'none',
    salaryCustom: '0',

    showDetails: false,
  });

  // sync initial from URL
  useEffect(() => {
    if (!searchParams) return;
    const parsed = parseInputsFromSearchParams(searchParams);
    if (Object.keys(parsed).length === 0) return;
    setInputs((prev) => ({ ...prev, ...parsed }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update URL (debounced)
  const urlUpdateTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!searchParams) return;

    if (urlUpdateTimer.current) window.clearTimeout(urlUpdateTimer.current);
    urlUpdateTimer.current = window.setTimeout(() => {
      const sp = buildSearchParamsFromInputs(inputs);
      const next = sp.toString();
      const current = searchParams.toString();
      if (next !== current) {
        router.replace(`${pathname}?${next}`, { scroll: false });
      }
    }, 300);

    return () => {
      if (urlUpdateTimer.current) window.clearTimeout(urlUpdateTimer.current);
    };
  }, [inputs, pathname, router, searchParams]);

  const parsedNums = useMemo(() => {
    const price = parseNumber(inputs.price);
    const s0 = parseNumber(inputs.currentSavings);
    const m0 = parseNumber(inputs.monthlySaving);
    const r = parseNumber(inputs.realizationPercent);

    const infCustom = parseNumber(inputs.inflationCustom);
    const savCustom = parseNumber(inputs.savingCustom);
    const salCustom = parseNumber(inputs.salaryCustom ?? '');

    return {
      price,
      s0,
      m0,
      r,
      infCustom,
      savCustom,
      salCustom,
    };
  }, [inputs]);

  const scenarioRates = useMemo(() => {
    const inflationRateYearly =
      inputs.inflationScenario === 'low'
        ? 20
        : inputs.inflationScenario === 'high'
          ? 50
          : inputs.inflationScenario === 'custom'
            ? parsedNums.infCustom ?? 30
            : 30;

    const savingReturnYearly =
      inputs.savingScenario === 'bank'
        ? 20
        : inputs.savingScenario === 'value'
          ? 30
          : inputs.savingScenario === 'growth'
            ? 40
            : inputs.savingScenario === 'custom'
              ? parsedNums.savCustom ?? 20
              : 20;

    const salaryGrowthYearly =
      inputs.salaryScenario === 'custom' ? parsedNums.salCustom ?? 0 : 0;

    return {
      inflationRateYearly,
      savingReturnYearly,
      salaryGrowthYearly,
    };
  }, [inputs, parsedNums]);

  const result = useMemo(() => {
    if (!isFiniteNumber(parsedNums.price ?? NaN) || (parsedNums.price ?? 0) <= 0) {
      return { ok: false as const, message: 'قیمت خانه را وارد کنید.' };
    }
    if (!isFiniteNumber(parsedNums.s0 ?? NaN) || (parsedNums.s0 ?? 0) < 0) {
      return { ok: false as const, message: 'پس‌انداز فعلی معتبر نیست.' };
    }
    if (!isFiniteNumber(parsedNums.m0 ?? NaN) || (parsedNums.m0 ?? 0) < 0) {
      return { ok: false as const, message: 'پس‌انداز ماهانه معتبر نیست.' };
    }
    if (!isFiniteNumber(parsedNums.r ?? NaN) || (parsedNums.r ?? 0) < 0) {
      return { ok: false as const, message: 'درصد تحقق معتبر نیست.' };
    }

    const res = calcMonthsToBuyHouse({
      price: parsedNums.price!,
      currentSavings: parsedNums.s0 ?? 0,
      monthlySaving: parsedNums.m0 ?? 0,
      realizationPercent: parsedNums.r ?? 20,
      inflationRateYearly: scenarioRates.inflationRateYearly,
      savingReturnYearly: scenarioRates.savingReturnYearly,
      salaryGrowthYearly: scenarioRates.salaryGrowthYearly,
    });

    if (!isFiniteNumber(res.months)) {
      return { ok: true as const, months: Infinity, details: res.details };
    }

    return { ok: true as const, months: res.months, details: res.details };
  }, [parsedNums, scenarioRates]);

  const headline = useMemo(() => {
    if (!result.ok) return '—';
    if (!isFiniteNumber(result.months) || result.months === Infinity) return 'بسیار طولانی';
    return monthsToHuman(result.months);
  }, [result]);

  return (
    <>
      <Head>
        <title>تخمین خرید خانه | تخمینو</title>
        <meta name="description" content="تخمین زمان خرید خانه با فرض شرایط فعلی" />
      </Head>

      <main className={vazirmatn.className} dir="rtl">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <ToolHeader
            icon={<Home className="h-5 w-5" />}
            title="تخمین خرید خانه"
            subtitle="اگر شرایط فعلی تغییر نکند"
            helpText={
              <div className="space-y-2 text-sm leading-7">
                <p>این ابزار یک «تخمین» است و قطعیت ندارد.</p>
                <p>
                  خروجی بر اساس ورودی‌های شما و نرخ‌های انتخابی محاسبه می‌شود.
                  اگر عدد خیلی بزرگ شد، یعنی فاصله‌ی قیمت خانه با توان پس‌انداز فعلی زیاد است.
                </p>
              </div>
            }
          />

          {/* فرم */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-700">قیمت خانه (تومان)</span>
                <input
                  value={inputs.price}
                  onChange={(e) => setInputs((p) => ({ ...p, price: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  inputMode="numeric"
                  placeholder="مثلاً ۳٬۵۰۰٬۰۰۰٬۰۰۰"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-700">پس‌انداز فعلی (تومان)</span>
                <input
                  value={inputs.currentSavings}
                  onChange={(e) => setInputs((p) => ({ ...p, currentSavings: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  inputMode="numeric"
                  placeholder="مثلاً ۲۰۰٬۰۰۰٬۰۰۰"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-700">پس‌انداز ماهانه (تومان)</span>
                <input
                  value={inputs.monthlySaving}
                  onChange={(e) => setInputs((p) => ({ ...p, monthlySaving: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  inputMode="numeric"
                  placeholder="مثلاً ۱۵٬۰۰۰٬۰۰۰"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-700">درصد تحقق (مثلاً پیش‌پرداخت) %</span>
                <input
                  value={inputs.realizationPercent}
                  onChange={(e) => setInputs((p) => ({ ...p, realizationPercent: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  inputMode="numeric"
                  placeholder="مثلاً ۲۰"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 text-sm font-semibold text-slate-800">سناریوی تورم خانه</div>
                <select
                  value={inputs.inflationScenario}
                  onChange={(e) => setInputs((p) => ({ ...p, inflationScenario: e.target.value as InflationScenario }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  <option value="low">کم (۲۰٪ سالانه)</option>
                  <option value="base">معمولی (۳۰٪ سالانه)</option>
                  <option value="high">زیاد (۵۰٪ سالانه)</option>
                  <option value="custom">سفارشی</option>
                </select>

                {inputs.inflationScenario === 'custom' && (
                  <div className="mt-2">
                    <input
                      value={inputs.inflationCustom}
                      onChange={(e) => setInputs((p) => ({ ...p, inflationCustom: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      inputMode="numeric"
                      placeholder="مثلاً ۳۵"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 text-sm font-semibold text-slate-800">سناریوی رشد پس‌انداز</div>
                <select
                  value={inputs.savingScenario}
                  onChange={(e) => setInputs((p) => ({ ...p, savingScenario: e.target.value as SavingScenario }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  <option value="bank">بانکی (۲۰٪ سالانه)</option>
                  <option value="value">همگام ارزش (۳۰٪ سالانه)</option>
                  <option value="growth">پرریسک‌تر (۴۰٪ سالانه)</option>
                  <option value="custom">سفارشی</option>
                </select>

                {inputs.savingScenario === 'custom' && (
                  <div className="mt-2">
                    <input
                      value={inputs.savingCustom}
                      onChange={(e) => setInputs((p) => ({ ...p, savingCustom: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      inputMode="numeric"
                      placeholder="مثلاً ۲۵"
                    />
                  </div>
                )}
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!inputs.showDetails}
                onChange={(e) => setInputs((p) => ({ ...p, showDetails: e.target.checked }))}
              />
              نمایش جزئیات
            </label>
          </section>

          {/* نتیجه */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-600">زمان تقریبی رسیدن</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{headline}</div>

            {result.ok ? (
              <div className="mt-2 text-sm text-slate-600">
                <span>درصد تحقق: </span>
                <span className="font-semibold text-slate-800">{formatPercent(parseNumber(inputs.realizationPercent) ?? 20)}٪</span>
                <span className="mx-2">•</span>
                <span>تورم سالانه: </span>
                <span className="font-semibold text-slate-800">{formatPercent(scenarioRates.inflationRateYearly)}٪</span>
                <span className="mx-2">•</span>
                <span>بازده پس‌انداز: </span>
                <span className="font-semibold text-slate-800">{formatPercent(scenarioRates.savingReturnYearly)}٪</span>
              </div>
            ) : (
              <div className="mt-2 text-sm text-rose-600">{result.message}</div>
            )}

            {result.ok && inputs.showDetails && Array.isArray(result.details) && result.details.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-slate-600">
                    <tr className="border-b">
                      <th className="py-2 text-right font-semibold">ماه</th>
                      <th className="py-2 text-right font-semibold">قیمت خانه</th>
                      <th className="py-2 text-right font-semibold">پس‌انداز</th>
                      <th className="py-2 text-right font-semibold">پس‌انداز ماهانه</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-800">
                    {result.details.slice(0, 120).map((row: any) => (
                      <tr key={row.month} className="border-b last:border-b-0">
                        <td className="py-2">{formatToman(row.month)}</td>
                        <td className="py-2">{formatToman(row.housePrice)}</td>
                        <td className="py-2">{formatToman(row.savings)}</td>
                        <td className="py-2">{formatToman(row.monthlySaving)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-xs text-slate-500">
                  (برای سبک ماندن صفحه، جدول فقط بخشی از ماه‌ها را نشان می‌دهد.)
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
