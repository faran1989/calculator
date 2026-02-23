// app/tools/loan/loanClient.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  BookOpen,
  Info,
  Facebook,
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calculator,
  RotateCcw,
  CheckCircle2,
  LayoutGrid,
  Wallet,
  TrendingUp,
  Table as TableIcon,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { toolConfig } from './tool.config';
import { saveToolRun } from '@/lib/toolRun/client';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

type TabKey = 'tool' | 'about';

type MenuItem = {
  slug: 'home' | 'tools' | 'learn' | 'about';
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type FaqItem = { q: string; a: string };

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden" key={i} data-faq-item>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-right"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-xs sm:text-sm text-slate-200">{item.q}</span>
              {isOpen ? (
                <ChevronUp size={18} className="text-slate-400" />
              ) : (
                <ChevronDown size={18} className="text-slate-500" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 sm:px-5 pb-4"
                >
                  <div className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// =========================
// Loan Tool Types + Logic (UNCHANGED)
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

// نمایش با جداکننده هزار + اعداد فارسی
const formatCurrency = (val: number) => {
  const safe = Number.isFinite(val) ? val : 0;
  const s = new Intl.NumberFormat('fa-IR').format(Math.round(safe));
  return toPersianDigits(s);
};

// Amount input formatting: grouping + Persian digits
const formatAmountInput = (raw: string) => {
  const norm = normalizeNumericString(raw);
  const digitsOnly = norm.replace(/[^\d]/g, '');
  if (!digitsOnly) return '';
  const n = Number(digitsOnly);
  if (!Number.isFinite(n) || n <= 0) return toPersianDigits(digitsOnly);
  const s = new Intl.NumberFormat('fa-IR').format(n);
  return toPersianDigits(s);
};

// برای فیلدهای عددی (مدت/نرخ)
const keepNumericPersian = (raw: string, allowDecimal: boolean) => {
  const norm = normalizeNumericString(raw);
  if (!norm) return '';
  if (allowDecimal) {
    let cleaned = norm.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
    return toPersianDigits(cleaned);
  }
  const cleaned = norm.replace(/[^\d]/g, '');
  return toPersianDigits(cleaned);
};

// =========================
// Core Calculation Logic (UNCHANGED)
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

// =========================
// Small UI helpers
// =========================
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
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', iconBg: 'bg-emerald-500/15 text-emerald-300' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-300', iconBg: 'bg-rose-500/15 text-rose-300' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-300', iconBg: 'bg-blue-500/15 text-blue-300' },
    slate: { bg: 'bg-white/[0.03]', text: 'text-slate-200', iconBg: 'bg-white/[0.06] text-slate-200' },
  };

  const t = toneMap[tone];

  return (
    <div className={`rounded-3xl border border-white/5 p-4 sm:p-5 ${t.bg}`}>
      <div className="flex items-center gap-2 text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.iconBg}`}>{icon}</div>
        <span>{title}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-xl sm:text-2xl font-black ${t.text}`}>{value}</span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400">{sub}</span>
      </div>
    </div>
  );
}

const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  requestAnimationFrame(() => {
    try {
      e.target.select();
    } catch {}
  });
};

export default function LoanClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('tool');

  const skipNextHashWriteRef = useRef(false);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const readHash = (): TabKey | null => {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (hash === 'about') return 'about';
    if (hash === 'tool') return 'tool';
    return null;
  };

  const writeHash = (next: TabKey, mode: 'replace' | 'push') => {
    const nextHash = next === 'about' ? '#about' : '#tool';
    if (window.location.hash === nextHash) return;

    if (mode === 'push') history.pushState(null, '', nextHash);
    else history.replaceState(null, '', nextHash);
  };

  const applyTabFromHash = (shouldScroll: boolean) => {
    const tab = readHash();
    if (!tab) return;

    skipNextHashWriteRef.current = true;
    setActiveTab(tab);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        if (tab === 'about') scrollToId('about');
        else scrollToId('tool-main');
      });
    }
  };

  useEffect(() => {
    if (!readHash()) writeHash('tool', 'replace');

    applyTabFromHash(true);

    const onHashChange = () => applyTabFromHash(true);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (skipNextHashWriteRef.current) {
      skipNextHashWriteRef.current = false;
      return;
    }
    writeHash(activeTab, 'replace');
  }, [activeTab]);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { slug: 'home', href: toolConfig.navRoutes.home, label: 'تخمینو', icon: Home },
      { slug: 'tools', href: toolConfig.navRoutes.tools, label: 'ابزارها', icon: Grid },
      { slug: 'learn', href: toolConfig.navRoutes.learn, label: 'یاد بگیر', icon: BookOpen },
      { slug: 'about', href: '#about', label: 'درباره', icon: Info },
    ],
    []
  );

  const onNavClick = (item: MenuItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = item.href;

    if (href.startsWith('#')) {
      e.preventDefault();

      if (href === '#about') {
        history.pushState(null, '', '#about');
        skipNextHashWriteRef.current = true;
        setActiveTab('about');
        requestAnimationFrame(() => scrollToId('about'));
        return;
      }

      if (href === '#tool') {
        history.pushState(null, '', '#tool');
        skipNextHashWriteRef.current = true;
        setActiveTab('tool');
        requestAnimationFrame(() => scrollToId('tool-main'));
        return;
      }

      history.pushState(null, '', href);
      return;
    }

    if (href.startsWith('/')) {
      e.preventDefault();
      router.push(href);
      return;
    }
  };

  const resolveRelatedHref = (slug: string, fallbackHref: string) => {
    return toolConfig.relatedRouteMap[slug] || fallbackHref || '/tools';
  };

  const aboutCards = useMemo(() => {
    return toolConfig.aboutSections.map((sec) => {
      let body: React.ReactNode = null;

      if (sec.type === 'text') {
        body = <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{sec.text}</p>;
      } else if (sec.type === 'bullets') {
        body = (
          <ul className="space-y-3">
            {sec.bullets.map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t}
              </li>
            ))}
          </ul>
        );
      } else if (sec.type === 'faq') {
        body = <FaqAccordion items={sec.items} />;
      }

      return {
        id: `about-${sec.key}`,
        key: sec.key,
        title: sec.title,
        body,
      };
    });
  }, []);

  // =========================
  // Loan tool states
  // =========================
  const [loanType, setLoanType] = useState<LoanType>(LOAN_TYPES[0]);
  const [gharzMethod, setGharzMethod] = useState<GharzMethod>('annual-first');

  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationType>('month');

  const [results, setResults] = useState<LoanResult | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  // ✅ شناسه یکتا برای هر «محاسبه» (برای جلوگیری از ثبت تکراری در رندرها)
  const [calcStartedAt, setCalcStartedAt] = useState<number | null>(null);
  const isLoggingRef = useRef(false);

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

  const amountExample = 'مثلاً ۱۰۰٬۰۰۰٬۰۰۰';
  const rateExample = useMemo(() => `مثلاً ${toPersianDigits(loanType.defaultRate)}`, [loanType]);
  const durationExample = useMemo(() => {
    const years = loanType.defaultYears;
    const m = years * 12;
    return durationUnit === 'year' ? `مثلاً ${toPersianDigits(years)}` : `مثلاً ${toPersianDigits(m)}`;
  }, [loanType, durationUnit]);

  const handleCalculate = useCallback(() => {
    if (!isReady) return;
    if (amountNum <= 0 || months <= 0) return;

    // ✅ هر بار محاسبه جدید = شناسه جدید
    const startedAt = Date.now();
    setCalcStartedAt(startedAt);

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

    // ✅ ریست لاگ-id
    setCalcStartedAt(null);
  }, []);

  // ✅ Auto-log اجرای ابزار: وقتی نتیجه تولید شد (Results != null)
  useEffect(() => {
    if (!results) return;
    if (!calcStartedAt) return;

    const savedKey = `takhmino_${toolConfig.slug}__saved_run_${calcStartedAt}`;

    // جلوگیری از ثبت تکراری همان محاسبه
    const already = sessionStorage.getItem(savedKey);
    if (already) return;

    if (isLoggingRef.current) return;
    isLoggingRef.current = true;

    (async () => {
      try {
        const summary = `قسط ماهانه ${formatCurrency(results.monthlyAverage)} تومان. مدت ${toPersianDigits(months)} ماه. ${
          loanType.isGharz ? 'کل کارمزد' : 'کل سود'
        } ${formatCurrency(results.totalInterest)} تومان.`;

        const rawData = {
          timestamp: Date.now(),
          startedAt: calcStartedAt,
          inputs: {
            loanTypeId: loanType.id,
            loanTypeName: loanType.name,
            isGharz: loanType.isGharz,
            gharzMethod: loanType.isGharz ? gharzMethod : null,
            amount: amountNum,
            annualRate: rateNum,
            durationValue: parseNumberSafe(duration),
            durationUnit,
            months,
          },
          result: {
            monthlyAverage: results.monthlyAverage,
            totalInterest: results.totalInterest,
            totalPayment: results.totalPayment,
            realRate: results.realRate,
            scheduleLength: results.schedule.length,
            // سبک نگه داریم: پیش‌نمایش ۱۲ ردیف اول
            schedulePreview: results.schedule.slice(0, 12).map((r) => ({
              month: r.month,
              interest: r.interest,
              principal: r.principal,
              payment: r.payment,
              endBalance: r.endBalance,
              isFeeMonth: r.isFeeMonth,
            })),
          },
          meta: {
            schema: 'takhmino.toolrun.v1',
            toolVersion: 1,
          },
        };

        const res = await saveToolRun({
          toolSlug: toolConfig.slug,
          toolName: toolConfig.toolName,
          version: 1,
          rawData,
          summary,
        });

        if (res.ok) {
          sessionStorage.setItem(savedKey, '1');
        }
        // اگر Unauthorized یا خطا باشد: silent (UI نشکند)
      } finally {
        isLoggingRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, calcStartedAt]);

  return (
    <div
      className={`${vazirmatn.className} relative min-h-screen overflow-x-hidden bg-[#020617] text-slate-200 select-none`}
      dir="rtl"
      data-page="tool"
      data-tool-slug={toolConfig.slug}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col items-center mb-16" id="tool-header" data-section="header">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-4 sm:gap-10 px-6 sm:px-10 py-4 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl"
          >
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  onClick={onNavClick(item)}
                  className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-all group"
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform text-blue-500" />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 text-center">
            <h1 className="text-sm font-bold tracking-widest text-blue-400/80 uppercase mb-2">{toolConfig.toolName}</h1>
            <div className="h-[2px] w-12 mx-auto bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </motion.div>
        </header>

        <main className="relative group" id="tool-main" data-section="main">
          <motion.div
            layout
            className="rounded-[40px] border border-white/10 bg-slate-900/20 backdrop-blur-3xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            id="tool-hero"
            data-section="hero"
          >
            <div className="flex justify-center border-b border-white/5 bg-white/[0.02]" data-section="tabs">
              <div className="flex gap-2 p-2" role="tablist" aria-label="tabs">
                {[
                  { id: 'tool' as const, label: 'ابزار محاسبه', icon: Grid },
                  { id: 'about' as const, label: 'راهنمای استفاده', icon: Info },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      writeHash(tab.id, 'push');
                      skipNextHashWriteRef.current = true;
                      setActiveTab(tab.id);
                      requestAnimationFrame(() => {
                        if (tab.id === 'about') scrollToId('about');
                        else scrollToId('tool-main');
                      });
                    }}
                    className={`relative flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all z-10 ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    data-tab={tab.id}
                    id={`tab-${tab.id}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent rounded-t-xl -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabLine"
                        className="absolute bottom-0 left-4 right-4 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 sm:px-12 py-10 sm:py-16 min-h-[400px] flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className={activeTab === 'about' ? 'w-full max-w-5xl self-stretch' : 'w-full max-w-6xl self-stretch'}
                  id={activeTab === 'tool' ? 'tool-panel' : 'about-panel'}
                  data-panel={activeTab}
                  role="tabpanel"
                  aria-labelledby={activeTab === 'tool' ? 'tab-tool' : 'tab-about'}
                >
                  {activeTab === 'tool' ? (
                    <div className="w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                        {/* Form */}
                        <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-5 sm:px-8 py-5 sm:py-7 text-right">
                          <div className="flex items-center gap-3 mb-5 sm:mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <Calculator size={18} className="text-blue-400" />
                            </div>
                            <div>
                              <div className="text-white font-black text-sm sm:text-base">مشخصات وام</div>
                              <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                نوع وام، مبلغ، نرخ و مدت را وارد کنید
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 sm:space-y-5">
                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-400 mb-2">نوع وام</label>
                              <select
                                value={loanType.id}
                                onChange={(e) => {
                                  const next = LOAN_TYPES.find((t) => t.id === e.target.value) ?? LOAN_TYPES[0];
                                  setLoanType(next);
                                }}
                                className="w-full rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3 text-slate-200 text-xs sm:text-sm outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                              >
                                {LOAN_TYPES.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-400 mb-2">مبلغ وام (تومان)</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  dir="ltr"
                                  value={loanAmount}
                                  placeholder={amountExample}
                                  onFocus={(e) => loanAmount && selectAllOnFocus(e)}
                                  onChange={(e) => setLoanAmount(formatAmountInput(e.target.value))}
                                  className="w-full rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3 pl-12 text-left font-bold text-base sm:text-lg text-slate-200 outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                  <Wallet size={18} />
                                </div>
                              </div>
                              <div className="mt-2 text-[11px] sm:text-xs text-slate-500 font-bold">
                                {loanAmount.trim() ? `${formatCurrency(amountNum)} تومان` : ' '}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-400 mb-2">
                                {loanType.isGharz ? 'نرخ کارمزد سالانه (٪)' : 'نرخ سود سالانه (٪)'}
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                dir="ltr"
                                placeholder={rateExample}
                                value={interestRate}
                                onFocus={(e) => interestRate && selectAllOnFocus(e)}
                                onChange={(e) => setInterestRate(keepNumericPersian(e.target.value, true))}
                                className="w-full rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3 text-right text-slate-200 text-xs sm:text-sm outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-400 mb-2">مدت بازپرداخت</label>

                              <div className="flex items-center rounded-2xl border border-white/5 bg-slate-950/40 overflow-hidden">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  dir="ltr"
                                  value={duration}
                                  placeholder={durationExample}
                                  onFocus={(e) => duration && selectAllOnFocus(e)}
                                  onChange={(e) => setDuration(keepNumericPersian(e.target.value, false))}
                                  className="flex-1 bg-transparent px-4 py-3 text-center font-bold text-base sm:text-lg text-slate-200 outline-none"
                                />
                                <div className="flex border-r border-white/5">
                                  <button
                                    type="button"
                                    onClick={() => setDurationUnit('year')}
                                    className={`px-4 py-3 text-[11px] sm:text-xs font-bold transition-colors ${
                                      durationUnit === 'year' ? 'bg-white/[0.04] text-blue-300' : 'text-slate-500'
                                    }`}
                                  >
                                    سال
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDurationUnit('month')}
                                    className={`px-4 py-3 text-[11px] sm:text-xs font-bold transition-colors ${
                                      durationUnit === 'month' ? 'bg-white/[0.04] text-blue-300' : 'text-slate-500'
                                    }`}
                                  >
                                    ماه
                                  </button>
                                </div>
                              </div>

                              <div className="mt-2 text-[11px] sm:text-xs text-slate-500 font-bold">
                                معادل: {toPersianDigits(months)} ماه
                              </div>
                            </div>

                            {loanType.isGharz && (
                              <div>
                                <label className="block text-[11px] sm:text-xs font-bold text-slate-400 mb-2">روش محاسبه کارمزد</label>
                                <select
                                  value={gharzMethod}
                                  onChange={(e) => setGharzMethod(e.target.value as GharzMethod)}
                                  className="w-full rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3 text-slate-200 text-xs sm:text-sm outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                                >
                                  <option value="annual-first">سالانه یکجا در ماه اول هر سال (۱،۱۳،۲۵...)</option>
                                  <option value="monthly">ماهانه کاهشی روی مانده (بعضی بانک‌ها)</option>
                                </select>
                              </div>
                            )}

                            <div className="pt-2 space-y-3">
                              <button
                                type="button"
                                onClick={handleCalculate}
                                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                              >
                                محاسبه اقساط
                              </button>

                              <button
                                type="button"
                                onClick={handleClearForm}
                                className="w-full px-6 py-4 bg-white/[0.04] hover:bg-white/[0.06] text-slate-300 rounded-2xl font-bold text-[11px] sm:text-sm transition-all active:scale-95"
                              >
                                پاکسازی فرم
                              </button>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-4 flex gap-3 items-start mt-2">
                              <Info size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                              <p className="text-[10px] sm:text-[11px] leading-relaxed text-emerald-200/90 text-right">
                                ارقام نمایش داده شده صرفاً تخمینی است و بر اساس فرمول‌های کلی محاسبه شده است. برای اطلاع از ارقام نهایی با
                                موسسه مربوطه تماس بگیرید.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Results */}
                        <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-5 sm:px-8 py-5 sm:py-7 text-right">
                          <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <TableIcon size={18} className="text-blue-400" />
                              </div>
                              <div>
                                <div className="text-white font-black text-sm sm:text-base">نتیجه محاسبات</div>
                                <div className="text-[11px] sm:text-xs text-slate-500 mt-1">خلاصه + جدول اقساط</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setResults(null);
                                setShowFullTable(false);
                                setCalcStartedAt(null);
                              }}
                              className="text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2"
                            >
                              <RotateCcw size={14} />
                              ریست نتیجه
                            </button>
                          </div>

                          {!results ? (
                            <div className="rounded-3xl border border-white/5 bg-slate-950/30 p-6 sm:p-8 text-center">
                              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5 border border-blue-500/20">
                                <Calculator className="text-blue-400" size={28} />
                              </div>
                              <h3 className="text-base sm:text-lg font-black text-white mb-2">هنوز محاسبه‌ای انجام نشده</h3>
                              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                ابتدا اطلاعات وام را وارد کنید و روی «محاسبه اقساط» بزنید تا خلاصه و جدول اقساط نمایش داده شود.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-5 sm:space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                              <div className="rounded-3xl border border-white/5 bg-slate-950/30 overflow-hidden">
                                <div className="px-4 sm:px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <TableIcon size={16} className="text-blue-400" />
                                    <span className="font-black text-white text-xs sm:text-sm">جدول اقساط</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setShowFullTable((v) => !v)}
                                    className="text-blue-300 hover:text-blue-200 font-bold text-[11px] sm:text-xs flex items-center gap-2 transition-colors"
                                  >
                                    {showFullTable ? 'نمایش خلاصه' : 'نمایش همه'}
                                    {showFullTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>

                                <div className="w-full overflow-x-auto">
                                  <table className="w-full text-right text-[11px] sm:text-sm" dir="rtl">
                                    <thead className="bg-white/[0.03] text-slate-400 font-bold">
                                      <tr>
                                        <th className="py-3 px-3 sm:px-4 whitespace-nowrap w-[72px]">قسط</th>
                                        <th className="py-3 px-3 sm:px-4 whitespace-nowrap">اصل</th>
                                        <th className="py-3 px-3 sm:px-4 whitespace-nowrap">
                                          {loanType.isGharz ? 'کارمزد' : 'سود'}
                                        </th>
                                        <th className="py-3 px-3 sm:px-4 whitespace-nowrap">جمع قسط</th>
                                        <th className="py-3 px-3 sm:px-4 whitespace-nowrap">مانده</th>
                                      </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/5">
                                      {results.schedule
                                        .slice(0, showFullTable ? results.schedule.length : 6)
                                        .map((row) => (
                                          <tr
                                            key={row.month}
                                            className={[
                                              'hover:bg-white/[0.03] transition-colors',
                                              row.isFeeMonth ? 'bg-amber-500/10' : '',
                                            ].join(' ')}
                                          >
                                            <td className="py-3 px-3 sm:px-4 font-bold text-slate-400">
                                              {toPersianDigits(row.month)}
                                            </td>

                                            <td className="py-3 px-3 sm:px-4 font-bold text-emerald-300">
                                              {formatCurrency(row.principal)}
                                            </td>

                                            <td className="py-3 px-3 sm:px-4 text-rose-300 font-semibold">
                                              <div className="flex flex-col gap-1">
                                                <span>{formatCurrency(row.interest)}</span>
                                                {row.isFeeMonth && (
                                                  <span className="text-[9px] sm:text-[10px] bg-amber-300/20 text-amber-200 px-2 py-0.5 rounded-lg inline-block font-extrabold w-fit">
                                                    کارمزد سالانه
                                                  </span>
                                                )}
                                              </div>
                                            </td>

                                            <td className="py-3 px-3 sm:px-4 font-black text-white">
                                              {formatCurrency(row.payment)}
                                            </td>

                                            <td className="py-3 px-3 sm:px-4 text-slate-400 font-semibold">
                                              {formatCurrency(row.endBalance)}
                                            </td>
                                          </tr>
                                        ))}

                                      {!showFullTable && results.schedule.length > 6 && (
                                        <tr>
                                          <td colSpan={5} className="px-4 py-4 text-center text-slate-500 italic bg-white/[0.02]">
                                            ... {toPersianDigits(results.schedule.length - 6)} قسط دیگر (روی «نمایش همه» بزنید)
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-5 sm:px-6 py-5 sm:py-6 text-right">
                                <div className="flex items-center gap-2 mb-4">
                                  <LayoutGrid size={18} className="text-blue-400" />
                                  <h3 className="font-black text-white text-xs sm:text-sm">چطور تخمین ساخته شده؟</h3>
                                </div>
                                <ul className="space-y-3">
                                  <li className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-xs sm:text-sm text-slate-400">
                                      برای وام‌های معمولی، فرمول قسط ثابت (EMI) استفاده می‌شود.
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-xs sm:text-sm text-slate-400">
                                      برای قرض‌الحسنه، دو روش محاسبه کارمزد (سالانه یکجا / ماهانه کاهشی) پشتیبانی می‌شود.
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-xs sm:text-sm text-slate-400">
                                      جدول اقساط سهم اصل و سود/کارمزد را ماه‌به‌ماه نشان می‌دهد.
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-right" id="about" data-section="about">
                      {aboutCards.map((sec) => (
                        <section
                          key={sec.id}
                          id={sec.id}
                          data-about-section={sec.key}
                          className="rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-6 sm:px-8 sm:py-7"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-sm sm:text-lg font-black text-white whitespace-nowrap">{sec.title}</h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                          </div>

                          {sec.body}
                        </section>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        <section className="mt-20" id="related">
          <div className="flex items-center gap-6 mb-8">
            <h2 className="text-xl font-black text-white whitespace-nowrap">ابزارهای مرتبط</h2>
            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {toolConfig.relatedTools.map((tool, idx) => {
              const Icon = tool.icon;
              const resolvedHref = resolveRelatedHref(tool.slug, tool.hrefFallback);

              return (
                <motion.a
                  key={idx}
                  href={resolvedHref}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(resolvedHref);
                  }}
                  whileHover={{ y: -8, backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                  className="group cursor-pointer rounded-[24px] bg-slate-900/40 border border-white/5 p-6 transition-all duration-300 hover:border-blue-500/30 block"
                  aria-label={tool.title}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Icon size={24} className={tool.colorClass} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
                    </div>

                    <ChevronLeft
                      size={16}
                      className="text-slate-600 group-hover:translate-x-[-4px] group-hover:text-blue-400 transition-all"
                    />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="mt-24 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="text-lg font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">تخمینو</div>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest">ساده • شفاف • صادقانه</p>
          </div>

          <div className="flex gap-4">
            {[Twitter, Instagram, Facebook].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                aria-label="social"
              >
                <Icon size={20} />
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-600">تمامی حقوق برای تخمینو محفوظ است © ۲۰۲۴</div>
        </div>
      </footer>
    </div>
  );
}
