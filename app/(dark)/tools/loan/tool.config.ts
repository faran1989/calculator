// app/tools/loan/tool.config.ts
import {
  Home,
  Grid,
  BookOpen,
  Info,
  CreditCard,
  Car,
  Plane,
  Briefcase,
  Wallet,
  TrendingUp,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

type AboutSection =
  | { key: 'what' | 'how' | 'forwho' | 'outputs'; title: string; type: 'text'; text: string }
  | { key: 'faq'; title: string; type: 'faq'; items: { q: string; a: string }[] }
  | { key: string; title: string; type: 'bullets'; bullets: string[] };

export const toolConfig = {
  slug: 'loan',
  toolName: 'محاسبه قسط وام',

  navRoutes: {
    home: '/',
    tools: '/tools',
    learn: '/learn',
  },

  seo: {
    title: 'محاسبه قسط وام | تخمینو',
    description:
      'با ابزار محاسبه قسط وام تخمینو، قسط ماهانه، کل سود/کارمزد، کل بازپرداخت و جدول اقساط را برای انواع وام (قرض‌الحسنه و وام‌های معمولی) تخمین بزنید.',
    canonical: '/tools/loan',
  },

  // برای resolveRelatedHref در تمپلیت
  relatedRouteMap: {
    'car-estimate': '/tools/car-estimate',
    migration: '/tools/migration',
    retirement: '/tools/retirement',
    homeBuy: '/tools/home-buy',
    purchasingPower: '/tools/purchasing-power',
    goldGoal: '/tools/gold-goal',
    loan: '/tools/loan',
  } as Record<string, string>,

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

  // 5-block استاندارد (What / How / ForWho / Outputs / FAQ)
  aboutSections: [
    {
      key: 'what',
      title: 'این ابزار چیست؟',
      type: 'text',
      text:
        'این ابزار با دریافت نوع وام، مبلغ، نرخ سود/کارمزد و مدت بازپرداخت، قسط‌ها و جمع پرداختی را به‌صورت تخمینی محاسبه می‌کند.',
    },
    {
      key: 'how',
      title: 'چطور محاسبه می‌شود؟',
      type: 'bullets',
      bullets: [
        'برای وام‌های معمولی از فرمول قسط ثابت (EMI) استفاده می‌شود.',
        'برای قرض‌الحسنه دو روش محاسبه کارمزد پشتیبانی می‌شود: سالانه یکجا در ماه اول هر سال، یا ماهانه کاهشی روی مانده.',
        'جدول اقساط، سهم اصل و سود/کارمزد را ماه‌به‌ماه نشان می‌دهد.',
      ],
    },
    {
      key: 'forwho',
      title: 'چه کسانی به دردشان می‌خورد؟',
      type: 'text',
      text:
        'برای کسانی که می‌خواهند سناریوهای مختلف بازپرداخت را بررسی کنند (مبلغ، نرخ، مدت، نوع وام) و قبل از اقدام، تصویر واضح‌تری از قسط و مجموع پرداختی داشته باشند.',
    },
    {
      key: 'outputs',
      title: 'چه خروجی‌هایی می‌گیرید؟',
      type: 'bullets',
      bullets: [
        'قسط ماهانه (میانگین)',
        'کل سود/کارمزد',
        'کل بازپرداخت',
        'نسبت سود به اصل (٪)',
        'جدول اقساط (خلاصه/کامل)',
      ],
    },
    {
      key: 'faq',
      title: 'سوالات پرتکرار (FAQ)',
      type: 'faq',
      items: [
        {
          q: 'قسط وام‌های معمولی چگونه محاسبه می‌شود؟',
          a: 'با فرمول قسط ثابت (EMI) که در آن نرخ ماهانه از نرخ سالانه مشتق می‌شود و قسط ماهانه در کل دوره ثابت می‌ماند.',
        },
        {
          q: 'قرض‌الحسنه در این ابزار چگونه محاسبه می‌شود؟',
          a: 'دو روش دارد: ۱) کارمزد سالانه یکجا در ماه اول هر سال (۱،۱۳،۲۵...) ۲) کارمزد ماهانه کاهشی روی مانده.',
        },
        {
          q: 'نتایج چقدر دقیق است؟',
          a: 'اعداد نمایش داده‌شده تخمینی و مبتنی بر فرمول‌های عمومی است. شرایط دقیق بانک/مؤسسه می‌تواند متفاوت باشد.',
        },
        {
          q: 'اگر نرخ سود صفر باشد چه می‌شود؟',
          a: 'در وام‌های معمولی، اگر نرخ صفر باشد اصل وام به‌صورت مساوی بین ماه‌ها تقسیم می‌شود.',
        },
      ],
    },
  ] as AboutSection[],

  // برای منوی Header تمپلیت، آیکن‌ها از خود کامپوننت استفاده می‌شوند.
  // (اینجا فقط جهت ثبات/مرجع نگه داشتیم؛ در Client از MenuItem ها استفاده می‌شود)
  menuIcons: { Home, Grid, BookOpen, Info },

  // فقط برای اینکه اگر جایی خواستی ازش استفاده کنی
  uiIcons: { CreditCard, Wallet, TrendingUp, BarChart3, HelpCircle },
} as const;
