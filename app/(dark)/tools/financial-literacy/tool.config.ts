// app/tools/financial-literacy/tool.config.ts
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
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

type AboutSection =
  | { key: 'what' | 'how' | 'forwho' | 'outputs'; title: string; type: 'text'; text: string }
  | { key: 'faq'; title: string; type: 'faq'; items: { q: string; a: string }[] }
  | { key: string; title: string; type: 'bullets'; bullets: string[] };

export const toolConfig = {
  slug: 'financial-literacy',
  toolName: 'سنجش آگاهی مالی',

  navRoutes: {
    home: '/',
    tools: '/tools',
    learn: '/learn',
  },

  seo: {
    title: 'سنجش آگاهی مالی | تخمینو',
    description:
      'یک ارزیابی تطبیقی ۵ تا ۱۵ دقیقه‌ای برای سنجش آگاهی مالی (بودجه، بحران، تورم، سرمایه‌گذاری و رفتار مالی) همراه با آموزش‌های کوتاه و مسیر تمرین. بدون قضاوت، بدون داده حساس، بدون توصیه مالی.',
    canonical: '/tools/financial-literacy',
  },

  // برای resolveRelatedHref در تمپلیت
  relatedRouteMap: {
    'car-estimate': '/tools/car-estimate',
    migration: '/tools/migration',
    retirement: '/tools/retirement',
    homeBuy: '/tools/home-buy',
    purchasingPower: '/tools/purchasing-power',
    inflation: '/tools/purchasing-power',
    goldGoal: '/tools/gold-goal',
    loan: '/tools/loan',
    'financial-literacy': '/tools/financial-literacy',
  } as Record<string, string>,

  relatedTools: [
    {
      slug: 'purchasingPower',
      hrefFallback: '/tools/purchasing-power',
      title: 'قدرت خرید / تورم',
      desc: 'اثر تورم روی ارزش پول',
      icon: TrendingUp,
      colorClass: 'text-blue-400',
    },
    {
      slug: 'loan',
      hrefFallback: '/tools/loan',
      title: 'قسط وام',
      desc: 'درک هزینه واقعی بدهی',
      icon: CreditCard,
      colorClass: 'text-emerald-400',
    },
    {
      slug: 'homeBuy',
      hrefFallback: '/tools/home-buy',
      title: 'خرید خانه',
      desc: 'چند سال تا خانه؟',
      icon: Wallet,
      colorClass: 'text-purple-400',
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
        '«سنجش آگاهی مالی» یک ارزیابی تطبیقی است که در چند دسته‌ی کلیدی (بودجه، بحران، تورم، سرمایه‌گذاری و رفتار مالی) از شما سؤال می‌پرسد و همزمان آموزش کوتاه ارائه می‌کند. هدف، تخمین سطح آگاهی و پیشنهاد مسیر تمرین است—نه پیش‌بینی و نه توصیه مالی.',
    },
    {
      key: 'how',
      title: 'چطور کار می‌کند؟',
      type: 'bullets',
      bullets: [
        'سؤال‌ها دسته‌بندی شده‌اند و داخل هر دسته پشت‌سرهم پرسیده می‌شوند.',
        'سختی هر دسته واقعاً تطبیق می‌شود: پاسخ درست → سخت‌تر، پاسخ غلط → ساده‌تر (بین ۱ تا ۳).',
        'بعد از هر سؤال، درست/غلط + توضیح کوتاه نمایش داده می‌شود و «بیشتر بدانم» اختیاری است.',
        'پیشرفت در همین مرورگر (sessionStorage) ذخیره می‌شود تا بعداً ادامه بدهید.',
      ],
    },
    {
      key: 'forwho',
      title: 'چه کسانی به دردشان می‌خورد؟',
      type: 'text',
      text:
        'برای هر کسی که می‌خواهد تصویر واضح‌تری از نقاط قوت و حوزه‌های رشد مالی‌اش داشته باشد—بدون قضاوت و بدون نیاز به وارد کردن داده حساس (مثل درآمد یا دارایی). این ابزار مخصوصاً برای شروع مسیر در تخمینو طراحی شده است.',
    },
    {
      key: 'outputs',
      title: 'چه خروجی‌هایی می‌گیرید؟',
      type: 'bullets',
      bullets: [
        'امتیاز هر دسته و امتیاز نهایی (با توضیح شفاف محاسبه)',
        'سطح ۵ مرحله‌ای محترمانه (Starter تا Potential Specialist)',
        'اطمینان ارزیابی (بر اساس تعداد سؤال‌ها و تنوع سختی)',
        'نمودار مقایسه‌ای دسته‌ها (Radar/Bar)',
        'نقاط قوت + حوزه‌های قابل رشد',
        'تحلیل ترکیبی کوتاه (Rule-based) + برنامه اقدام ۳ مرحله‌ای',
        'پیشنهاد تمرین با ابزارهای مرتبط تخمینو',
      ],
    },
    {
      key: 'faq',
      title: 'سوالات پرتکرار (FAQ)',
      type: 'faq',
      items: [
        {
          q: 'آیا این ابزار توصیه مالی یا پیش‌بینی آینده است؟',
          a: 'خیر. این ابزار فقط یک تخمین آموزشی از سطح آگاهی مالی بر اساس پاسخ‌های شماست و توصیه مالی، تشخیص حرفه‌ای یا پیش‌بینی قطعی محسوب نمی‌شود.',
        },
        {
          q: 'آیا اطلاعات حساس از من می‌گیرد؟',
          a: 'خیر. هیچ داده‌ای مثل درآمد، دارایی، هویت یا اطلاعات شخصی درخواست نمی‌شود. فقط پاسخ‌های آموزشی شما برای محاسبه نتیجه استفاده می‌شود.',
        },
        {
          q: 'اگر صفحه را ببندم یا رفرش کنم چه می‌شود؟',
          a: 'پیشرفت شما در همین مرورگر (sessionStorage) ذخیره می‌شود و اگر برگردید، می‌توانید از همان‌جا ادامه دهید. هر زمان هم می‌توانید ریست کنید.',
        },
        {
          q: 'امتیاز چطور محاسبه می‌شود؟',
          a: 'هر سؤال بر اساس سختی وزن دارد (۱→۱.۰، ۲→۱.۴، ۳→۱.۸). امتیاز هر دسته از نسبت وزن پاسخ‌های درست به کل وزن سؤال‌های پرسیده‌شده همان دسته به دست می‌آید و امتیاز نهایی با وزن‌دهی دسته‌ها محاسبه می‌شود. داخل ابزار «امتیاز چطور محاسبه شد؟» هم به‌صورت شفاف نمایش داده می‌شود.',
        },
      ],
    },
  ] as AboutSection[],

  menuIcons: { Home, Grid, BookOpen, Info },

  uiIcons: {
    CreditCard,
    Wallet,
    TrendingUp,
    BarChart3,
    HelpCircle,
    ShieldCheck,
    Sparkles,
    Target,
    Car,
    Plane,
    Briefcase,
  },
} as const;
