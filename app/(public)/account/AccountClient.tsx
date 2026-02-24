"use client";

import { useState } from "react";

/* ─── تعریف مزایای ثبت‌نام ─── */
const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    title: "ذخیره پیشرفت خرید خانه",
    desc: "اطلاعاتی که وارد کردی ذخیره میمونه. هر بار از صفر شروع نمیکنی.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "نمودار و تحلیل شخصی",
    desc: "ببین چطور پس‌اندازت در طول زمان رشد کرده و کجا بهتر میشد عمل کنی.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: "تشخیص رفتار مالی",
    desc: "آزمون روانشناسی مالی نتایجت رو ذخیره میکنه و پیشرفتت رو دنبال میکنه.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "مسیر یادگیری شخصی‌سازی‌شده",
    desc: "بر اساس نقاط ضعف مالیت، مقالات آکادمی تخمینو برات کیوریت میشه.",
  },
];

const STATS = [
  { value: "۱۲۰٫۰۰۰+", label: "کاربر فعال" },
  { value: "۴.۸", label: "امتیاز کاربران" },
  { value: "رایگان", label: "همیشه" },
];

const BRAND = "#10B981";

export default function AccountClient() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  const goRegister = () => setActiveTab("register");

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', 'Tahoma', sans-serif" }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 flex items-center justify-center p-4 lg:p-8"
    >
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-56 -right-56 w-[600px] h-[600px] bg-emerald-100/45 rounded-full blur-3xl" />
        <div className="absolute -bottom-56 -left-56 w-[600px] h-[600px] bg-teal-100/35 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-cyan-50/70 rounded-full blur-3xl" />
      </div>

      <h1 className="sr-only">حساب کاربری تخمینو</h1>

      <div className="relative w-full max-w-5xl">
        {/* ── Main card ── */}
        <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-100/50 border border-white/80 overflow-hidden">
          {/* ✅ (2) Divider نرم بین دو ستون (فقط دسکتاپ) */}
          <div className="hidden lg:block absolute inset-y-0 right-[45%] w-10 pointer-events-none z-20">
            <div className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/60 to-white/0 blur-md" />
            <div className="absolute inset-y-0 right-1/2 w-px bg-white/35" />
          </div>

          <div className="flex flex-col lg:flex-row min-h-[620px]">
            {/* ════════════════════════════════════
                ستون راست: توضیحات/مزایا (Brand)
                ════════════════════════════════════ */}
            <div className="lg:w-[45%] relative overflow-hidden order-2 lg:order-1">
              {/* brand gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600" />
              {/* texture overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "28px 28px",
                }}
              />
              {/* deco circles */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />

              <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">تخمینو</p>
                      <p className="text-emerald-100 text-xs mt-0.5">دستیار مالی هوشمند</p>
                    </div>
                  </div>

                  <h2 className="text-white text-2xl font-bold leading-relaxed mb-2">
                    آینده مالیت رو
                    <br />
                    <span className="text-emerald-100">با داده تصمیم بگیر</span>
                  </h2>

                  <p className="text-emerald-50 text-sm leading-7 mb-6">
                    با یه حساب رایگان، همه محاسباتت ذخیره میشه
                    <br />
                    و یه تصویر کامل از وضعیت مالیت داری.
                  </p>

                  <button
                    type="button"
                    onClick={goRegister}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-black/10 hover:-translate-y-0.5"
                  >
                    همین الان رایگان شروع کن
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* ✅ (3) CTA ثانویه خیلی ظریف (بدون دکمه شدن) */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <a
                      href="/tools"
                      className="text-white/80 hover:text-white transition-colors underline decoration-white/25 hover:decoration-white/60 underline-offset-4"
                    >
                      اول ابزارها رو ببین
                    </a>
                    <span className="text-white/40">•</span>
                    <a
                      href="/academy"
                      className="text-white/80 hover:text-white transition-colors underline decoration-white/25 hover:decoration-white/60 underline-offset-4"
                    >
                      اول آکادمی رو ببین
                    </a>
                  </div>

                  <div className="space-y-5 mt-8">
                    {BENEFITS.map((b) => (
                      <div key={b.title} className="flex items-start gap-3.5">
                        <div className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-emerald-50 flex-shrink-0 mt-0.5">
                          {b.icon}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold leading-none mb-1">{b.title}</p>
                          <p className="text-emerald-100 text-xs leading-5">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    {STATS.map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                        <p className="text-emerald-100 text-xs mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════
                ستون چپ: فرم‌ها
                ════════════════════════════════════ */}
            <div className="lg:w-[55%] p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2 bg-gradient-to-b from-emerald-50/55 via-white/40 to-white/50">
              {/* خروج محترمانه */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-800">تخمینو</span>
                </div>

                <a
                  href="/"
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  بازگشت
                </a>
              </div>

              {/* ✅ (1) کارت فرم با عمق بیشتر + border واضح‌تر + highlight داخلی */}
              <div className="relative rounded-2xl border border-emerald-200/55 bg-white/70 shadow-[0_18px_60px_-30px_rgba(16,185,129,0.45)] p-5 sm:p-6">
                <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />

                {/* tabs */}
                <div className="flex bg-emerald-50 rounded-2xl p-1.5 mb-6 gap-1">
                  {(["login", "register"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab === "login" ? "ورود به حساب" : "ثبت‌نام رایگان"}
                    </button>
                  ))}
                </div>

                {/* headline */}
                <div className="mb-5">
                  {activeTab === "login" ? (
                    <>
                      <h2 className="text-xl font-bold text-slate-800">خوش برگشتی 👋</h2>
                      <p className="text-slate-500 text-sm mt-1">نمودارها و محاسبات ذخیره‌شده‌ات منتظرته</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-slate-800">یه قدم تا آگاهی مالی 🌱</h2>
                      <p className="text-slate-500 text-sm mt-1">رایگان، بدون کارت بانکی — همیشه</p>
                    </>
                  )}
                </div>

                {/* Google OAuth (UI) */}
                <button className="w-full py-3 mb-4 border border-slate-200/70 bg-white/75 hover:bg-white rounded-xl flex items-center justify-center gap-3 text-slate-700 text-sm font-semibold transition-all shadow-sm hover:shadow">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {activeTab === "login" ? "ورود با گوگل" : "ثبت‌نام با گوگل"}
                </button>

                <div className="relative flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-slate-400 text-xs">یا با ایمیل</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* ── LOGIN FORM ── */}
                {activeTab === "login" && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        dir="ltr"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-slate-700">رمز عبور</label>
                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          فراموشی رمز؟
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="رمز عبور"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                    </div>

                    <button
                      className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm mt-2"
                      style={{
                        background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)`,
                      }}
                    >
                      ورود به حساب
                    </button>

                    {/* ✅ (5) Trust microcopy */}
                    <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100">
                        🔒
                      </span>
                      ایمیل شما امن می‌ماند و هیچ‌وقت اسپم نمی‌فرستیم.
                    </p>

                    <p className="text-center text-sm text-slate-500 pt-1">
                      هنوز ثبت‌نام نکردی؟{" "}
                      <button onClick={() => setActiveTab("register")} className="text-emerald-600 font-semibold hover:text-emerald-700">
                        شروع رایگان
                      </button>
                    </p>
                  </div>
                )}

                {/* ── REGISTER FORM ── */}
                {activeTab === "register" && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">نام</label>
                        <input
                          type="text"
                          placeholder="علی"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">نام خانوادگی</label>
                        <input
                          type="text"
                          placeholder="احمدی"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        dir="ltr"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="حداقل ۸ کاراکتر"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                    </div>

                    {/* privacy note */}
                    <div className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-3">
                      <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <p className="text-emerald-900 text-xs leading-5">
                        اطلاعات مالی‌ات فقط روی دستگاه خودت ذخیره میشه و هیچ‌وقت به اشتراک گذاشته نمیشه.
                      </p>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 mt-0.5 rounded accent-emerald-600 flex-shrink-0" />
                      <span className="text-slate-500 text-sm leading-6">
                        با <span className="text-emerald-600 font-medium">قوانین و حریم خصوصی</span> تخمینو موافقم
                      </span>
                    </label>

                    <button
                      className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm"
                      style={{
                        background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)`,
                      }}
                    >
                      ساخت حساب رایگان
                    </button>

                    {/* ✅ (5) Trust microcopy */}
                    <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100">
                        🔒
                      </span>
                      بعد از ثبت‌نام هم می‌تونی هر زمان خواستی حذف حساب انجام بدی.
                    </p>

                    <p className="text-center text-sm text-slate-500 pt-1">
                      قبلاً ثبت‌نام کردی؟{" "}
                      <button onClick={() => setActiveTab("login")} className="text-emerald-600 font-semibold hover:text-emerald-700">
                        وارد شو
                      </button>
                    </p>
                  </div>
                )}

                {/* گزینه‌های جایگزین */}
                <div className="mt-6 pt-5 border-t border-slate-200/70">
                  <p className="text-sm font-semibold text-slate-700">
                    هنوز مطمئن نیستی؟
                    <span className="text-slate-500 font-normal mr-2">می‌تونی اول این بخش‌ها رو ببینی:</span>
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="/tools"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white/75 hover:bg-white text-slate-700 font-semibold text-sm transition-all shadow-sm hover:shadow"
                    >
                      {/* ✅ (6) Emoji badge */}
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 text-sm">
                        🧰
                      </span>
                      مشاهده ابزارها
                    </a>

                    <a
                      href="/academy"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white/75 hover:bg-white text-slate-700 font-semibold text-sm transition-all shadow-sm hover:shadow"
                    >
                      {/* ✅ (6) Emoji badge */}
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 text-sm">
                        🎓
                      </span>
                      مشاهده آکادمی
                    </a>
                  </div>
                </div>
              </div>
              {/* end card */}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap");
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}