// app/(dark)/dashboard/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { requireAuth } from "@/lib/auth/requireAuth";
import { prisma } from "@/lib/prisma";
import DashboardGuardClient from "./DashboardGuardClient";
import NoBfcache from "./NoBfcache";

type ToolRun = {
  id: string;
  toolSlug: string;
  toolName: string;
  createdAt: Date;
  result: null | {
    version: number;
    rawData: any;
    summary: string | null;
  };
};

function safeJsonParse(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default async function DashboardPage() {
  // ✅ اگر لاگین نیستی، خودکار redirect به /login
  const auth = await requireAuth({ redirectTo: "/login" });

  // ✅ مستقیم از DB بخوان (بدون fetch به /api/tool-runs)
  const rows = await prisma.toolRun.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      result: {
        select: {
          version: true,
          rawData: true,
          summary: true,
        },
      },
    },
  });

  const toolRuns: ToolRun[] = rows.map((r) => ({
    id: r.id,
    toolSlug: r.toolSlug,
    toolName: r.toolName,
    createdAt: r.createdAt,
    result: r.result
      ? {
          ...r.result,
          rawData: safeJsonParse(r.result.rawData),
        }
      : null,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* ✅ جلوگیری از برگشت BFCache بعد از Logout / Back */}
      <NoBfcache />
      <DashboardGuardClient />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">پروفایل کاربری</h1>
              <p className="mt-2 text-sm text-slate-300">داشبورد آینده‌نگر تخمینو (Session واقعی)</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/20 px-3 py-1 text-xs">
                {auth.email}
              </span>

              <Link
                href="/tools/financial-literacy"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500 transition"
              >
                رفتن به ابزار
              </Link>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 transition"
                >
                  خروج
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-300">تعداد اجراهای ثبت‌شده</p>
            <p className="mt-2 text-3xl font-extrabold">{toolRuns.length}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-300">آخرین ابزار</p>
            <p className="mt-2 text-lg font-bold">{toolRuns[0]?.toolName ?? "—"}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-300">آخرین امتیاز آگاهی مالی</p>
            <p className="mt-2 text-lg font-bold">{toolRuns[0]?.result?.rawData?.totalScore ?? "—"}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-lg font-extrabold">تاریخچه ابزارها</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="p-4 text-right font-bold">ابزار</th>
                  <th className="p-4 text-right font-bold">زمان</th>
                  <th className="p-4 text-right font-bold">خلاصه</th>
                  <th className="p-4 text-right font-bold">لینک</th>
                </tr>
              </thead>
              <tbody>
                {toolRuns.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="p-4 font-bold">{r.toolName}</td>
                    <td className="p-4 text-slate-300">{new Date(r.createdAt).toLocaleString("fa-IR")}</td>
                    <td className="p-4 text-slate-300">{r.result?.summary ?? "—"}</td>
                    <td className="p-4">
                      <Link href={`/tools/${r.toolSlug}`} className="text-blue-300 hover:text-blue-200 underline">
                        مشاهده ابزار
                      </Link>
                    </td>
                  </tr>
                ))}

                {toolRuns.length === 0 && (
                  <tr>
                    <td className="p-6 text-slate-300" colSpan={4}>
                      هنوز هیچ تاریخی ثبت نشده.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}