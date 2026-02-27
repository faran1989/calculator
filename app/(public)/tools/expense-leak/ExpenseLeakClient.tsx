'use client';

import { useMemo, useState } from 'react';
import { analyseExpenseLeak, buildToolRunRawData } from '@/lib/tools/expense-leak/engine';
import type { ExpenseLeakInput, ExpenseLeakMode } from '@/lib/tools/expense-leak/types';
import { saveToolRun } from '@/lib/toolRun/client';
import { toolConfig } from './tool.config';

type NumberInputEvent = React.ChangeEvent<HTMLInputElement>;

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

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

  const [quickByCategory, setQuickByCategory] = useState<NonNullable<ExpenseLeakInput['quick']>>({
    byCategory: {},
  });

  const output = useMemo(() => {
    const monthlyIncome = parseNumber(income);
    if (!monthlyIncome) return null;

    const input: ExpenseLeakInput = {
      profile,
      monthlyIncome,
      monthlySaving: parseNumber(saving),
      emergencyFundBalance: parseNumber(emergencyFund),
      inflationRatePercent: parseNumber(inflation),
      mode,
      quick: mode !== 'detailed' ? quickByCategory : undefined,
      detailed: undefined,
      annualItems: [],
      customItems: [],
    };

    return analyseExpenseLeak(input);
  }, [income, saving, emergencyFund, inflation, profile, mode, quickByCategory]);

  async function handleAnalyze() {
    setError(null);

    if (!output) {
      setError('اول درآمد ماهانه را وارد کن.');
      return;
    }

    setLoading(true);
    try {
      const rawData = buildToolRunRawData(output);
      const summaryText = `درآمد: ${output.summary.income.toLocaleString('fa-IR')}، ` +
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
    } catch (e) {
      setError('ثبت نتیجه در سرور با خطا مواجه شد. لطفاً بعداً دوباره امتحان کن.');
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryQuickChange(cat: 'housing' | 'food' | 'transport' | 'lifestyle' | 'health' | 'bills' | 'finance') {
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
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
                <label className="mb-1 block font-bold text-slate-600">پس‌انداز ماهانه (اختیاری)</label>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
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

      {output && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3 md:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
          </div>

          <div className="space-y-3 md:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-black text-slate-800">دسته‌ها</h3>
              <div className="space-y-1 text-[11px] text-slate-700">
                {output.categories
                  .filter((c) => c.id !== 'saving')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
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
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 md:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-black text-slate-800">
                  مقایسه با افراد مشابه
                </h3>
                <div className="space-y-1 text-[11px] text-slate-700">
                  {output.peers.slice(0, 4).map((p) => (
                    <div
                      key={p.categoryId}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{p.label}</span>
                        <span className="text-[10px] text-slate-500">
                          شما: {p.userPercent.toFixed(0)}٪ — مشابه‌ها: حدود{' '}
                          {p.peerAveragePercent.toFixed(0)}٪
                        </span>
                      </div>
                      <span className="text-left text-[10px] text-slate-600">
                        {p.statusLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

