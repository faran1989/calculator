"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold">ایمیل تأییدیه ارسال شد</h1>

          {email && (
            <p className="mt-3 text-sm text-slate-300">
              یک ایمیل به آدرس{" "}
              <span className="font-bold text-slate-100" dir="ltr">{email}</span>{" "}
              ارسال شد.
            </p>
          )}

          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            لطفاً صندوق ورودی خود را بررسی کنید و روی لینک تأیید کلیک کنید.
            <br />
            این لینک تا ۲۴ ساعت معتبر است.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <p className="text-xs text-slate-500">
              ایمیل دریافت نکردید؟ پوشه Spam را هم بررسی کنید.
            </p>
            <Link
              href="/login"
              className="mx-auto text-xs text-blue-400 hover:text-blue-300 underline"
            >
              بازگشت به صفحه ورود
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
