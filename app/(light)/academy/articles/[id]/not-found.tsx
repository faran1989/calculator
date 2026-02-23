// app/(light)/academy/articles/[id]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#060C1A] text-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 text-center">
        <p className="text-lg font-extrabold text-white">این مقاله پیدا نشد</p>
        <p className="mt-2 text-sm leading-7 text-[#9CA3AF]">
          لینک مقاله اشتباهه یا هنوز منتشر نشده.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/academy"
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
          >
            برگشت به آکادمی
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
          >
            خانه
          </Link>
        </div>
      </div>
    </div>
  );
}