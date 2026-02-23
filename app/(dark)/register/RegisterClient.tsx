"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("رمز عبور و تکرار آن مطابقت ندارند.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name.trim() || undefined }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "خطا در ثبت‌نام");
        setLoading(false);
        return;
      }

      router.replace(`/check-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err?.message ?? "خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <h1 className="text-2xl font-extrabold">ثبت‌نام</h1>
          <p className="mt-2 text-sm text-slate-300">
            حساب کاربری بسازید و با تخمینو سواد مالی‌تان را بسنجید.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-2">نام (اختیاری)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none focus:border-blue-500/60"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">ایمیل</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none focus:border-blue-500/60"
                dir="ltr"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">رمز عبور (حداقل ۸ کاراکتر)</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none focus:border-blue-500/60"
                dir="ltr"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">تکرار رمز عبور</label>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none focus:border-blue-500/60"
                dir="ltr"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 transition disabled:opacity-60"
            >
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <Link href="/" className="hover:text-slate-100 underline">
                صفحه اصلی
              </Link>
              <Link href="/login" className="hover:text-slate-100 underline">
                قبلاً ثبت‌نام کرده‌اید؟ ورود
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
