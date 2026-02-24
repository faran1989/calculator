// app/(public)/tools/loan/page.tsx
import type { Metadata } from 'next';
import { Landmark, Briefcase, Plane, Car } from 'lucide-react';
import LoanClient from './loanClient';
import ToolShell from '@/components/tools/ToolShell';
import { toolConfig } from './tool.config';

export const metadata: Metadata = {
  title: toolConfig.seo.title,
  description: toolConfig.seo.description,
  alternates: { canonical: toolConfig.seo.canonical },
  openGraph: {
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
    url: toolConfig.seo.canonical,
    type: 'website',
  },
};

/* ── Method content (روش محاسبه) ── */
function MethodContent() {
  const sections = toolConfig.aboutSections.filter((s) => s.key !== 'faq');
  return (
    <div className="space-y-8 text-right" dir="rtl">
      {sections.map((section) => (
        <div key={section.key}>
          <h3 className="text-base font-black text-slate-800 mb-3">{section.title}</h3>
          {'text' in section && (
            <p className="text-slate-600 text-sm leading-7">{section.text}</p>
          )}
          {'bullets' in section && (
            <ul className="space-y-2">
              {section.bullets.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
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

/* ── FAQ items ── */
const faqSection = toolConfig.aboutSections.find((s) => s.key === 'faq' && s.type === 'faq') as
  | { key: string; title: string; type: 'faq'; items: { q: string; a: string }[] }
  | undefined;

/* ── Related tools ── */
const relatedTools = [
  {
    href: '/tools/retirement',
    title: 'بازنشستگی',
    desc: 'تخمین سن و پس‌انداز',
    icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
  },
  {
    href: '/tools/migration',
    title: 'مهاجرت',
    desc: 'هزینه و زمان تقریبی',
    icon: <Plane className="w-5 h-5 text-purple-600" />,
  },
  {
    href: '/tools/car-estimate',
    title: 'تخمین خودرو',
    desc: 'چند سال تا ماشین؟',
    icon: <Car className="w-5 h-5 text-blue-600" />,
  },
];

/* ── JSON-LD ── */
function JsonLd() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://takhmino.com').replace(/\/+$/, '');
  const canonical = `${siteUrl}${toolConfig.seo.canonical}`;

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolConfig.toolName,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: canonical,
    description: toolConfig.seo.description,
  };

  const faq = faqSection?.items?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSection.items.map((it) => ({
          '@type': 'Question',
          name: it.q,
          acceptedAnswer: { '@type': 'Answer', text: it.a },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
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
        subtitle="قسط ماهانه، کل سود و جدول اقساط را برای انواع وام تخمین بزنید"
        icon={<Landmark className="w-7 h-7" />}
        iconBg="bg-blue-50 text-blue-600"
        stats={[
          { value: 'رایگان', label: 'همیشه' },
          { value: 'شفاف', label: 'فرمول باز' },
          { value: 'امن', label: 'بدون ذخیره' },
        ]}
        methodContent={<MethodContent />}
        faqItems={faqSection?.items}
        relatedTools={relatedTools}
      >
        <LoanClient />
      </ToolShell>
    </>
  );
}
