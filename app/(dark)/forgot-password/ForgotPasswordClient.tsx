"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-105 transition-transform">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">تخمینو</span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          {sent ? (
            /* ── SUCCESS STATE ── */
            <div className="text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black">ایمیل ارسال شد</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  اگر <span className="text-slate-200 font-medium" dir="ltr">{email}</span> در سیستم ثبت شده باشد، لینک بازیابی رمز ارسال شد.
                </p>
                <p className="mt-3 text-xs text-slate-500">لینک تا ۱ ساعت معتبر است. پوشه Spam را هم بررسی کنید.</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-2 text-sm text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                بازگشت به ورود
              </Link>
            </div>
          ) : (
            /* ── FORM ── */
            <>
              <h1 className="text-2xl font-black">فراموشی رمز عبور</h1>
              <p className="mt-2 text-sm text-slate-400">ایمیل حسابت رو وارد کن تا لینک بازیابی برات بفرستیم.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-2">ایمیل</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                    autoComplete="email"
                    className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 font-black text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                    بازگشت به ورود
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
