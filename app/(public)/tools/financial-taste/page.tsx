// app/(public)/tools/financial-taste/page.tsx
import type { Metadata } from "next";
import { Sparkles, CreditCard, BookOpen } from "lucide-react";
import ToolShell from "@/components/tools/ToolShell";
import FinancialTasteQuiz from "./FinancialTasteQuiz";
import { toolConfig } from "./tool.config";

export const metadata: Metadata = {
  title: `${toolConfig.title} | تخمینو`,
  description: toolConfig.description,
  alternates: { canonical: toolConfig.path },
  openGraph: {
    title: `${toolConfig.title} | تخمینو`,
    description: toolConfig.description,
    url: toolConfig.path,
    type: "website",
  },
};

/* ── روش محاسبه ── */
function MethodContent() {
  const sections = [
    {
      title: "این ابزار چه چیزی را می‌سنجد؟",
      text: "ذائقه مالی «پروفایل ترکیبی» شما را در چند محور می‌سازد: ظرفیت ریسک، تحمل ریسک ذهنی، سبک خرج‌کردن، سوگیری‌های رفتاری و باورهای پولی (Money Personality).",
    },
    {
      title: "چرا یک سؤال در هر لحظه؟",
      text: "برای اینکه کاربر خسته نشود و کیفیت پاسخ‌ها بالا بماند؛ مخصوصاً در سوالات رفتاری که نیاز به تأمل دارند.",
    },
    {
      title: "نتیجه چگونه ساخته می‌شود؟",
      text: "امتیازدهی وزن‌دار روی پاسخ‌ها + شاخص‌های ترکیبی برای شناسایی تیپ غالب + هشدارهای رفتاری مرتبط + برنامه اقدام شخصی‌سازی‌شده.",
    },
    {
      title: "چطور نتیجه دقیق‌تر شود؟",
      text: "صادقانه پاسخ دهید — نه بر اساس آنچه «باید» باشید، بلکه آنچه واقعاً هستید. پاسخ‌های اول‌الذهنی معمولاً دقیق‌ترند.",
    },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {sections.map((s, i) => (
        <div key={i}>
          <h3 className="text-base font-black text-slate-800 mb-2">{s.title}</h3>
          <p className="text-slate-600 text-sm leading-7">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ── JSON-LD ── */
function JsonLd() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://takhmino.com").replace(/\/+$/, "");
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: toolConfig.title,
    description: toolConfig.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${siteUrl}${toolConfig.path}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ── Page ── */
export default function Page() {
  return (
    <>
      <JsonLd />
      <ToolShell
        title={toolConfig.title}
        subtitle={toolConfig.description}
        icon={<Sparkles className="w-7 h-7" />}
        iconBg="bg-blue-50 text-blue-600"
        stats={[
          { value: "رایگان", label: "همیشه" },
          { value: "خصوصی", label: "بدون داده حساس" },
          { value: "رفتاری", label: "علمی" },
        ]}
        methodContent={<MethodContent />}
        faqItems={[
          {
            q: "این تست جایگزین مشاوره مالی است؟",
            a: "خیر. این ابزار برای شناخت الگوی تصمیم‌گیری شماست، نه ارائه توصیه قطعی سرمایه‌گذاری. برای تصمیم‌های مهم مالی با متخصص مشورت کنید.",
          },
          {
            q: "اگر صفحه را ببندم چه می‌شود؟",
            a: "پیشرفت شما در مرورگر ذخیره می‌شود. دفعه بعد که برگردید، از همان‌جا ادامه می‌دهید. هر زمان می‌توانید با دکمه «شروع مجدد» ریست کنید.",
          },
          {
            q: "چه اطلاعاتی از من گرفته می‌شود؟",
            a: "هیچ اطلاعات شخصی یا حساسی (درآمد، دارایی، هویت) درخواست نمی‌شود. فقط پاسخ‌های رفتاری برای ساخت پروفایل مالی شما استفاده می‌شود.",
          },
        ]}
        relatedTools={[
          {
            href: "/tools/loan",
            title: "محاسبه قسط وام",
            desc: "درک هزینه واقعی بدهی",
            icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
          },
          {
            href: "/tools/financial-literacy",
            title: "سنجش آگاهی مالی",
            desc: "ارزیابی دانش مالی شما",
            icon: <BookOpen className="w-5 h-5 text-violet-600" />,
          },
        ]}
      >
        <FinancialTasteQuiz />
      </ToolShell>
    </>
  );
}
