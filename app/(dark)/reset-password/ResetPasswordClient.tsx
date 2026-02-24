"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // No token in URL
  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center space-y-4">
          <p className="text-red-300 font-bold">لینک بازیابی نامعتبر است.</p>
          <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 font-bold">
            درخواست لینک جدید
          </Link>
        </div>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("رمزهای عبور با هم مطابقت ندارند.");
      return;
    }
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "خطایی رخ داد.");
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
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
          {done ? (
            /* ── SUCCESS ── */
            <div className="text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black">رمز عبور تغییر کرد!</h2>
                <p className="mt-2 text-sm text-slate-400">در حال انتقال به صفحه ورود...</p>
              </div>
            </div>
          ) : (
            /* ── FORM ── */
            <>
              <h1 className="text-2xl font-black">تعیین رمز جدید</h1>
              <p className="mt-2 text-sm text-slate-400">رمز جدید حسابت رو وارد کن.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-2">رمز عبور جدید</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="حداقل ۸ کاراکتر"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-2">تکرار رمز عبور</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="رمز را دوباره وارد کن"
                    required
                    autoComplete="new-password"
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
                  {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
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
