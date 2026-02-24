// app/(dark)/dashboard/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { requireAuth } from "@/lib/auth/requireAuth";
import { prisma } from "@/lib/prisma";
import DashboardGuardClient from "./DashboardGuardClient";
import NoBfcache from "./NoBfcache";
import AvatarWithFallback from "@/components/AvatarWithFallback";
import { getGravatarUrl } from "@/lib/gravatar";
import { Activity, BarChart3, BookOpen, Calculator, ChevronLeft, Home, LogOut, Target, TrendingUp, User } from "lucide-react";

type ToolRun = {
  id: string;
  toolSlug: string;
  toolName: string;
  createdAt: Date;
  result: null | {
    version: number;
    rawData: any;
    summary: string | null;
  };
};

function safeJsonParse(value: unknown) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}

function getInitials(name?: string | null, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : "U";
}

function getPersianDate() {
  return new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPersianGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "شب بخیر";
  if (hour < 12) return "صبح بخیر";
  if (hour < 17) return "روز بخیر";
  if (hour < 21) return "عصر بخیر";
  return "شب بخیر";
}

const TOOL_META: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  "financial-literacy": { icon: "📊", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", label: "سواد مالی" },
  "loan":              { icon: "🏦", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   label: "محاسبه وام" },
  "gold-goal":         { icon: "🥇", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  label: "هدف طلا" },
  "purchasing-power":  { icon: "💸", color: "text-rose-700",   bg: "bg-rose-50 border-rose-200",   label: "قدرت خرید" },
  "home-buy":          { icon: "🏠", color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200", label: "خانه‌دار شدن" },
};

function getToolMeta(slug: string) {
  return TOOL_META[slug] ?? { icon: "⚙️", color: "text-slate-700", bg: "bg-slate-50 border-slate-200", label: slug };
}

export default async function DashboardPage() {
  const auth = await requireAuth({ redirectTo: "/login" });

  const [user, rows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true, avatar: true, createdAt: true, profile: { select: { financialScore: true, financialType: true, totalToolRuns: true } } },
    }),
    prisma.toolRun.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { result: { select: { version: true, rawData: true, summary: true } } },
    }),
  ]);

  const toolRuns: ToolRun[] = rows.map((r) => ({
    id: r.id,
    toolSlug: r.toolSlug,
    toolName: r.toolName,
    createdAt: r.createdAt,
    result: r.result ? { ...r.result, rawData: safeJsonParse(r.result.rawData) } : null,
  }));

  // Tool usage breakdown
  const toolUsage: Record<string, number> = {};
  for (const run of toolRuns) {
    toolUsage[run.toolSlug] = (toolUsage[run.toolSlug] ?? 0) + 1;
  }
  const sortedTools = Object.entries(toolUsage).sort((a, b) => b[1] - a[1]);

  const financialScore = user?.profile?.financialScore ?? toolRuns[0]?.result?.rawData?.totalScore ?? null;
  const financialType  = user?.profile?.financialType ?? null;
  const initials       = getInitials(user?.name, user?.email ?? auth.email);
  const displayName    = user?.name || auth.email.split("@")[0];
  const gravatarUrl    = getGravatarUrl(auth.email, 72);
  const joinedDate     = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  // Score ring helpers
  const scorePercent = financialScore != null ? Math.min(100, Math.max(0, (financialScore / 100) * 100)) : null;
  const circumference = 2 * Math.PI * 40; // r=40
  const dashOffset    = scorePercent != null ? circumference - (scorePercent / 100) * circumference : circumference;

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 text-slate-900">
      <NoBfcache />
      <DashboardGuardClient />

      {/* ─── TOP NAV ─── */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Activity className="text-white w-4 h-4" />
            </div>
            <span className="text-[#111827] font-black text-base tracking-tight hidden sm:block">تخمینو</span>
          </Link>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-bold text-slate-800">{displayName}</span>
              <span className="text-xs text-slate-400">{auth.email}</span>
            </div>
            <AvatarWithFallback src={gravatarUrl} initials={initials} size={36} />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:block">خروج</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#059669] via-emerald-500 to-teal-400 p-7 sm:p-10 text-white shadow-2xl shadow-emerald-200">
          {/* Background decorations */}
          <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-8 w-44 h-44 rounded-full bg-teal-300/20 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <p className="text-emerald-100 text-sm font-medium">{getPersianDate()}</p>
              <h1 className="text-2xl sm:text-3xl font-black">
                {getPersianGreeting()}، {displayName} 👋
              </h1>
              <p className="text-emerald-100 text-sm max-w-md">
                {toolRuns.length > 0
                  ? `تا الان ${toolRuns.length} بار از ابزارهای تخمینو استفاده کردی. آینده مالیت داره شکل می‌گیره.`
                  : "هنوز ابزاری امتحان نکردی. از کجا شروع کنیم؟"}
              </p>
              {joinedDate && (
                <p className="text-emerald-200 text-xs pt-1">عضو از {joinedDate}</p>
              )}
            </div>

            {/* Score Ring */}
            {financialScore != null ? (
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{financialScore}</span>
                    <span className="text-[10px] text-emerald-100 font-medium">از ۱۰۰</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-white/90">امتیاز مالی</span>
                {financialType && (
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full text-white font-medium">{financialType}</span>
                )}
              </div>
            ) : (
              <Link
                href="/tools/financial-literacy"
                className="shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 transition-all group"
              >
                <BarChart3 className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-white/90 font-bold text-center leading-tight px-2">بسنج سواد مالیت</span>
              </Link>
            )}
          </div>
        </section>

        {/* ─── STATS GRID ─── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "اجراهای ثبت‌شده",
              value: toolRuns.length,
              icon: <Activity className="w-5 h-5" />,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-200",
            },
            {
              label: "امتیاز مالی",
              value: financialScore != null ? `${financialScore}/۱۰۰` : "—",
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-200",
            },
            {
              label: "نوع مالی",
              value: financialType ?? "—",
              icon: <Target className="w-5 h-5" />,
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-200",
            },
            {
              label: "آخرین ابزار",
              value: toolRuns[0] ? getToolMeta(toolRuns[0].toolSlug).label : "—",
              icon: <Calculator className="w-5 h-5" />,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-200",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border ${stat.border} ${stat.bg} p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`${stat.color} ${stat.bg} w-9 h-9 rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-800 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── TOOLS USAGE ─── */}
          <section className="lg:col-span-1 rounded-3xl border border-black/8 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800">ابزارهای من</h2>
              <Link href="/tools" className="text-xs text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1">
                همه ابزارها <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {sortedTools.length > 0 ? (
                sortedTools.map(([slug, count]) => {
                  const meta = getToolMeta(slug);
                  const maxCount = sortedTools[0][1];
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <Link
                      key={slug}
                      href={`/tools/${slug}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${meta.bg} hover:shadow-sm transition-all group`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
                          <span className="text-xs text-slate-400 font-bold">{count}×</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                          <div className="h-full rounded-full bg-current opacity-40 transition-all" style={{ width: `${pct}%`, color: "inherit" }} />
                        </div>
                      </div>
                      <ChevronLeft className={`w-4 h-4 ${meta.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </Link>
                  );
                })
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="text-4xl">🧭</div>
                  <p className="text-slate-500 text-sm">هنوز ابزاری امتحان نکردی</p>
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    کشف ابزارها
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* ─── RECENT ACTIVITY ─── */}
          <section className="lg:col-span-2 rounded-3xl border border-black/8 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800">آخرین فعالیت‌ها</h2>
              <span className="text-xs text-slate-400">{toolRuns.length} فعالیت</span>
            </div>

            {toolRuns.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {toolRuns.slice(0, 8).map((run) => {
                  const meta = getToolMeta(run.toolSlug);
                  const timeAgo = new Date(run.createdAt).toLocaleDateString("fa-IR", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <Link
                      key={run.id}
                      href={`/tools/${run.toolSlug}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${meta.bg}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${meta.color}`}>{meta.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {run.result?.summary ?? "اجرا شد"}
                        </p>
                      </div>
                      <div className="shrink-0 text-left">
                        <p className="text-xs text-slate-400 text-left">{timeAgo}</p>
                        <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-slate-500 mt-1 mr-auto transition-colors" />
                      </div>
                    </Link>
                  );
                })}
                {toolRuns.length > 8 && (
                  <div className="px-6 py-4 text-center">
                    <span className="text-xs text-slate-400">و {toolRuns.length - 8} فعالیت دیگر</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 px-6">
                <div className="text-5xl">📊</div>
                <p className="text-slate-700 font-bold text-base">تاریخچه‌ات خالیه</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">اولین ابزار رو امتحان کن تا فعالیت‌هات اینجا نمایش داده بشن</p>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                >
                  <Activity className="w-4 h-4" />
                  شروع کن
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* ─── CTA BANNER ─── */}
        {toolRuns.length === 0 && (
          <section className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-7 flex flex-col sm:flex-row items-center gap-5 justify-between">
            <div className="space-y-1 text-center sm:text-right">
              <h3 className="text-lg font-black text-slate-800">از کجا شروع کنم؟</h3>
              <p className="text-slate-500 text-sm">آزمون سواد مالی بهت می‌گه دقیقاً کجای سفر مالیتی</p>
            </div>
            <Link
              href="/tools/financial-literacy"
              className="shrink-0 flex items-center gap-2.5 bg-[#059669] text-white font-black px-6 py-3.5 rounded-2xl hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-200 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              آزمون سواد مالی
            </Link>
          </section>
        )}

        {/* ─── QUICK LINKS ─── */}
        <section>
          <h2 className="text-sm font-black text-slate-400 mb-3 px-1">دسترسی سریع</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/tools/financial-literacy", icon: "📊", label: "سواد مالی", desc: "بسنج خودت رو" },
              { href: "/tools/loan",               icon: "🏦", label: "محاسبه وام", desc: "اقساط رو حساب کن" },
              { href: "/tools/gold-goal",          icon: "🥇", label: "هدف طلا",  desc: "پس‌انداز طلا" },
              { href: "/tools/purchasing-power",   icon: "💸", label: "قدرت خرید", desc: "تورم رو بفهم" },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-black/8 bg-white hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex flex-col gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform inline-block">{tool.icon}</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{tool.label}</p>
                  <p className="text-xs text-slate-400">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 text-center">
          <p className="text-xs text-slate-300">تخمینو · آینده‌نگری مالی هوشمند</p>
        </footer>
      </div>
    </main>
  );
}
