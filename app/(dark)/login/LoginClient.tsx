// app/(dark)/login/LoginClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function getSafeNext(nextRaw: string | null) {
  if (!nextRaw) return null;

  // decode امن
  let next = nextRaw;
  try {
    next = decodeURIComponent(nextRaw);
  } catch {
    next = nextRaw;
  }

  // فقط مسیر داخلی
  if (!next.startsWith("/")) return null;

  // جلوگیری از redirect loop یا مسیرهای ناخواسته
  const blocked = ["/login", "/api/auth/login", "/api/auth/logout"];
  if (blocked.some((p) => next === p || next.startsWith(p + "?"))) return null;

  return next;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeNext = useMemo(() => {
    return getSafeNext(searchParams.get("next"));
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "خطا در ورود");
        setLoading(false);
        return;
      }

      // ✅ استاندارد: بعد از لاگین برو next (اگر امن بود) وگرنه داشبورد
      // ✅ replace برای اینکه با Back برنگرده به صفحه لاگین
      router.replace(safeNext ?? "/dashboard");
      router.refresh();
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
          <h1 className="text-2xl font-extrabold">ورود</h1>

          <p className="mt-2 text-xs text-slate-400">
            مقصد بعد از ورود:{" "}
            <span className="font-bold text-slate-200" dir="ltr">
              {safeNext ?? "/dashboard"}
            </span>
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-2">ایمیل</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none focus:border-blue-500/60"
                dir="ltr"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">رمز عبور</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none focus:border-blue-500/60"
                dir="ltr"
                type="password"
                autoComplete="current-password"
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
              {loading ? "در حال ورود..." : "ورود"}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <Link href="/forgot-password" className="hover:text-emerald-300 transition-colors">
                رمز عبورت رو فراموش کردی؟
              </Link>
              <Link href="/register" className="hover:text-slate-100 underline">
                هنوز ثبت‌نام نکرده‌اید؟
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}