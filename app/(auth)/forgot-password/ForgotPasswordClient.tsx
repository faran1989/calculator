"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

const BRAND = "#10B981";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "خطایی رخ داد. دوباره تلاش کنید.");
        return;
      }
      setSent(true);
    } catch {
      setError("خطای غیرمنتظره. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight">تخمینو</span>
        </Link>

        <div
          dir="rtl"
          className="w-full bg-white/95 backdrop-blur-2xl rounded-2xl border border-emerald-200/55 shadow-2xl p-6"
        >
          {sent ? (
            /* ── SUCCESS ── */
            <div className="text-center space-y-5 py-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">ایمیل ارسال شد</h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  اگر <span className="text-slate-700 font-medium" dir="ltr">{email}</span> در سیستم ثبت شده باشد، لینک بازیابی رمز ارسال شد.
                </p>
                <p className="mt-2 text-xs text-slate-400">لینک تا ۱ ساعت معتبر است. پوشه Spam را هم بررسی کنید.</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                بازگشت به ورود
              </Link>
            </div>
          ) : (
            /* ── FORM ── */
            <>
              <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800">فراموشی رمز عبور</h1>
                <p className="text-slate-500 text-sm mt-1">ایمیل حسابت رو وارد کن تا لینک بازیابی برات بفرستیم</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm mt-1 disabled:opacity-60"
                  style={{ background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)` }}
                >
                  {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
                </button>

                <p className="text-center text-sm text-slate-500 pt-1">
                  رمزت رو یادت اومد؟{" "}
                  <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                    ورود
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
