import Link from "next/link";

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 text-zinc-900"
      style={{
        fontFamily:
          'Vazirmatn, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      }}
    >
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-12">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-700 shadow-sm">
            <span>Mobile-first</span>
            <span className="text-zinc-300">•</span>
            <span>سبک و سریع</span>
            <span className="text-zinc-300">•</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>MVP</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight">ماشین‌حساب‌ها</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            ابزارهای ساده و سریع برای تصمیم‌گیری‌های مالی روزمره.
          </p>
        </header>

        {/* List */}
        <section className="mt-7 space-y-3">
          <CalculatorCard
            title="چند سال دیگه می‌تونم خونه بخرم؟"
            subtitle="با فرض اینکه شرایط فعلی تغییر نکند"
            badge="MVP"
            href="/home-buy"
            cta="شروع"
          />
        </section>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-zinc-500 leading-5">
          این پروژه مرحله‌ای توسعه داده می‌شود.
        </p>
      </div>
    </main>
  );
}

function CalculatorCard(props: {
  title: string;
  subtitle: string;
  badge: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.10)]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-black leading-7">{props.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 leading-6">{props.subtitle}</p>
          </div>

          <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-600">
            {props.badge}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-zinc-500">ورود به ماشین‌حساب</span>

          <Link
            href={props.href}
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-black text-white shadow-lg shadow-zinc-900/20 active:scale-[0.99]"
          >
            {props.cta}
            <span className="text-base leading-none">←</span>
          </Link>
        </div>
      </div>
    </div>
  );

}
