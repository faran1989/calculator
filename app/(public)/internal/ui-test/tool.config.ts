// app/tools/ui-test/tool.config.ts
import { Home, Grid, BookOpen, Info, Plane, Briefcase, Car } from 'lucide-react';

type AboutSection =
  | { key: 'what' | 'how' | 'forwho' | 'outputs'; title: string; type: 'text'; text: string }
  | { key: 'faq'; title: string; type: 'faq'; items: { q: string; a: string }[] }
  | { key: string; title: string; type: 'bullets'; bullets: string[] };

export const toolConfig = {
  // ui-test یعنی صفحه‌ی نمایش تمپلیت (دمو)، ابزار واقعی نیست
  slug: 'ui-test',
  toolName: 'تخمین هوشمند هزینه‌ها',

  navRoutes: {
    home: '/',
    tools: '/tools',
    learn: '/learn',
  },

  // SEO عمومیِ تمپلیت/دمو
  seo: {
    title: 'Takhmino Tool Template v1 (Stable) | تخمینو',
    description:
      'این صفحه یک پیش‌نمایش از Template مشترک تخمینو (نسخه v1 پایدار) برای ابزارهای مالی است: ساختار، تب‌ها، راهنمای استفاده، ابزارهای مرتبط و فوتر.',
    canonical: '/tools/ui-test',
  },

  // برای resolveRelatedHref در تمپلیت
  relatedRouteMap: {
    loan: '/tools/loan',
    migration: '/tools/migration',
    retirement: '/tools/retirement',
    'car-estimate': '/tools/car-estimate',
    homeBuy: '/tools/home-buy',
    purchasingPower: '/tools/purchasing-power',
    goldGoal: '/tools/gold-goal',
    // خود دمو
    'ui-test': '/tools/ui-test',
  } as Record<string, string>,

  // Related های عمومی (نمونه)
  relatedTools: [
    {
      slug: 'retirement',
      hrefFallback: '/tools/retirement',
      title: 'بازنشستگی',
      desc: 'تخمین سن و پس‌انداز',
      icon: Briefcase,
      colorClass: 'text-emerald-400',
    },
    {
      slug: 'migration',
      hrefFallback: '/tools/migration',
      title: 'مهاجرت',
      desc: 'هزینه و زمان تقریبی',
      icon: Plane,
      colorClass: 'text-purple-400',
    },
    {
      slug: 'car-estimate',
      hrefFallback: '/tools/car-estimate',
      title: 'تخمین خودرو',
      desc: 'چند سال تا ماشین؟',
      icon: Car,
      colorClass: 'text-blue-400',
    },
  ] as Array<{
    slug: string;
    hrefFallback: string;
    title: string;
    desc: string;
    icon: any;
    colorClass: string;
  }>,

  // 5-block استاندارد عمومیِ تمپلیت
  aboutSections: [
    {
      key: 'what',
      title: 'این تمپلیت چیست؟',
      type: 'text',
      text:
        'این صفحه پیش‌نمایش Template مشترک تخمینو (v1 پایدار) است که مبنای همه ابزارهای مالی آینده خواهد بود.',
    },
    {
      key: 'how',
      title: 'چطور کار می‌کند؟',
      type: 'bullets',
      bullets: [
        'هر ابزار یک صفحه Server (metadata) و یک Client (UI + logic) دارد.',
        'تب‌های «ابزار / راهنما» با hash routing (#tool / #about) هماهنگ هستند.',
        'بخش راهنما به‌صورت 5-block استاندارد + FAQ آکاردئونی ارائه می‌شود.',
      ],
    },
    {
      key: 'forwho',
      title: 'برای چه کسانی است؟',
      type: 'text',
      text:
        'برای کاربرانی که می‌خواهند تصمیم‌های مالی را ساده‌تر و سریع‌تر بگیرند و برای تیمی که می‌خواهد ابزارهای متعدد را با یک استاندارد ثابت توسعه دهد.',
    },
    {
      key: 'outputs',
      title: 'چه چیزهایی را استاندارد می‌کند؟',
      type: 'bullets',
      bullets: [
        'ساختار ثابت صفحه (Background / Header / Hero+Main / Tabs / About / Related / Footer)',
        'یکپارچگی برند و طراحی در همه ابزارها',
        'آمادگی برای SEO و داده‌های ساختاریافته (JSON-LD)',
      ],
    },
    {
      key: 'faq',
      title: 'سوالات پرتکرار (FAQ)',
      type: 'faq',
      items: [
        {
          q: 'آیا UI همه ابزارها دقیقاً یکسان می‌ماند؟',
          a: 'اسکلت و اجزای تمپلیت ثابت است، اما محتوای تب «ابزار» بسته به ابزار تغییر می‌کند.',
        },
        {
          q: 'چرا hash routing استفاده شده؟',
          a: 'برای تجربه سریع‌تر کاربر و امکان لینک‌دهی مستقیم به تب ابزار یا راهنما (#tool / #about).',
        },
        {
          q: 'هر ابزار چه فایل‌هایی دارد؟',
          a: 'page.tsx (Server + metadata)، یک فایل Client برای UI/logic، و tool.config.ts برای داده‌های استاندارد صفحه.',
        },
      ],
    },
  ] as AboutSection[],

  menuIcons: { Home, Grid, BookOpen, Info },
} as const;
