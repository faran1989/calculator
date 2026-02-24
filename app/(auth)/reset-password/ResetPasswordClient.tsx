"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, Eye, EyeOff } from "lucide-react";

const BRAND = "#10B981";

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

  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 flex items-center justify-center px-4">
        <div dir="rtl" className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-2xl border border-emerald-200/55 shadow-2xl p-6 text-center space-y-4">
          <p className="text-red-600 font-bold">لینک بازیابی نامعتبر است.</p>
          <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
            درخواست لینک جدید
          </Link>
        </div>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("رمزهای عبور با هم مطابقت ندارند."); return; }
    if (password.length < 8) { setError("رمز عبور باید حداقل ۸ کاراکتر باشد."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) { setError(data?.error ?? "خطایی رخ داد."); return; }
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch {
      setError("خطای غیرمنتظره. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight">تخمینو</span>
        </Link>

        <div dir="rtl" className="w-full bg-white/95 backdrop-blur-2xl rounded-2xl border border-emerald-200/55 shadow-2xl p-6">
          {done ? (
            <div className="text-center space-y-5 py-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">رمز عبور تغییر کرد!</h2>
                <p className="mt-2 text-sm text-slate-500">در حال انتقال به صفحه ورود...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800">تعیین رمز جدید</h1>
                <p className="text-slate-500 text-sm mt-1">رمز جدید حسابت رو وارد کن</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور جدید</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="حداقل ۸ کاراکتر"
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تکرار رمز عبور</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="رمز را دوباره وارد کن"
                    required
                    autoComplete="new-password"
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
                  {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
                </button>

                <p className="text-center text-sm text-slate-500 pt-1">
                  <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                    بازگشت به ورود
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
