// app/_shell/public/PublicFooter.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldCheck, ChevronDown, Instagram, Linkedin } from 'lucide-react';

/* ─────────────────────────────────────────────
   ✅ Icons (همان نسخه صفحه اصلی)
───────────────────────────────────────────── */
const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.9 2H21l-6.6 7.6L22.2 22h-6.9l-4.7-6.2L5.3 22H3.1l7.1-8.2L1.8 2h7.1l4.3 5.7L18.9 2Zm-2.4 18h1.6L7.4 4H5.7l10.8 16Z" />
  </svg>
);

const IconTelegram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.9 4.6c.2-.8-.6-1.4-1.3-1.1L2.5 10.6c-.9.4-.8 1.8.1 2l4.6 1.5 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.7 5.2 3.9c.6.4 1.5.1 1.6-.7l2.7-16.1ZM8.2 13.3l9.7-6c.2-.1.4.2.2.4l-8 7.4-.3 3.6-1.4-4.3-.2-.1Z" />
  </svg>
);

const IconWhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.3c-.2.6-1.1 1.1-1.6 1.2-.4.1-.9.1-1.5 0-.4-.1-.9-.3-1.6-.6-2.7-1.1-4.5-3.8-4.6-4-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.3.1.5 0 .7-.1.2-.2.3-.3.5-.1.1-.3.3-.4.4-.1.1-.2.3-.1.5.1.2.6 1.1 1.3 1.7.9.8 1.6 1.1 1.8 1.2.2.1.4.1.5-.1.2-.2.6-.7.8-.9.2-.2.4-.2.6-.1l2 .9c.3.1.5.2.6.3.1.1.1.6-.1 1.2Z" />
  </svg>
);

const SocialIcons = () => {
  const items = [
    { label: 'اینستاگرام', href: '#', Icon: Instagram },
    { label: 'تلگرام', href: '#', Icon: IconTelegram },
    { label: 'لینکدین', href: '#', Icon: Linkedin },
    { label: 'ایکس', href: '#', Icon: IconX },
    { label: 'واتساپ', href: '#', Icon: IconWhatsApp },
  ] as const;

  return (
    <div className="flex items-center gap-2.5">
      {items.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="
            group inline-flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white/60 border border-black/5
            text-gray-500
            shadow-[0_10px_26px_rgba(0,0,0,0.06)]
            transition-all duration-200
            hover:-translate-y-0.5 hover:text-[#059669]
            hover:shadow-[0_16px_35px_rgba(5,150,105,0.20)]
            active:scale-95
          "
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
};

export default function PublicFooter() {
  const [openKey, setOpenKey] = useState<'quick' | 'resources' | 'trust' | null>(null);

  const toggle = (key: 'quick' | 'resources' | 'trust') => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <footer className="relative z-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="bg-gradient-to-t from-[#EAF0ED] to-[#EFF3F1]">
        <div className="w-full md:w-[80%] mx-auto px-6 sm:px-10 py-10 sm:py-14">
          {/* top CTA */}
          <div className="mb-8 sm:mb-12">
            <div className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] border border-black/5 bg-white/55 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/15 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/10 blur-[90px] rounded-full" />
              </div>

              <div className="relative p-4 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-emerald-700/80 uppercase">
                    شروع سریع
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black text-[#111827]">آماده‌ای تصمیم مالی بهتری بگیری؟</h3>
                  <p className="hidden sm:block text-sm text-gray-500 font-medium leading-relaxed max-w-2xl">
                    با یک تخمین شفاف شروع کن؛ بدون پیچیدگی، بدون ادعاهای غیرواقعی.
                  </p>
                  <p className="sm:hidden text-xs text-gray-500 font-medium leading-relaxed">با یک تخمین شفاف شروع کن.</p>
                </div>

                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center bg-[#111827] text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-[16px] sm:rounded-[18px] text-xs sm:text-sm font-black hover:bg-[#059669] transition-all shadow-lg active:scale-95"
                >
                  شروع اولین تخمین
                </Link>
              </div>
            </div>
          </div>

          {/* desktop */}
          <div className="hidden md:grid grid-cols-12 gap-10 items-start">
            <div className="col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Activity className="text-white w-5 h-5" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-[#111827]">تخمینو</span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed font-medium max-w-md">
                تخمینو یک سایت آموزشی و تصمیم‌ساز مالی است؛ ابزارهایی برای تخمین شفاف و قابل‌فهم در اقتصاد ایران.
              </p>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/5 px-4 py-2 text-xs font-black text-gray-700 w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                پردازش محاسبات در مرورگر شما
              </div>
            </div>

            <div className="col-span-3 space-y-4">
              <h4 className="font-black text-base text-[#111827]">دسترسی سریع</h4>
              <div className="flex flex-col gap-3 text-sm font-bold text-gray-600">
                <Link href="/" className="hover:text-[#059669] transition-colors">
                  صفحه اصلی
                </Link>
                <Link href="/tools" className="hover:text-[#059669] transition-colors">
                  ابزارها
                </Link>
                <Link href="/academy" className="hover:text-[#059669] transition-colors">
                  آکادمی تخمینو
                </Link>
                <Link href="/about" className="hover:text-[#059669] transition-colors">
                  درباره تخمینو
                </Link>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <h4 className="font-black text-base text-[#111827]">منابع</h4>
              <div className="flex flex-col gap-3 text-sm font-bold text-gray-600">
                <Link href="/academy" className="hover:text-[#059669] transition-colors">
                  دانشنامه
                </Link>
                <Link href="/contact" className="hover:text-[#059669] transition-colors">
                  پشتیبانی
                </Link>
                <a href="#" className="hover:text-[#059669] transition-colors">
                  حریم خصوصی
                </a>
                <a href="#" className="hover:text-[#059669] transition-colors">
                  شرایط استفاده
                </a>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <h4 className="font-black text-base text-[#111827]">اعتماد</h4>

              <div className="space-y-3">
                {[
                  { title: 'شفافیت', desc: 'خروجی‌ها «تخمین» هستند؛ نه پیش‌بینی قطعی.' },
                  { title: 'حریم خصوصی', desc: 'داده‌های حساس شما ذخیره نمی‌شود (تا وقتی سیستم حساب کاربری فعال شود).' },
                ].map((item) => (
                  <div key={item.title} className="relative group">
                    <div className="rounded-[16px] bg-white/55 border border-black/5 px-4 py-3 cursor-default">
                      <p className="text-sm font-black text-gray-900">{item.title}</p>
                    </div>

                    <div className="pointer-events-none absolute right-0 top-[calc(100%+10px)] z-30 w-[240px] rounded-[14px] border border-black/10 bg-[#111827] text-white px-4 py-3 text-xs leading-relaxed shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                      {item.desc}
                      <div className="absolute -top-1.5 right-5 w-3 h-3 rotate-45 bg-[#111827] border-l border-t border-black/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mobile */}
          <div className="md:hidden">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Activity className="text-white w-5 h-5" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter text-[#111827]">تخمینو</span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/5 px-3 py-2 text-[11px] font-black text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  پردازش در مرورگر
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                سایت آموزشی و تصمیم‌ساز مالی؛ تخمین‌های شفاف و قابل‌فهم.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-[18px] bg-white/55 border border-black/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle('quick')}
                  className="w-full flex items-center justify-between px-4 py-3"
                  aria-expanded={openKey === 'quick'}
                >
                  <span className="font-black text-sm text-[#111827]">دسترسی سریع</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      openKey === 'quick' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openKey === 'quick' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="px-4 pb-3"
                    >
                      <div className="flex flex-col gap-3 text-sm font-bold text-gray-700">
                        <Link href="/" className="hover:text-[#059669] transition-colors">
                          صفحه اصلی
                        </Link>
                        <Link href="/tools" className="hover:text-[#059669] transition-colors">
                          ابزارها
                        </Link>
                        <Link href="/academy" className="hover:text-[#059669] transition-colors">
                          آکادمی تخمینو
                        </Link>
                        <Link href="/about" className="hover:text-[#059669] transition-colors">
                          درباره تخمینو
                        </Link>
                        <Link href="/contact" className="hover:text-[#059669] transition-colors">
                          تماس با ما
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-[18px] bg-white/55 border border-black/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle('resources')}
                  className="w-full flex items-center justify-between px-4 py-3"
                  aria-expanded={openKey === 'resources'}
                >
                  <span className="font-black text-sm text-[#111827]">منابع</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      openKey === 'resources' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openKey === 'resources' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="px-4 pb-3"
                    >
                      <div className="flex flex-col gap-3 text-sm font-bold text-gray-700">
                        <Link href="/academy" className="hover:text-[#059669] transition-colors">
                          دانشنامه
                        </Link>
                        <Link href="/contact" className="hover:text-[#059669] transition-colors">
                          پشتیبانی
                        </Link>
                        <a href="#" className="hover:text-[#059669] transition-colors">
                          حریم خصوصی
                        </a>
                        <a href="#" className="hover:text-[#059669] transition-colors">
                          شرایط استفاده
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-[18px] bg-white/55 border border-black/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle('trust')}
                  className="w-full flex items-center justify-between px-4 py-3"
                  aria-expanded={openKey === 'trust'}
                >
                  <span className="font-black text-sm text-[#111827]">اعتماد</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      openKey === 'trust' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openKey === 'trust' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="px-4 pb-4"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/5 px-3 py-2 text-xs font-black text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          خروجی‌ها تخمین هستند
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/5 px-3 py-2 text-xs font-black text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          ذخیره‌سازی حداقلی داده
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* bottom */}
          <div className="mt-8 sm:mt-10 pt-7 sm:pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-bold">تمامی حقوق برای تخمینو محفوظ است © ۱۴۰۴</p>
            <SocialIcons />
          </div>
        </div>
      </div>
    </footer>
  );
}