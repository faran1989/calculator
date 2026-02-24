'use client';

// components/tools/ToolShell.tsx
// Ultra-premium shared template for all tools
// SEO sections (method + FAQ) always in DOM — never hidden behind tabs

import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Zap, Lock, ChevronDown, ExternalLink, ArrowUp } from 'lucide-react';

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
  title: string;
  subtitle: string;
  icon?: ReactNode;
  iconBg?: string;
  stats?: { label: string; value: string }[];
  children: ReactNode;
  methodContent?: ReactNode;
  faqItems?: FaqItem[];
  relatedTools?: RelatedTool[];
};

/* ─────────────────────────────────────────────
   FAQ Accordion — always in DOM (SEO-safe)
───────────────────────────────────────────── */
function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-black/6 rounded-2xl overflow-hidden bg-white">
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
   Section Header
───────────────────────────────────────────── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</h2>
      <div className="flex-1 h-px bg-black/5" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main ToolShell
───────────────────────────────────────────── */
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
  const hasSeoContent      = !!methodContent || !!(faqItems?.length);
  const hasBothSeoSections = !!methodContent && !!(faqItems?.length);

  /* ── Floating back-to-tool button ── */
  const toolSectionRef  = useRef<HTMLElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const el = toolSectionRef.current;
    if (!el || !hasSeoContent) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollBtn(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSeoContent]);

  const scrollToTool = () =>
    toolSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50/80 to-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-12 w-40 h-40 rounded-full bg-teal-100/20 blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-7">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-1.5 text-sm mb-5 min-w-0" aria-label="مسیر صفحه">
            <Link
              href="/tools"
              className="text-slate-400 hover:text-emerald-600 transition-colors font-medium shrink-0"
            >
              همه ابزارها
            </Link>
            {/* جداکننده RTL: chevron-left در dir=rtl بصورت « نمایش داده می‌شود */}
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300 shrink-0 rotate-180" aria-hidden />
            <span className="text-slate-700 font-bold truncate">{title}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {icon && (
              <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 ${iconBg}`}>
                {icon}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                {title}
              </h1>
              <p className="mt-1.5 text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl">
                {subtitle}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/6 shadow-sm"
                  >
                    {i === 0 && <Zap       className="w-3 h-3 text-emerald-500" />}
                    {i === 1 && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    {i === 2 && <Lock      className="w-3 h-3 text-emerald-500" />}
                    <span className="text-xs font-black text-slate-700">{s.value}</span>
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-10">

        {/* ── Tool section (with ref for IntersectionObserver) ── */}
        <section ref={toolSectionRef}>
          {children}
        </section>

        {/* ── SEO Sections (always in DOM) ── */}
        {hasSeoContent && (
          <section>
            <div className={hasBothSeoSections ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>

              {methodContent && (
                <div>
                  <SectionHeader label="روش محاسبه" />
                  <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
                    {methodContent}
                  </div>
                </div>
              )}

              {faqItems?.length && (
                <div>
                  <SectionHeader label="سوالات متداول" />
                  <FaqAccordion items={faqItems} />
                </div>
              )}

            </div>
          </section>
        )}

        {/* ── Related Tools ── */}
        {relatedTools.length > 0 && (
          <section>
            <SectionHeader label="ابزارهای مرتبط" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedTools.map((tool) => (
                <RelatedCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Floating back-to-tool button ─────────────────── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <button
              onClick={scrollToTool}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-xl text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              بازگشت به ابزار
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
