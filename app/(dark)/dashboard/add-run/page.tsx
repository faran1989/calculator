"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddRunTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function createRun() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/tool-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "financial-literacy",
          toolName: "سنجش آگاهی مالی",
          version: 1,
          rawData: {
            totalScore: 62,
            categoryScores: {
              budget: 70,
              crisis: 55,
              inflation: 60,
              investment: 50,
              behavior: 75,
            },
            type: "متعادل",
          },
          summary: "امتیاز کل ۶۲. نقاط قوت: بودجه‌بندی و رفتار مالی. قابل رشد: سرمایه‌گذاری.",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setMsg(data?.error ?? "خطا در ثبت");
        setLoading(false);
        return;
      }

      setMsg("ثبت شد ✅ حالا برو داشبورد.");
      router.refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <h1 className="text-2xl font-extrabold">تست ثبت اجرا</h1>
          <p className="mt-2 text-sm text-slate-300">
            این صفحه فقط برای تست است تا مطمئن شویم ToolRun با Session واقعی ذخیره می‌شود.
          </p>

          <button
            onClick={createRun}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 transition disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت یک اجرای تستی"}
          </button>

          {msg && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {msg}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-xs text-slate-300">
            <Link href="/dashboard" className="hover:text-slate-100 underline">
              برگشت به داشبورد
            </Link>
            <Link href="/tools/financial-literacy" className="hover:text-slate-100 underline">
              رفتن به ابزار
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
