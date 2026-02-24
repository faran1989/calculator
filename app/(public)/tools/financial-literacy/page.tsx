// app/(public)/tools/financial-literacy/page.tsx
import type { Metadata } from "next";
import { BookOpen, CreditCard, Sparkles } from "lucide-react";
import ToolShell from "@/components/tools/ToolShell";
import FinancialLiteracyClient from "./FinancialLiteracyClient";
import { toolConfig } from "./tool.config";

export const metadata: Metadata = {
  title: toolConfig.seo.title,
  description: toolConfig.seo.description,
  alternates: { canonical: toolConfig.seo.canonical },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
    url: toolConfig.seo.canonical,
    siteName: "تخمینو",
    locale: "fa_IR",
  },
};

/* ── روش محاسبه — از aboutSections (non-FAQ) ── */
function MethodContent() {
  const sections = toolConfig.aboutSections.filter((s) => s.key !== "faq");
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {sections.map((section) => (
        <div key={section.key}>
          <h3 className="text-base font-black text-slate-800 mb-2">{section.title}</h3>
          {"text" in section && (
            <p className="text-slate-600 text-sm leading-7">{section.text}</p>
          )}
          {"bullets" in section && (
            <ul className="space-y-2">
              {(section as { bullets: string[] }).bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── FAQ از aboutSections ── */
const faqSection = toolConfig.aboutSections.find(
  (s) => s.key === "faq" && s.type === "faq"
) as { key: string; title: string; type: "faq"; items: { q: string; a: string }[] } | undefined;

/* ── JSON-LD ── */
function JsonLd() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://takhmino.com").replace(/\/+$/, "");
  const canonical = `${siteUrl}${toolConfig.seo.canonical}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: toolConfig.toolName,
    applicationCategory: "EducationApplication",
    operatingSystem: "Web",
    url: canonical,
    description: toolConfig.seo.description,
  };
  const faq = faqSection?.items?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqSection.items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }
    : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {faq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />}
    </>
  );
}

/* ── Page ── */
export default function Page() {
  return (
    <>
      <JsonLd />
      <ToolShell
        title={toolConfig.toolName}
        subtitle="ارزیابی تطبیقی آگاهی مالی در ۵ حوزه کلیدی: بودجه، بحران، تورم، سرمایه‌گذاری و رفتار مالی"
        icon={<BookOpen className="w-7 h-7" />}
        iconBg="bg-violet-50 text-violet-600"
        stats={[
          { value: "رایگان", label: "همیشه" },
          { value: "تطبیقی", label: "سختی هوشمند" },
          { value: "آموزشی", label: "بدون قضاوت" },
        ]}
        methodContent={<MethodContent />}
        faqItems={faqSection?.items}
        relatedTools={[
          {
            href: "/tools/loan",
            title: "محاسبه قسط وام",
            desc: "درک هزینه واقعی بدهی",
            icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
          },
          {
            href: "/tools/financial-taste",
            title: "ذائقه مالی",
            desc: "تیپ و شخصیت مالی شما",
            icon: <Sparkles className="w-5 h-5 text-blue-600" />,
          },
        ]}
      >
        <FinancialLiteracyClient />
      </ToolShell>
    </>
  );
}
