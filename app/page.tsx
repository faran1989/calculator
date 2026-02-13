'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Target, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#070A12] text-white"
      style={{
        backgroundImage:
          'radial-gradient(1200px 600px at 90% -10%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(900px 500px at 10% 10%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(700px 420px at 50% 120%, rgba(99,102,241,0.18), transparent 60%)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Sparkles className="h-5 w-5 text-white/90" />
            </span>
            <div className="leading-tight">
              <div className="text-sm text-white/60">Takhmino</div>
              <div className="text-base font-semibold">تخمینو</div>
            </div>
          </div>

          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/15"
          >
            مشاهده ابزارها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Hero */}
        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-white/70 ring-1 ring-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
              تصمیم‌یار مالی، سناریومحور و شفاف
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-[1.25] tracking-tight sm:text-4xl">
              قبل از هر تصمیم مالی،
              <span className="block bg-gradient-to-l from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                تخمین بزن.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              تخمینو به‌جای اینکه فقط «عدد» بده، کمک می‌کنه نتیجه رو بفهمی: با فرض‌های شفاف،
              سناریوهای قابل مقایسه و پیشنهادهای عملی برای بهتر کردن نتیجه.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-400 to-sky-400 px-5 py-3 text-sm font-extrabold text-[#061017] shadow-[0_12px_40px_rgba(16,185,129,0.18)] transition hover:brightness-110"
              >
                شروع با ابزارها
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                خواندن مقاله‌ها
              </Link>
            </div>

            {/* Trust notes */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Feature
                icon={<Target className="h-4 w-4" />}
                title="هدف‌محور"
                desc="مسیر رسیدن به هدف را قابل‌درک می‌کند."
              />
              <Feature
                icon={<ShieldCheck className="h-4 w-4" />}
                title="شفاف"
                desc="فرض‌ها روشن هستند؛ ادعای قطعیت نداریم."
              />
              <Feature
                icon={<Sparkles className="h-4 w-4" />}
                title="اپ‌گونه"
                desc="سریع، ساده، موبایل‌محور و خوش‌دست."
              />
            </div>
          </div>

          {/* Right card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">پیشنهاد شروع</div>
                  <div className="mt-1 text-xs text-white/60">
                    ۳ ابزار محبوب برای شروع سریع
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
                  نسخه MVP
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <QuickLink
                  href="/tools/home-buy"
                  title="تخمین خرید خانه"
                  desc="با پس‌انداز و تورم، زمان رسیدن به هدف را تخمین بزن."
                />
                <QuickLink
                  href="/tools/loan"
                  title="تخمین اقساط وام"
                  desc="قسط ماهانه، کل سود و نسبت‌ها را ببین."
                />
                <QuickLink
                  href="/tools/gold-goal"
                  title="تخمین هدف با پس‌انداز طلا"
                  desc="اثر رشد طلا روی رسیدن به هدف را بسنج."
                />
              </div>

              <div className="mt-5 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/70">
                  نکته:
                  <span className="text-white/55">
                    {' '}
                    خروجی‌ها «تخمین» هستند و به فرض‌ها وابسته‌اند. برای تصمیم نهایی، چند سناریو را
                    مقایسه کن.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-white/40">
              © {new Date().getFullYear()} Takhmino — ساخت ایران، برای تصمیم‌های بهتر
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
          {icon}
        </span>
        {title}
      </div>
      <div className="mt-2 text-xs leading-6 text-white/60">{desc}</div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-1 text-xs leading-6 text-white/60">{desc}</div>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition group-hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 text-white/80" />
        </span>
      </div>
    </Link>
  );
}
