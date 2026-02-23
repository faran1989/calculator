// app/(light)/academy/articles/[id]/page.tsx
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft, ChevronRight, BookOpen, Wrench } from "lucide-react";

type Difficulty = "مبتدی" | "متوسط" | "پیشرفته";

type Article = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  difficulty: Difficulty;
  date: string;
  author: string;
  relatedTool?: string;
  relatedHref?: string;
  accent: string;
};

// ✅ فعلاً همان دیتای نمونه‌ی AcademyClient را اینجا هم داریم تا وابستگی ایجاد نشود
const ARTICLES: Article[] = [
  {
    id: 1,
    title: "P/E چیست و چطور ازش استفاده کنیم؟",
    excerpt:
      "نسبت قیمت به درآمد یکی از پرکاربردترین معیارهای ارزیابی سهام است. یاد بگیرید چطور از آن در تصمیم‌گیری استفاده کنید.",
    category: "invest",
    readTime: "۸ دقیقه",
    difficulty: "متوسط",
    date: "۲۵ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "ابزارها",
    relatedHref: "/tools",
    accent: "#3B82F6",
  },
  {
    id: 2,
    title: "بودجه‌بندی با روش ۵۰/۳۰/۲۰",
    excerpt:
      "یک روش ساده و کاربردی برای مدیریت درآمد ماهانه‌تان که میلیون‌ها نفر در دنیا از آن استفاده می‌کنند.",
    category: "budget",
    readTime: "۶ دقیقه",
    difficulty: "مبتدی",
    date: "۲۲ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "برنامه‌ریز بودجه",
    relatedHref: "/tools/budget-planner",
    accent: "#10B981",
  },
  {
    id: 3,
    title: "تورم چگونه ارزش پول شما را می‌خورد؟",
    excerpt:
      "درک تورم و تأثیر آن بر قدرت خرید، اولین قدم برای حفظ ارزش دارایی‌هاست. اینجا ساده توضیح می‌دهیم.",
    category: "inflation",
    readTime: "۷ دقیقه",
    difficulty: "مبتدی",
    date: "۱۵ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "قدرت خرید",
    relatedHref: "/tools/purchasing-power",
    accent: "#F59E0B",
  },
  {
    id: 4,
    title: "صندوق‌های سرمایه‌گذاری مشترک: انواع و انتخاب",
    excerpt:
      "صندوق درآمد ثابت، سهامی یا مختلط؟ راهنمای انتخاب صندوق مناسب بر اساس هدف و ریسک‌پذیری شما.",
    category: "invest",
    readTime: "۱۲ دقیقه",
    difficulty: "متوسط",
    date: "۱۸ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#8B5CF6",
  },
  {
    id: 5,
    title: "چرا هر ماه پول‌ات تموم می‌شه؟",
    excerpt:
      "تله‌های ذهنی رایج که باعث می‌شوند بدون اینکه بدانیم پول را اشتباه خرج کنیم و راه‌حل‌های ساده برای خروج.",
    category: "behavior",
    readTime: "۹ دقیقه",
    difficulty: "مبتدی",
    date: "۱۲ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#EC4899",
  },
  {
    id: 6,
    title: "صندوق اضطراری: چقدر، کجا، چطور؟",
    excerpt:
      "یک بالشتک مالی چند ماهه اضطراری چیست، چرا به آن نیاز دارید و بهترین مکان برای نگهداری آن کجاست.",
    category: "emergency",
    readTime: "۸ دقیقه",
    difficulty: "مبتدی",
    date: "۱۰ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#10B981",
  },
  {
    id: 7,
    title: "هزینه واقعی وام را چطور محاسبه کنیم؟",
    excerpt:
      "بانک‌ها نرخ را ساده نشان می‌دهند، اما هزینه واقعی وام بسیار بیشتر از نرخ اسمی است. این مقاله روش محاسبه را یاد می‌دهد.",
    category: "loan",
    readTime: "۱۰ دقیقه",
    difficulty: "متوسط",
    date: "۸ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "ماشین حساب وام",
    relatedHref: "/tools/loan-calculator",
    accent: "#F59E0B",
  },
  {
    id: 8,
    title: "سرمایه‌گذاری در طلا: فرصت یا تله؟",
    excerpt:
      "طلا در دوره‌های تورمی جذاب می‌شود اما آیا واقعاً بهترین گزینه برای حفظ ارزش پول شماست؟",
    category: "invest",
    readTime: "۱۱ دقیقه",
    difficulty: "متوسط",
    date: "۵ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#F59E0B",
  },
  {
    id: 9,
    title: "اثر لاته: هزینه‌های کوچک بزرگ می‌شوند",
    excerpt:
      "هزینه‌های جزئی روزانه در طول زمان به مبالغ بزرگی تبدیل می‌شوند. محاسبه کنید و تصمیم بگیرید.",
    category: "behavior",
    readTime: "۵ دقیقه",
    difficulty: "مبتدی",
    date: "۳ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#EC4899",
  },
];

function getArticleById(id: number) {
  return ARTICLES.find((a) => a.id === id) ?? null;
}

function safeSnippet(text: string, max = 160) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isFinite(articleId)) return {};

  const a = getArticleById(articleId);
  if (!a) return {};

  const title = `${a.title} | آکادمی تخمینو`;
  const description = safeSnippet(a.excerpt, 165);

  return {
    title,
    description,
    alternates: { canonical: `/academy/articles/${a.id}` },
    openGraph: {
      type: "article",
      locale: "fa_IR",
      url: `/academy/articles/${a.id}`,
      siteName: "تخمینو",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function AcademyArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isFinite(articleId)) notFound();

  const a = getArticleById(articleId);
  if (!a) notFound();

  const canonicalUrl = `https://takhmino.com/academy/articles/${a.id}`;

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: safeSnippet(a.excerpt, 180),
    inLanguage: "fa-IR",
    datePublished: "2024-02-01", // ✅ نمونه (بعداً وقتی CMS/MDX آمد واقعی می‌کنیم)
    author: { "@type": "Organization", name: a.author },
    publisher: { "@type": "Organization", name: "تخمینو" },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://takhmino.com/" },
      { "@type": "ListItem", position: 2, name: "آکادمی", item: "https://takhmino.com/academy" },
      { "@type": "ListItem", position: 3, name: a.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <Script
        id="schema-academy-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <Script
        id="schema-academy-article-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div dir="rtl" className="min-h-screen bg-[#060C1A] text-[#F9FAFB]">
        {/* Top bar */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060C1A]/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
              >
                <ChevronRight size={16} className="text-[#6B7280]" />
                بازگشت به آکادمی
              </Link>

              <span className="hidden text-xs text-[#6B7280] sm:inline">/</span>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
              >
                خانه
              </Link>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
            >
              <Wrench size={14} className="text-emerald-400" />
              ابزارها
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1628] to-[#060C1A] pb-10 pt-10 sm:pb-14 sm:pt-14">
          <div
            className="pointer-events-none absolute right-[6%] top-[18%] h-72 w-72 rounded-full blur-[90px]"
            style={{ background: `${a.accent}14` }}
          />
          <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold sm:text-sm"
                style={{
                  color: a.accent,
                  borderColor: `${a.accent}55`,
                  background: `${a.accent}12`,
                }}
              >
                <BookOpen size={15} />
                مقاله آکادمی
              </span>

              <h1 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                {a.title}
              </h1>

              <p className="mx-auto mb-6 max-w-2xl text-sm leading-7 text-[#9CA3AF] sm:text-base sm:leading-8">
                {a.excerpt}
              </p>

              <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-[#D1D5DB]">
                  <Clock size={12} className="text-[#6B7280]" />
                  {a.readTime}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-[#D1D5DB]">
                  {a.date}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-[#D1D5DB]">
                  {a.author}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-[#D1D5DB]">
                  سطح: {a.difficulty}
                </span>
              </div>

              {a.relatedHref && (
                <div className="mt-6">
                  <Link
                    href={a.relatedHref}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/15"
                  >
                    <ArrowLeft size={14} />
                    {a.relatedTool ? `ابزار مرتبط: ${a.relatedTool}` : "رفتن به ابزار مرتبط"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Body (placeholder content) */}
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-10">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 sm:p-8">
            <p className="text-sm leading-8 text-[#D1D5DB]">
              این صفحه فعلاً برای تست مسیر، سئو، ناوبری و رندر ساخته شده.
              وقتی وارد فاز محتوا (MDX/CMS) بشیم، متن کامل مقاله، تیترها، تصاویر و لینک‌های داخلی اینجا میاد.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
              >
                <ChevronRight size={16} className="text-[#6B7280]" />
                بازگشت به لیست مقالات
              </Link>

              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#D1D5DB] hover:bg-white/[0.07]"
              >
                <Wrench size={16} className="text-emerald-400" />
                دیدن ابزارها
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#060C1A] px-4 pb-10 pt-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="flex flex-col items-center justify-between gap-3 text-xs text-[#4B5563] sm:flex-row">
              <span>© ۲۰۲۴ تمامی حقوق برای تخمینو محفوظ است.</span>
              <span className="text-[#374151]">Academy · Takhmino</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}