// app/_components/HomeSmartSection.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sparkles, BookOpen, Wrench, ShieldCheck } from 'lucide-react';

type Props = {
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel?: string;
};

export default function HomeSmartSection({
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel = 'مطالعه مقاله هفته',
}: Props) {
  const reduceMotion = useReducedMotion();

  const safePrimaryHref = useMemo(() => {
    return primaryCtaHref?.startsWith('/') ? primaryCtaHref : '/tools';
  }, [primaryCtaHref]);

  const safeSecondaryHref = useMemo(() => {
    return secondaryCtaHref?.startsWith('/') ? secondaryCtaHref : '/academy';
  }, [secondaryCtaHref]);

  return (
    <section className="py-14 sm:py-18 lg:py-20 px-6 md:px-12 relative">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-28 w-80 h-80 bg-emerald-400/10 blur-[90px] rounded-full" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-emerald-600/8 blur-[110px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="rounded-[34px] border border-black/5 bg-white/55 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.10)] overflow-hidden"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            {/* header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3 sm:space-y-4 text-center lg:text-right">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-50 text-[#059669] text-[10px] sm:text-[11px] font-black border border-emerald-100 shadow-sm w-fit mx-auto lg:mx-0">
                  <Sparkles className={`w-4 h-4 ${reduceMotion ? '' : 'animate-pulse'}`} />
                  انتخاب‌های هوشمند تخمینو
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                  از کجا شروع کنم؟
                </h2>

                <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  یک «ابزار منتخب» برای اقدام سریع + یک «مقاله منتخب» برای فهم بهتر زمینه.
                  <br className="hidden sm:block" />
                  نه شعار، نه پیش‌بینی؛ فقط شفاف‌سازی و مسیر.
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/5 px-3 py-2 text-[11px] font-black text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    خروجی‌ها تخمین هستند
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/5 px-3 py-2 text-[11px] font-black text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    محاسبه داخل مرورگر
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-end">
                <Link
                  href={safePrimaryHref}
                  className="
                    inline-flex items-center justify-center gap-2
                    bg-[#111827] text-white
                    px-6 sm:px-7 py-3
                    rounded-[20px]
                    text-sm sm:text-base
                    font-black
                    shadow-[0_18px_55px_rgba(0,0,0,0.14)]
                    hover:bg-[#059669]
                    hover:shadow-[0_22px_60px_rgba(5,150,105,0.22)]
                    transition-all
                    active:scale-[0.98]
                  "
                  aria-label={primaryCtaLabel}
                >
                  <Wrench className="w-5 h-5" />
                  {primaryCtaLabel}
                  <ArrowUpRight className="w-5 h-5" />
                </Link>

                <Link
                  href={safeSecondaryHref}
                  className="
                    inline-flex items-center justify-center gap-2
                    bg-white/70 text-[#111827]
                    px-6 sm:px-7 py-3
                    rounded-[20px]
                    text-sm sm:text-base
                    font-black
                    border border-black/5
                    shadow-[0_14px_40px_rgba(0,0,0,0.06)]
                    hover:border-emerald-200
                    hover:text-[#059669]
                    hover:-translate-y-0.5
                    transition-all
                    active:scale-[0.98]
                  "
                  aria-label={secondaryCtaLabel}
                >
                  <BookOpen className="w-5 h-5" />
                  {secondaryCtaLabel}
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* divider */}
            <div className="mt-7 sm:mt-8 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            {/* small cards */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {[
                {
                  title: '۱) ابزار منتخب',
                  desc: 'سریع وارد عمل شو: ورودی‌های ساده، خروجی قابل توضیح.',
                },
                {
                  title: '۲) مقاله منتخب',
                  desc: 'زمینه را بفهم: مفهوم‌ها را قبل از تصمیم‌گیری روشن کن.',
                },
                {
                  title: '۳) مسیر شخصی',
                  desc: 'بعد از این دو قدم، سراغ ابزارهای دقیق‌تر برو.',
                },
              ].map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  className="rounded-[26px] bg-white/60 border border-black/5 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)]"
                >
                  <p className="text-[12px] font-black text-gray-500">{c.title}</p>
                  <p className="mt-2 text-base font-black text-[#111827]">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}