// app/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { Vazirmatn } from 'next/font/google';
import HomeClient from './HomeClient';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://takhmino.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'تخمینو | تخمین و تصمیم‌سازی مالی با داده‌های واقعی',
  description:
    'تخمینو یک پلتفرم آموزشی و تصمیم‌ساز مالی است؛ با ابزارهای تخمین شفاف و قابل‌فهم برای اقتصاد ایران (تورم، مسکن، سناریوها و ...).',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'تخمینو | تخمین و تصمیم‌سازی مالی با داده‌های واقعی',
    description:
      'ابزارهای هوشمند برای تخمین شفاف و قابل‌فهم در اقتصاد ایران؛ آموزش + تصمیم‌سازی.',
    siteName: 'تخمینو',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تخمینو | تخمین و تصمیم‌سازی مالی با داده‌های واقعی',
    description:
      'ابزارهای هوشمند برای تخمین شفاف و قابل‌فهم در اقتصاد ایران؛ آموزش + تصمیم‌سازی.',
  },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#org`,
        name: 'تخمینو',
        url: siteUrl,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'تخمینو',
        publisher: { '@id': `${siteUrl}/#org` },
        inLanguage: 'fa-IR',
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: siteUrl,
        name: 'تخمینو | تخمین و تصمیم‌سازی مالی با داده‌های واقعی',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#org` },
        inLanguage: 'fa-IR',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/#breadcrumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحه اصلی',
            item: siteUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="takhmino-home-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient fontClassName={vazirmatn.className} />
    </>
  );
}