'use client';

import { useMemo, useState } from 'react';
import { analyseExpenseLeak, buildToolRunRawData } from '@/lib/tools/expense-leak/engine';
import type { ExpenseLeakInput, ExpenseLeakMode } from '@/lib/tools/expense-leak/types';
import { saveToolRun } from '@/lib/toolRun/client';
import { toolConfig } from './tool.config';

type NumberInputEvent = React.ChangeEvent<HTMLInputElement>;
type SelectEvent = React.ChangeEvent<HTMLSelectElement>;

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export default function ExpenseLeakClient() {
  const [mode, setMode] = useState<ExpenseLeakMode>('quick');
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [income, setIncome] = useState('');
  const [saving, setSaving] = useState('');
  const [emergencyFund, setEmergencyFund] = useState('');
  const [inflation, setInflation] = useState('35');

  const [profile, setProfile] = useState({
    housing: 'renter' as const,
    family: 'single' as const,
    city: 'tehran' as const,
  });

  const [quickByCategory, setQuickByCategory] = useState<
    NonNullable<ExpenseLeakInput['quick']>
  >({
    byCategory: {},
  });

  const [annualItemsForm, setAnnualItemsForm] = useState<
    { id: string; label: string; monthName: string; amount: string }[]
  >([
    { id: 'annual_insurance', label: 'بیمه سالانه', monthName: 'اسفند', amount: '' },
    { id: 'annual_travel', label: 'سفر سالانه', monthName: 'شهریور', amount: '' },
    { id: 'annual_tuition', label: 'شهریه/کلاس', monthName: 'مهر', amount: '' },
  ]);

  const [customItemsForm, setCustomItemsForm] = useState<
    { id: string; name: string; amount: string }[]
  >([]);

  const output = useMemo(() => {
    const monthlyIncome = parseNumber(income);
    if (!monthlyIncome) return null;

    const annualItems: ExpenseLeakInput['annualItems'] = annualItemsForm
      .map((row) => ({
        id: row.id,
        label: row.label,
        monthName: row.monthName,
        amount: parseNumber(row.amount),
      }))
      .filter((it) => it.amount > 0);

    const customItems: ExpenseLeakInput['customItems'] = customItemsForm
      .map((row) => ({
        name: row.name.trim(),
        amount: parseNumber(row.amount),
      }))
      .filter((it) => it.name && it.amount > 0);

    const input: ExpenseLeakInput = {
      profile,
      monthlyIncome,
      monthlySaving: parseNumber(saving),
      emergencyFundBalance: parseNumber(emergencyFund),
      inflationRatePercent: parseNumber(inflation),
      mode,
      quick: mode !== 'detailed' ? quickByCategory : undefined,
      detailed: undefined,
      annualItems,
      customItems,
    };

    return analyseExpenseLeak(input);
  }, [income, saving, emergencyFund, inflation, profile, mode, quickByCategory, annualItemsForm, customItemsForm]);

  async function handleAnalyze() {
    setError(null);

    const monthlyIncome = parseNumber(income);
    if (!monthlyIncome) {
      setError('اول درآمد ماهانه را وارد کن.');
      return;
    }

    if (parseNumber(inflation) > 100) {
      setError('نرخ تورم را به‌صورت درصد معقول (مثلاً بین ۰ تا ۱۰۰) وارد کن.');
      return;
    }

    const anyCategory =
      Object.values(quickByCategory.byCategory ?? {}).some((v) => (v ?? 0) > 0) ||
      customItemsForm.some((c) => parseNumber(c.amount) > 0);
    if (!anyCategory) {
      setError('حداقل برای یک دسته یا یک آیتم سفارشی، عددی وارد کن تا تحلیلی معنادار به‌دست آید.');
      return;
    }

    if (!output) {
      setError('ورودی‌ها کافی نیستند؛ مقادیر را دوباره بررسی کن.');
      return;
    }

    setLoading(true);
    try {
      const rawData = buildToolRunRawData(output);
      const summaryText =
        `درآمد: ${output.summary.income.toLocaleString('fa-IR')}، ` +
        `کل هزینه‌ها: ${output.summary.totalExpenses.toLocaleString('fa-IR')}، ` +
        `تراز: ${output.summary.balance.toLocaleString('fa-IR')}، ` +
        `نمره سلامت مالی: ${output.health.score}`;

      await saveToolRun({
        toolSlug: toolConfig.slug,
        toolName: toolConfig.toolName,
        version: '1',
        summary: summaryText,
        rawData,
      });

      setHasAnalyzed(true);
    } catch {
      setError('ثبت نتیجه در سرور با خطا مواجه شد. لطفاً بعداً دوباره امتحان کن.');
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryQuickChange(
    cat: 'housing' | 'food' | 'transport' | 'lifestyle' | 'health' | 'bills' | 'finance',
  ) {
    return (e: NumberInputEvent) => {
      const value = e.target.value;
      setQuickByCategory((prev) => ({
        byCategory: {
          ...(prev?.byCategory ?? {}),
          [cat]: parseNumber(value),
        },
      }));
    };
  }

  function handleAnnualAmountChange(index: number) {
    return (e: NumberInputEvent) => {
      const value = e.target.value;
      setAnnualItemsForm((rows) =>
        rows.map((row, i) => (i === index ? { ...row, amount: value } : row)),
      );
    };
  }

  function handleAnnualMonthChange(index: number) {
    return (e: SelectEvent) => {
      const value = e.target.value;
      setAnnualItemsForm((rows) =>
        rows.map((row, i) => (i === index ? { ...row, monthName: value } : row)),
      );
    };
  }

  function addCustomItem() {
    setCustomItemsForm((items) => {
      if (items.length >= 5) return items;
      return [...items, { id: `custom_${items.length + 1}`, name: '', amount: '' }];
    });
  }

  function handleCustomChange(index: number, field: 'name' | 'amount') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCustomItemsForm((items) =>
        items.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
      );
    };
  }

  const canAnalyze = parseNumber(income) > 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-black text-slate-800">پروفایل</h2>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-600">مسکن:</span>
                {[
                  { id: 'renter', label: 'مستاجر' },
                  { id: 'owned_mortgage', label: 'قسط‌دار' },
                  { id: 'owned_paid', label: 'مالک' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, housing: opt.id as any }))}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                      profile.housing === opt.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-600">خانواده:</span>
                {[
                  { id: 'single', label: 'تنها' },
                  { id: 'couple', label: 'زوج' },
                  { id: 'family4', label: '۳–۴ نفر' },
                  { id: 'family5', label: '۵+ نفر' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, family: opt.id as any }))}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                      profile.family === opt.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-600">شهر:</span>
                {[
                  { id: 'tehran', label: 'تهران' },
                  { id: 'big', label: 'کلانشهر' },
                  { id: 'mid', label: 'شهر متوسط' },
                  { id: 'small', label: 'شهر کوچک' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, city: opt.id as any }))}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                      profile.city === opt.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-800">ورودی‌های اصلی</h2>
            <div className="grid gap-3 text-xs md:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-slate-600">درآمد خالص ماهانه</label>
                <input
                  dir="ltr"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  placeholder="مثلاً 30000000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-600">
                  پس‌انداز ماهانه (اختیاری)
                </label>
                <input
                  dir="ltr"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  placeholder="0"
                  value={saving}
                  onChange={(e) => setSaving(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-600">
                  موجودی صندوق اضطراری (اختیاری)
                </label>
                <input
                  dir="ltr"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  placeholder="0"
                  value={emergencyFund}
                  onChange={(e) => setEmergencyFund(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-600">
                  نرخ تورم سالانه پیش‌بینی‌شده (%)
                </label>
                <input
                  dir="ltr"
                  inputMode="decimal"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  placeholder="35"
                  value={inflation}
                  onChange={(e) => setInflation(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-slate-800">هزینه‌های ماهانه — حالت سریع</h2>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <button
                type="button"
                className={`rounded-full px-2 py-1 ${
                  mode === 'quick'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => setMode('quick')}
              >
                حالت سریع
              </button>
              <button
                type="button"
                className="cursor-not-allowed rounded-full bg-slate-50 px-2 py-1 text-slate-400"
              >
                حالت دقیق (به‌زودی)
              </button>
            </div>
          </div>
          <p className="text-xs leading-6 text-slate-600">
            اگر حوصله ریزکردن ندارید، برای هر دسته فقط یک عدد کلی ماهانه وارد کنید. بعداً می‌توانیم
            نسخه دقیق را روی همین مدل داده‌ای گسترش دهیم.
          </p>

          <div className="grid gap-3 text-xs md:grid-cols-2">
            {(
              [
                { id: 'housing', label: 'مسکن' },
                { id: 'food', label: 'خوراک' },
                { id: 'transport', label: 'حمل‌ونقل' },
                { id: 'lifestyle', label: 'سبک زندگی' },
                { id: 'health', label: 'سلامت و بهداشت' },
                { id: 'bills', label: 'قبوض' },
                { id: 'finance', label: 'بدهی‌ها' },
              ] as const
            ).map((cat) => (
              <div key={cat.id}>
                <label className="mb-1 block font-bold text-slate-600">{cat.label}</label>
                <input
                  dir="ltr"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  placeholder="0"
                  value={quickByCategory.byCategory[cat.id] ?? ''}
                  onChange={handleCategoryQuickChange(cat.id)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
            <h3 className="text-xs font-black text-slate-800">هزینه‌های بزرگ سالانه</h3>
            <p className="text-[11px] text-slate-600">
              این بخش به تخمین شوک‌های سالانه (بیمه، سفر، شهریه و …) کمک می‌کند تا در heatmap
              دیده شوند.
            </p>
            <div className="space-y-2 text-[11px] text-slate-700">
              {annualItemsForm.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[2fr,1fr] items-end gap-2">
                  <div>
                    <label className="mb-1 block font-bold text-slate-600">{row.label}</label>
                    <input
                      dir="ltr"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                      placeholder="0"
                      value={row.amount}
                      onChange={handleAnnualAmountChange(index)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-600">
                      ماه پرداخت
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                      value={row.monthName}
                      onChange={handleAnnualMonthChange(index)}
                    >
                      {PERSIAN_MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800">هزینه‌های سفارشی ماهانه</h3>
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                  disabled={customItemsForm.length >= 5}
                >
                  افزودن آیتم
                </button>
              </div>
              {customItemsForm.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  اگر هزینه تکرارشونده‌ای داری که در دسته‌های بالا جا نمی‌شود، اینجا اضافه کن.
                </p>
              )}
              <div className="space-y-2 text-[11px] text-slate-700">
                {customItemsForm.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[1.4fr,1fr] gap-2">
                    <input
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                      placeholder="نام آیتم (مثلاً کلاس زبان)"
                      value={row.name}
                      onChange={handleCustomChange(index, 'name')}
                    />
                    <input
                      dir="ltr"
                      inputMode="numeric"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-bold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                      placeholder="0"
                      value={row.amount}
                      onChange={handleCustomChange(index, 'amount')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-600">
          اول درآمد ماهانه را وارد کن، بعد حداقل چند دسته هزینه را پر کن تا تصویر کلی بسازیم.
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs font-bold text-red-600">{error}</span>}
          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {loading ? 'در حال تحلیل…' : hasAnalyzed ? 'تحلیل مجدد و ذخیره' : 'تحلیل کن و ذخیره کن'}
          </button>
        </div>
      </div>

      {hasAnalyzed && output && (
        <div className="grid gap-4 md:grid-cols-3 transition-all duration-300">
          <div className="space-y-3 md:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
              <h3 className="mb-2 text-sm font-black text-slate-800">خلاصه عددی</h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span>درآمد ماهانه</span>
                  <span className="font-bold">
                    {output.summary.income.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>کل هزینه‌ها (بدون پس‌انداز)</span>
                  <span className="font-bold">
                    {output.summary.totalExpenses.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>پس‌انداز ماهانه</span>
                  <span className="font-bold text-emerald-700">
                    {output.summary.saving.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>تراز ماهانه</span>
                  <span
                    className={`font-bold ${
                      output.summary.balance >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {output.summary.balance.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                {output.summary.totalAnnualAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>میانگین ماهانه هزینه‌های سالانه</span>
                    <span className="font-bold text-amber-700">
                      {output.summary.annualMonthly.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
              <h3 className="mb-2 text-sm font-black text-slate-800">نمره سلامت مالی</h3>
              <div className="text-3xl font-black text-slate-900">
                {output.health.score.toLocaleString('fa-IR')}
              </div>
              <div className="mt-1 text-xs font-bold text-slate-600">
                سطح: {output.health.levelLabel}
              </div>
              <ul className="mt-3 space-y-1 text-[11px] text-slate-600">
                {output.health.factors.map((f, i) => (
                  <li key={i}>• {f.label}</li>
                ))}
              </ul>
            </div>

            {output.rule5030 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
                <h3 className="mb-2 text-sm font-black text-slate-800">تحلیل ۵۰ / ۳۰ / ۲۰</h3>
                <div className="space-y-2 text-[11px] text-slate-700">
                  {output.rule5030.slices.map((s) => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{s.label}</span>
                        <span className="text-slate-600">
                          هدف: {s.targetPercent}٪ — فعلی: {s.actualPercent.toFixed(0)}٪
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${Math.min(100, s.actualPercent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {output.rule5030.note && (
                    <p className="mt-1 text-[11px] text-slate-600">{output.rule5030.note}</p>
                  )}
                </div>
              </div>
            )}

            {output.fragility && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
                <h3 className="mb-2 text-sm font-black text-slate-800">شکنندگی مالی</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">هزینه‌های ثابت از درآمد</span>
                  <span className="font-bold text-slate-900">
                    {output.fragility.fixedExpensePercent.toFixed(0)}٪
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-600">{output.fragility.label}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 md:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
              <h3 className="mb-2 text-sm font-black text-slate-800">دسته‌ها</h3>
              <div className="space-y-1 text-[11px] text-slate-700">
                {output.categories
                  .filter((c) => c.id !== 'saving')
                  .map((c) => (
                    <div key={c.id} className="space-y-1 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{c.label}</span>
                          <span className="text-[10px] text-slate-500">
                            {c.amount.toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-[11px] font-bold text-slate-700">
                            {c.percentOfIncome.toFixed(0)}٪ از درآمد
                          </div>
                          {c.tagText && (
                            <div className="text-[10px] text-slate-500">{c.tagText}</div>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            c.status === 'very_high'
                              ? 'bg-red-500'
                              : c.status === 'high'
                                ? 'bg-orange-500'
                                : c.status === 'slightly_high'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, c.percentOfIncome)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {output.darkMoney && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
                <h3 className="mb-2 text-sm font-black text-slate-800">پول تاریک (Dark Money)</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">حجم نشت انعطاف‌پذیر تخمینی</span>
                  <span className="font-bold text-slate-900">
                    {output.darkMoney.darkAmount.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  حدود {output.darkMoney.percentOfIncome.toFixed(1)}٪ از درآمد ماهانه
                </div>
                <p className="mt-2 text-[11px] text-slate-600">{output.darkMoney.label}</p>
                {output.darkMoney.note && (
                  <p className="mt-1 text-[10px] text-slate-500">{output.darkMoney.note}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 md:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
              <h3 className="mb-2 text-sm font-black text-slate-800">نشت‌های اصلی</h3>
              {output.leaks.length === 0 ? (
                <p className="text-xs text-slate-600">
                  در حال حاضر دسته‌ای که خیلی خارج از بازه هدف باشد شناسایی نشده است.
                </p>
              ) : (
                <div className="space-y-2 text-xs text-slate-700">
                  {output.leaks.map((leak, i) => (
                    <div
                      key={leak.categoryId}
                      className="rounded-xl border border-red-100 bg-red-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900">
                          {i + 1}. {leak.categoryLabel}
                        </div>
                        <div className="text-[11px] font-bold text-red-600">
                          {leak.percentOfIncome.toFixed(0)}٪ از درآمد
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-700">{leak.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {output.peers.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
                <h3 className="mb-2 text-sm font-black text-slate-800">
                  مقایسه با افراد مشابه
                </h3>
                <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-700 sm:grid-cols-2">
                  {output.peers.map((p) => (
                    <div
                      key={p.categoryId}
                      className="space-y-1 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{p.label}</span>
                        <span className="text-left text-[10px] text-slate-600">
                          {p.statusLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        شما: {p.userPercent.toFixed(0)}٪ — مشابه‌ها: حدود{' '}
                        {p.peerAveragePercent.toFixed(0)}٪ (بازه{' '}
                        {p.peerRangePercent[0].toFixed(0)}–{p.peerRangePercent[1].toFixed(0)}٪)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {output.heatmap && output.summary.totalAnnualAmount > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
                <h3 className="mb-2 text-sm font-black text-slate-800">
                  نقشه حرارتی ۱۲ ماهه هزینه‌های سالانه
                </h3>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-700 sm:grid-cols-6">
                  {output.heatmap.months.map((m) => {
                    const intensity = m.percentOfAnnual ?? 0;
                    const bg =
                      intensity === 0
                        ? 'bg-slate-50'
                        : intensity < 10
                          ? 'bg-emerald-50'
                          : intensity < 25
                            ? 'bg-emerald-100'
                            : intensity < 40
                              ? 'bg-emerald-200'
                              : 'bg-emerald-300';
                    return (
                      <div
                        key={m.monthLabel}
                        className={`rounded-xl border border-slate-200 px-2 py-2 ${bg}`}
                      >
                        <div className="font-bold text-slate-800">{m.monthLabel}</div>
                        <div className="mt-1 text-[9px] text-slate-600">
                          {m.amount > 0
                            ? `${m.amount.toLocaleString('fa-IR')} تومان`
                            : 'بدون آیتم'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {output.heatmap.peakMonthLabel && (
                  <p className="mt-2 text-[11px] text-slate-600">
                    بیشترین فشار هزینه سالانه در ماه «{output.heatmap.peakMonthLabel}» است؛ اگر
                    می‌خواهید شوک نقدینگی را کم کنید، از همین ماه برای برنامه‌ریزی شروع کنید.
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300">
              <h3 className="mb-2 text-sm font-black text-slate-800">
                پیشنهادهای عملی برای ۳۰ روز آینده
              </h3>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {output.leaks.length > 0 ? (
                  <>
                    <li>
                      • برای دسته «{output.leaks[0].categoryLabel}» یک سقف ماهانه مشخص کن و آن را
                      ۲۰–۳۰٪ پایین‌تر از عدد فعلی قرار بده.
                    </li>
                    {output.leaks[1] && (
                      <li>
                        • در دسته «{output.leaks[1].categoryLabel}» فقط یک یا دو آیتم پرهزینه را
                        انتخاب کن و به‌جای حذف کامل، نسخه ارزان‌ترشان را امتحان کن.
                      </li>
                    )}
                  </>
                ) : (
                  <li>
                    • نشت بزرگی شناسایی نشد؛ می‌توانی روی افزایش تدریجی پس‌انداز یا تکمیل صندوق
                    اضطراری تمرکز کنی.
                  </li>
                )}
                <li>
                  • یک بار در ماه، این ابزار را با اعداد به‌روزشده تکرار کن تا ببینی روند به سمت
                  بهبود حرکت می‌کند یا نه.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

