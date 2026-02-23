"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "لینک تأیید معتبر نیست.",
  used: "این لینک قبلاً استفاده شده است.",
  expired: "لینک تأیید منقضی شده است. لطفاً دوباره ثبت‌نام کنید.",
  server: "خطای سرور. لطفاً دوباره تلاش کنید.",
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const errorCode = searchParams.get("error");

  const [status, setStatus] = useState<"loading" | "error">(
    errorCode ? "error" : "loading"
  );
  const [errorMsg, setErrorMsg] = useState<string>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? "خطای نامشخص.") : ""
  );

  useEffect(() => {
    if (errorCode || !token) return;

    // Call the verify API — it will redirect on success or redirect with ?error=
    router.replace(`/api/auth/verify-email?token=${token}`);
  }, [token, errorCode, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-slate-300 text-sm">در حال تأیید ایمیل...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20 border border-red-500/30">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-xl font-extrabold">تأیید ناموفق</h1>
          <p className="mt-3 text-sm text-slate-300">{errorMsg}</p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/register"
              className="mx-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold hover:bg-blue-500 transition"
            >
              ثبت‌نام مجدد
            </Link>
            <Link
              href="/login"
              className="mx-auto text-xs text-slate-400 hover:text-slate-200 underline"
            >
              بازگشت به ورود
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
