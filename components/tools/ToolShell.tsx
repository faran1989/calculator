'use client';

// components/tools/ToolShell.tsx
// Ultra-premium shared template for all tools

import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Zap, Lock, ChevronDown, ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export type RelatedTool = {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
  colorClass?: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

type ToolShellProps = {
  /** عنوان ابزار */
  title: string;
  /** توضیح کوتاه */
  subtitle: string;
  /** آیکون ابزار */
  icon?: ReactNode;
  /** کلاس رنگ پس‌زمینه آیکون — مثال: 'bg-emerald-50 text-emerald-600' */
  iconBg?: string;
  /** آمار hero — مثال: [{ label: 'استفاده', value: '۱۲,۰۰۰+' }] */
  stats?: { label: string; value: string }[];
  /** محتوای اصلی ابزار (تب "ابزار") */
  children: ReactNode;
  /** تب "روش محاسبه" — اختیاری */
  methodContent?: ReactNode;
  /** سوالات متداول */
  faqItems?: FaqItem[];
  /** ابزارهای مرتبط */
  relatedTools?: RelatedTool[];
};

/* ─────────────────────────────────────────────
   FAQ Accordion Item
───────────────────────────────────────────── */
function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-black/6 rounded-2xl overflow-hidden bg-white"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-right"
          >
            <span className="text-sm font-bold text-slate-800">{item.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 mr-3 text-emerald-600"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-4 text-sm text-slate-600 leading-7 border-t border-black/5 pt-3">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Related Tool Card
───────────────────────────────────────────── */
function RelatedCard({ tool }: { tool: RelatedTool }) {
  return (
    <Link
      href={tool.href}
      className="group flex items-center gap-3.5 p-4 bg-white border border-black/6 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all duration-200"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-black/5 bg-slate-50 group-hover:scale-105 transition-transform ${tool.colorClass ?? ''}`}>
        {tool.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-slate-800 truncate">{tool.title}</div>
        <div className="text-xs text-slate-400 truncate mt-0.5">{tool.desc}</div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Main ToolShell
───────────────────────────────────────────── */
type Tab = 'tool' | 'method' | 'faq';

const DEFAULT_STATS = [
  { value: 'رایگان', label: 'همیشه' },
  { value: 'شفاف', label: 'فرمول باز' },
  { value: 'امن', label: 'بدون ذخیره داده' },
];

export default function ToolShell({
  title,
  subtitle,
  icon,
  iconBg = 'bg-emerald-50 text-emerald-600',
  stats = DEFAULT_STATS,
  children,
  methodContent,
  faqItems,
  relatedTools = [],
}: ToolShellProps) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'tool', label: 'ابزار' },
    ...(methodContent ? [{ key: 'method' as Tab, label: 'روش محاسبه' }] : []),
    ...(faqItems?.length ? [{ key: 'faq' as Tab, label: 'سوالات متداول' }] : []),
  ];

  const [activeTab, setActiveTab] = useState<Tab>('tool');
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [tabBarStuck, setTabBarStuck] = useState(false);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTabBarStuck(!entry.isIntersecting),
      { threshold: 1, rootMargin: '-85px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50/80 to-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-12 w-48 h-48 rounded-full bg-teal-100/20 blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-10">
          {/* Breadcrumb */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            همه ابزارها
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Icon */}
            {icon && (
              <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-black/5 ${iconBg}`}>
                {icon}
              </div>
            )}

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                {title}
              </h1>
              <p className="mt-2 text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl">
                {subtitle}
              </p>

              {/* Stats row */}
              <div className="mt-5 flex flex-wrap gap-2">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/6 shadow-sm"
                  >
                    {i === 0 && <Zap className="w-3 h-3 text-emerald-500" />}
                    {i === 1 && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    {i === 2 && <Lock className="w-3 h-3 text-emerald-500" />}
                    <span className="text-xs font-black text-slate-700">{s.value}</span>
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY TAB BAR ───────────────────────────────── */}
      <div
        ref={tabBarRef}
        className={`sticky top-[68px] z-40 transition-all duration-200 ${
          tabBarStuck
            ? 'bg-white/90 backdrop-blur-xl border-b border-black/6 shadow-sm'
            : 'bg-white/60 backdrop-blur-sm border-b border-black/4'
        }`}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-1 h-12 relative">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2 text-sm font-bold transition-colors rounded-lg ${
                  activeTab === tab.key
                    ? 'text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ─────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'tool' && (
            <motion.div
              key="tool"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}

          {activeTab === 'method' && methodContent && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 sm:p-10"
            >
              {methodContent}
            </motion.div>
          )}

          {activeTab === 'faq' && faqItems?.length && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <FaqAccordion items={faqItems} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RELATED TOOLS ─────────────────────────────── */}
        {relatedTools.length > 0 && (
          <div className="mt-12 pt-8 border-t border-black/5">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider">ابزارهای مرتبط</h2>
              <div className="flex-1 h-px bg-black/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedTools.map((tool) => (
                <RelatedCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
