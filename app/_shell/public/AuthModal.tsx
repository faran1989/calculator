"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const BRAND = "#10B981";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

type Tab = "login" | "register" | "forgot";

type Props = {
  initialTab: "login" | "register";
  onClose: () => void;
};

export default function AuthModal({ initialTab, onClose }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  const loginTurnstileRef = useRef<TurnstileInstance | null>(null);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regCaptchaToken, setRegCaptchaToken] = useState<string | null>(null);
  const regTurnstileRef = useRef<TurnstileInstance | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function goToTab(tab: Tab) {
    if (tab !== "forgot") {
      setForgotEmail(""); setForgotError(null); setForgotSent(false);
    }
    setActiveTab(tab);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    if (!loginCaptchaToken) {
      setLoginError("لطفاً تأیید کپچا را کامل کنید.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, captchaToken: loginCaptchaToken }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setLoginError(data?.error ?? "خطا در ورود");
        loginTurnstileRef.current?.reset();
        setLoginCaptchaToken(null);
        return;
      }
      onClose();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoginError("خطای غیرمنتظره");
      loginTurnstileRef.current?.reset();
      setLoginCaptchaToken(null);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim()) { setRegError("نام الزامی است."); return; }
    if (regPassword.length < 8) { setRegError("رمز عبور باید حداقل ۸ کاراکتر باشد."); return; }
    if (!regCaptchaToken) {
      setRegError("لطفاً تأیید کپچا را کامل کنید.");
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName.trim(), captchaToken: regCaptchaToken }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setRegError(data?.error ?? "خطا در ثبت‌نام");
        regTurnstileRef.current?.reset();
        setRegCaptchaToken(null);
        return;
      }
      onClose();
      router.push(`/check-email?email=${encodeURIComponent(regEmail)}`);
    } catch {
      setRegError("خطای غیرمنتظره");
      regTurnstileRef.current?.reset();
      setRegCaptchaToken(null);
    } finally {
      setRegLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) { setForgotError(data?.error ?? "خطایی رخ داد."); return; }
      setForgotSent(true);
    } catch {
      setForgotError("خطای غیرمنتظره.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          dir="rtl"
          className="pointer-events-auto w-full max-w-md relative rounded-2xl border border-emerald-200/55 bg-white/95 backdrop-blur-2xl shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── FORGOT view ── */}
          {activeTab === "forgot" ? (
            <div className="mb-5">
              <button
                type="button"
                onClick={() => goToTab("login")}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-4"
              >
                <ArrowRight className="w-4 h-4" />
                بازگشت به ورود
              </button>
              <h2 className="text-xl font-bold text-slate-800">فراموشی رمز عبور</h2>
              <p className="text-slate-500 text-sm mt-1">ایمیل حسابت رو وارد کن تا لینک بازیابی برات بفرستیم</p>
            </div>
          ) : (
            <>
              <div className="flex bg-emerald-50 rounded-2xl p-1.5 mb-5 gap-1">
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => goToTab(tab)}
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

              <div className="mb-4">
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
            </>
          )}

          {/* ── LOGIN FORM ── */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">رمز عبور</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="رمز عبور"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Turnstile */}
              {TURNSTILE_SITE_KEY && (
                <div className="flex justify-center pt-1">
                  <Turnstile
                    ref={loginTurnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setLoginCaptchaToken(token)}
                    onExpire={() => setLoginCaptchaToken(null)}
                    onError={() => setLoginCaptchaToken(null)}
                    options={{ theme: "light", language: "fa" }}
                  />
                </div>
              )}

              {loginError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || (!!TURNSTILE_SITE_KEY && !loginCaptchaToken)}
                className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)` }}
              >
                {loginLoading ? "در حال ورود..." : "ورود به حساب"}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => goToTab("forgot")}
                  className="text-sm text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  فراموشی رمز؟
                </button>
                <p className="text-sm text-slate-500">
                  هنوز ثبت‌نام نکردی؟{" "}
                  <button type="button" onClick={() => goToTab("register")} className="text-emerald-600 font-semibold hover:text-emerald-700">
                    شروع رایگان
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  نام <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="علی احمدی"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور (حداقل ۸ کاراکتر)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="حداقل ۸ کاراکتر"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Turnstile */}
              {TURNSTILE_SITE_KEY && (
                <div className="flex justify-center pt-1">
                  <Turnstile
                    ref={regTurnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setRegCaptchaToken(token)}
                    onExpire={() => setRegCaptchaToken(null)}
                    onError={() => setRegCaptchaToken(null)}
                    options={{ theme: "light", language: "fa" }}
                  />
                </div>
              )}

              {regError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading || (!!TURNSTILE_SITE_KEY && !regCaptchaToken)}
                className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)` }}
              >
                {regLoading ? "در حال ثبت‌نام..." : "ساخت حساب رایگان"}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                قبلاً ثبت‌نام کردی؟{" "}
                <button type="button" onClick={() => goToTab("login")} className="text-emerald-600 font-semibold hover:text-emerald-700">
                  وارد شو
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {activeTab === "forgot" && (
            forgotSent ? (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800">ایمیل ارسال شد</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    اگر <span className="text-slate-700 font-medium" dir="ltr">{forgotEmail}</span> در سیستم ثبت شده باشد، لینک بازیابی ارسال شد.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">لینک تا ۱ ساعت معتبر است. پوشه Spam را هم بررسی کنید.</p>
                </div>
                <button
                  type="button"
                  onClick={() => goToTab("login")}
                  className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  بازگشت به ورود
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    dir="ltr"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                  />
                </div>

                {forgotError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                    {forgotError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm mt-1 disabled:opacity-60"
                  style={{ background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)` }}
                >
                  {forgotLoading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
                </button>

                <p className="text-center text-sm text-slate-500 pt-1">
                  رمزت رو یادت اومد؟{" "}
                  <button type="button" onClick={() => goToTab("login")} className="text-emerald-600 font-semibold hover:text-emerald-700">
                    ورود
                  </button>
                </p>
              </form>
            )
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
