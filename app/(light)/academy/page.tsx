// app/(light)/academy/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import AcademyClient from './AcademyClient';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://takhmino.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'آکادمی تخمینو | مرجع تصمیم‌سازی مالی',
  description:
    'آکادمی تخمینو: مسیرهای یادگیری مالی (مبتدی تا پیشرفته) + کتابخانه مقاله/ویدیو/پادکست + اتصال مستقیم به ابزارهای تصمیم‌سازی.',
  alternates: {
    canonical: '/academy',
  },
  openGraph: {
    title: 'آکادمی تخمینو | مرجع تصمیم‌سازی مالی',
    description:
      'مسیرهای یادگیری + کتابخانه محتوا + ابزارهای تصمیم‌سازی مالی — تخمین > پیش‌بینی',
    url: `${siteUrl}/academy`,
    siteName: 'تخمینو',
    locale: 'fa_IR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AcademyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'آکادمی تخمینو',
        url: `${siteUrl}/academy`,
        inLanguage: 'fa-IR',
      },
      {
        '@type': 'CollectionPage',
        name: 'کتابخانه آکادمی تخمینو',
        url: `${siteUrl}/academy#library`,
        inLanguage: 'fa-IR',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'آکادمی',
            item: `${siteUrl}/academy`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="schema-academy"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AcademyClient />
    </>
  );
}