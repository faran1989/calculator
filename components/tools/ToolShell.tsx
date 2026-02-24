'use client';

// components/tools/ToolShell.tsx
// Template مشترک برای همه ابزارها — تم لایت، emerald accent

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export type RelatedTool = {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
};

type Tab = 'tool' | 'about';

type ToolShellProps = {
  /** عنوان ابزار — H1 */
  title: string;
  /** توضیح کوتاه زیر عنوان */
  subtitle: string;
  /** آیکون ابزار (اختیاری) */
  icon?: ReactNode;
  /** محتوای پنل "ابزار" — فرم و نتایج */
  children: ReactNode;
  /** محتوای پنل "درباره ابزار" */
  aboutContent: ReactNode;
  /** ابزارهای مرتبط */
  relatedTools?: RelatedTool[];
};

/* ─────────────────────────────────────────────
   ToolShell
───────────────────────────────────────────── */
export default function ToolShell({
  title,
  subtitle,
  icon,
  children,
  aboutContent,
  relatedTools = [],
}: ToolShellProps) {
  const [tab, setTab] = useState<Tab>('tool');

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* ── Hero ── */}
      <div className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">

          {/* Breadcrumb */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-5"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            همه ابزارها
          </Link>

          {/* Title row */}
          <div className="flex items-start gap-4">
            {icon && (
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{title}</h1>
              <p className="mt-1.5 text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl">{subtitle}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-2xl gap-1" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'tool'}
              onClick={() => setTab('tool')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === 'tool'
                  ? 'bg-white text-emerald-700 shadow-sm border border-black/5'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ابزار
            </button>
            <button
              role="tab"
              aria-selected={tab === 'about'}
              onClick={() => setTab('about')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === 'about'
                  ? 'bg-white text-emerald-700 shadow-sm border border-black/5'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              درباره ابزار
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Panel ── */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          {tab === 'tool' ? (
            <motion.div
              key="tool"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 sm:p-8 space-y-6"
            >
              {aboutContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Related Tools ── */}
        {relatedTools.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-black text-slate-700 mb-4">ابزارهای مرتبط</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-3 p-4 bg-white border border-black/6 rounded-2xl hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center group-hover:bg-emerald-50 transition-colors shrink-0">
                    {tool.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{tool.title}</div>
                    <div className="text-xs text-slate-400 truncate">{tool.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
