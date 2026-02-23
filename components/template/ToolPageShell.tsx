'use client';

import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

/**
 * ToolPageShell
 * فاز B: استخراج ساختار بدون تغییر UI
 * - فقط Shell: Background → Header Glass → Hero Glass → Main روشن → Related → Footer Glass
 * - هیچ منطق ابزار/محاسبه/SEO داخل این فایل نیست
 * - Hash routing و state مدیریت تب‌ها بیرون از این فایل می‌ماند (فعلاً در Client ابزار)
 */

export type ToolTabKey = 'tool' | 'about';

type RelatedToolItem = {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
  /** روی موبایل کارت سوم به بعد مخفی می‌شود */
  hideOnMobile?: boolean;
};

type ToolPageShellProps = {
  /** برای اتصال فونت (مثلاً vazirmatn.className) */
  fontClassName: string;

  /** Hero */
  h1: string; // ✅ فقط یک H1 در کل صفحه (داخل Hero)
  subtitle: string;

  /** Tabs */
  activeTab: ToolTabKey;
  onGoTool: () => void;
  onGoAbout: () => void;

  /** Accent token */
  accentSolidClass: string; // مثال: 'bg-blue-700 hover:bg-blue-800'

  /** Main */
  children: ReactNode; // محتوای پنل (AnimatePresence و panelها بیرون)

  /** Related tools */
  relatedTitle: string;
  relatedTools: RelatedToolItem[];

  /** Footer links */
  footerLinks: { href: string; label: string }[];
};

export default function ToolPageShell({
  fontClassName,
  h1,
  subtitle,
  activeTab,
  onGoTool,
  onGoAbout,
  accentSolidClass,
  children,
  relatedTitle,
  relatedTools,
  footerLinks,
}: ToolPageShellProps) {
  return (
    <div
      className={[
        fontClassName,
        // 1) Background سراسری گرادیانت ملایم
        'min-h-screen text-slate-100 flex flex-col overflow-x-hidden',
        
       	   'selection:bg-blue-500/20',
      ].join(' ')}
      dir="rtl"
	      >
		  
      {/* 2) Header شیشه‌ای (Glass تیره قوی) */}
      <header
        className={[
          'fixed top-0 inset-x-0 z-50',
          'backdrop-blur-2xl bg-slate-950/80 border-b border-white/10',
          'h-[56px] sm:h-[60px]',
        ].join(' ')}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm">
              ت
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white">تخمینو</span>
          </div>

          <Link
            href="/"
            className={[
              'p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            ].join(' ')}
            aria-label="خانه"
          >
            <Home size={20} />
          </Link>
        </div>
      </header>

      {/* 3) Hero شیشه‌ای (Glass تیره قوی) */}
      <section className="w-full pt-[80px] sm:pt-[92px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className={[
              'relative overflow-hidden',
              'backdrop-blur-2xl bg-slate-950/75 border border-white/10',
              'rounded-[28px] md:rounded-[32px]',
              'px-6 py-8 md:px-10 md:py-10',
              'shadow-[0_30px_90px_rgba(0,0,0,0.45)]',
              'max-h-[40vh]',
            ].join(' ')}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-transparent" />

            <div className="relative flex flex-col gap-4">
              {/* ✅ فقط یک H1 در کل صفحه */}
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{h1}</h1>

              <p className="text-white/75 text-sm md:text-base leading-7 max-w-2xl">{subtitle}</p>

              {/* Tabs inside Hero */}
              <div
                role="tablist"
                aria-label="تب‌های ابزار"
                className="mt-2 inline-flex w-full sm:w-fit p-1 rounded-2xl bg-white/8 border border-white/10"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'tool'}
                  aria-controls="panel-tool"
                  id="tab-tool"
                  onClick={onGoTool}
                  className={[
                    'flex-1 sm:flex-none px-6 sm:px-7 py-2.5 rounded-xl text-sm font-bold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    activeTab === 'tool' ? `${accentSolidClass} text-white shadow-sm` : 'text-white/80 hover:bg-white/6',
                  ].join(' ')}
                >
                  ابزار
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'about'}
                  aria-controls="panel-about"
                  id="tab-about"
                  onClick={onGoAbout}
                  className={[
                    'flex-1 sm:flex-none px-6 sm:px-7 py-2.5 rounded-xl text-sm font-bold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    activeTab === 'about' ? `${accentSolidClass} text-white shadow-sm` : 'text-white/80 hover:bg-white/6',
                  ].join(' ')}
                >
                  درباره ابزار
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4) Main Container روشن (بدون blur) - چسبیده به Hero */}
      <main className="w-full flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className={[
              '-mt-5 md:-mt-6',
              'bg-slate-50/95 text-slate-900',
              'rounded-[28px] md:rounded-[32px]',
              'shadow-[0_18px_70px_rgba(0,0,0,0.18)]',
              'border border-white/10',
              'p-6 md:p-10',
            ].join(' ')}
          >
            {children}
          </div>

          {/* 5) Related Tools Section (مستقل، بعد از Main، قبل Footer) */}
          <section className="mt-10 md:mt-12 mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-black text-white">{relatedTitle}</h2>
              <div className="h-px flex-1 bg-white/10 mr-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTools.map((tool, idx) => {
                const hide = tool.hideOnMobile ?? idx >= 2; // ✅ موبایل: حداکثر 2 کارت
                return (
                  <Link
                    key={`${tool.href}-${idx}`}
                    href={tool.href}
                    className={[
                      'group block',
                      hide ? 'hidden sm:block' : '',
                      // ✅ Related باید روشن/ساده باشد (بدون blur / glass)
                      'rounded-[20px] border border-slate-200/70 bg-slate-50/95',
                      'px-5 py-4 shadow-sm',
                      'transition-transform transition-colors',
                      'hover:bg-white hover:border-slate-200',
                      'active:scale-[0.99]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    ].join(' ')}
                    aria-label={tool.title}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/70 flex items-center justify-center transition-transform group-hover:scale-105">
                        {tool.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">{tool.title}</div>
                        <div className="text-xs text-slate-600 truncate">{tool.desc}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* 6) Footer شیشه‌ای (Glass تیره) */}
      <footer className={['w-full mt-auto', 'backdrop-blur-xl bg-slate-950/70 border-t border-white/10'].join(' ')}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-right">
            <p className="text-xs text-white/60 font-semibold">تخمینو — تخمین ساده، شفاف و صادقانه</p>

            <div className="flex gap-4 text-xs font-black text-white/70">
              {footerLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-lg px-1"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
