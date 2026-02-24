import type { Metadata, Viewport } from 'next';
import FinancialLiteracyClient from './FinancialLiteracyClient';
import { toolConfig } from './tool.config';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  'https://takhmino.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: toolConfig.seo.title,
  description: toolConfig.seo.description,
  alternates: {
    canonical: toolConfig.seo.canonical,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
    url: toolConfig.seo.canonical,
    siteName: 'تخمینو',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: toolConfig.toolName,
    description: toolConfig.seo.description,
    url: `${siteUrl.replace(/\/$/, '')}${toolConfig.seo.canonical}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'تخمینو',
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FinancialLiteracyClient />
    </>
  );
}
