// app/tools/loan/page.tsx
import type { Metadata } from 'next';
import LoanClient from './loanClient';
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
  twitter: {
    card: 'summary',
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
  },
};

function buildJsonLd() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://takhmino.com').replace(/\/+$/, '');
  const canonical = `${siteUrl}${toolConfig.seo.canonical}`;

  const faqSection = toolConfig.aboutSections.find((s) => s.key === 'faq' && s.type === 'faq') as
    | { key: 'faq'; title: string; type: 'faq'; items: { q: string; a: string }[] }
    | undefined;

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolConfig.toolName,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: canonical,
    description: toolConfig.seo.description,
  };

  const faq =
    faqSection?.items?.length
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

  return { webApp, faq };
}

export default function Page() {
  const { webApp, faq } = buildJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      {faq ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} /> : null}
      <LoanClient />
    </>
  );
}
