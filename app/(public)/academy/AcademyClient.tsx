// app/(light)/academy/AcademyClient.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Chart as ChartType } from 'chart.js';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  DoughnutController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ContentType = 'article' | 'video' | 'podcast' | 'guide';
type Topic = 'inflation' | 'budget' | 'home' | 'invest' | 'behavior' | 'tools';
type Level = 'مبتدی' | 'متوسط' | 'پیشرفته';

type ContentItem = {
  id: string;
  title: string;
  excerpt: string;
  topic: Topic;
  topicLabel: string;
  type: ContentType;
  typeLabel: string;
  level: Level;
  readTimeMin: number;
  date: string; // fa
  updated: string; // fa
  popularity: number;
  recommended: boolean;
  sections: { id: string; title: string; body: string }[];
  definition?: string;
  mistake?: string;
  iranExample?: string;
  assumptions?: string;
  tools?: { label: string; href: string }[];
  nextSteps?: string[];
  related?: string[];
};

const TOPIC_MAP: Record<Topic, string> = {
  inflation: 'تورم',
  budget: 'مدیریت مالی',
  home: 'مسکن',
  invest: 'سرمایه‌گذاری',
  behavior: 'رفتاری',
  tools: 'راهنمای ابزار',
};

// همان دیتای دمو (برای مرحله ۱ کافی است؛ بعداً اتصال به CMS/MDX/DB)
const CONTENT: ContentItem[] = [
  {
    id: 'inflation-basics',
    title: 'تورم یعنی چه؟ (بدون اصطلاحات)',
    excerpt:
      'تورم را ساده و کاربردی بفهم؛ بعد با ابزار، سناریوی خودت را تست کن.',
    topic: 'inflation',
    topicLabel: 'تورم',
    type: 'article',
    typeLabel: 'مقاله',
    level: 'مبتدی',
    readTimeMin: 5,
    date: '۱۴۰۴/۱۱/۱۰',
    updated: '۱۴۰۴/۱۱/۱۵',
    popularity: 92,
    recommended: true,
    sections: [
      {
        id: 's1',
        title: 'تورم دقیقاً چیست؟',
        body: 'تورم یعنی با همان مقدار پول، کالای کمتری می‌توانی بخری. یعنی قدرت خرید افت می‌کند.',
      },
      {
        id: 's2',
        title: 'چرا تورم در ایران مهم‌تر است؟',
        body: 'وقتی نرخ تورم بالا و مزمن باشد، نگه‌داشتن پول نقد ریسک بزرگی است.',
      },
      {
        id: 's3',
        title: 'چطور با تورم تصمیم بگیریم؟',
        body: 'اول بودجه و صندوق اضطراری را بساز، بعد سراغ گزینه‌های حفظ ارزش برو.',
      },
    ],
    definition: 'تورم = کاهش قدرت خرید پول در طول زمان.',
    mistake:
      'اشتباه رایج این است که تورم را با «گرانی یک کالا» یکی بگیریم؛ تورم یعنی رشد سطح عمومی قیمت‌ها.',
    iranExample:
      'اگر قیمت خوراکی‌ها و اجاره هم‌زمان بالا برود، با حقوق ثابت، قدرت خریدت سریع افت می‌کند.',
    assumptions:
      'این مقاله آموزشی است. برای تصمیم واقعی، نرخ تورم، رشد حقوق و افق زمانی را شخصی‌سازی کن.',
    tools: [
      { label: 'ماشین‌حساب تورم', href: '#paths' },
      { label: 'بودجه ۵۰/۳۰/۲۰', href: '#tools' },
    ],
    nextSteps: ['emergency-fund'],
    related: ['budgeting-503020'],
  },
  {
    id: 'budgeting-503020',
    title: 'بودجه ۵۰/۳۰/۲۰ به سبک ایرانی',
    excerpt:
      'یک چارچوب ساده برای کنترل جریان پول؛ با نسخه واقع‌بینانه برای ایران.',
    topic: 'budget',
    topicLabel: 'مدیریت مالی',
    type: 'guide',
    typeLabel: 'راهنما',
    level: 'مبتدی',
    readTimeMin: 10,
    date: '۱۴۰۴/۰۹/۰۷',
    updated: '۱۴۰۴/۱۱/۰۵',
    popularity: 95,
    recommended: true,
    sections: [
      {
        id: 's1',
        title: 'سه سبد پول',
        body: 'نیازها، خواسته‌ها، پس‌انداز — هدف این است که جریان پول قابل مدیریت شود.',
      },
      {
        id: 's2',
        title: 'چطور بومی‌سازی کنیم؟',
        body: 'اگر اجاره/قسط سنگین است، باید از خواسته‌ها کم یا درآمد را افزایش داد.',
      },
    ],
    definition: 'بودجه یعنی برنامه‌ریزی برای «جریان پول»، نه فقط خرج‌ها.',
    mistake: 'اشتباه رایج: بودجه را ابزار محدودیت ببینیم، نه ابزار آرامش.',
    iranExample:
      'اگر اجاره ۶۰٪ درآمد است، باید سبک زندگی یا محل زندگی را بازنگری کرد.',
    assumptions:
      'این راهنما عمومی است. نسبت‌ها باید با وضعیت واقعی شما تنظیم شود.',
    tools: [{ label: 'دموی بودجه', href: '#tools' }],
    nextSteps: ['inflation-basics'],
    related: ['inflation-basics'],
  },
  {
    id: 'emergency-fund',
    title: 'صندوق اضطراری: سنگ‌بنای تصمیم‌سازی',
    excerpt: 'قبل از هر سرمایه‌گذاری، باید امنیت مالی پایه داشته باشی.',
    topic: 'budget',
    topicLabel: 'مدیریت مالی',
    type: 'article',
    typeLabel: 'مقاله',
    level: 'مبتدی',
    readTimeMin: 6,
    date: '۱۴۰۴/۱۰/۱۰',
    updated: '۱۴۰۴/۱۱/۰۱',
    popularity: 81,
    recommended: true,
    sections: [
      {
        id: 's1',
        title: 'چرا صندوق اضطراری مهم است؟',
        body: 'بدون ذخیره امن، مجبور می‌شوی در بدترین زمان دارایی را بفروشی.',
      },
      {
        id: 's2',
        title: 'چقدر کافی است؟',
        body: 'برای شروع، حداقل ۳ ماه هزینه ضروری. سپس بر اساس ریسک شغلی تنظیم کن.',
      },
    ],
    definition: 'صندوق اضطراری یعنی پول نقد/نقدشونده برای شوک‌های زندگی.',
    mistake: 'اشتباه رایج: صندوق اضطراری را با سرمایه‌گذاری پرریسک قاطی کنیم.',
    iranExample:
      'خرابی خودرو، هزینه درمان، یا قطع درآمد؛ شوک‌هایی رایج‌اند.',
    assumptions:
      'این توصیه عمومی است. ریسک شغلی و تعهدات شما تعیین‌کننده‌اند.',
    tools: [{ label: 'بودجه', href: '#tools' }],
    nextSteps: ['budgeting-503020'],
    related: ['budgeting-503020'],
  },
];

function faToEnDigits(str: string) {
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  return String(str).replace(/[۰-۹]/g, (d) => map[d] ?? d);
}

function faDateToNumber(faDate: string) {
  const en = faToEnDigits(faDate);
  const parts = en.split('/').map((x) => Number(x));
  if (parts.length !== 3) return 0;
  return parts[0] * 10000 + parts[1] * 100 + parts[2];
}

function toFaNumber(input: number) {
  try {
    return new Intl.NumberFormat('fa-IR').format(input);
  } catch {
    return String(input);
  }
}

function fmtMinutes(min: number) {
  return `${toFaNumber(min)} دقیقه`;
}

export default function AcademyClient() {
  // --- charts refs
  const homeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inflationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const investCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const budgetCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const homeChartRef = useRef<ChartType | null>(null);
  const inflationChartRef = useRef<ChartType | null>(null);
  const investChartRef = useRef<ChartType | null>(null);
  const budgetChartRef = useRef<ChartType | null>(null);

  // --- UI state
  const [activePath, setActivePath] = useState<'home' | 'inflation' | 'invest'>(
    'home'
  );
  const [shelf, setShelf] = useState<'recommended' | 'popular' | 'new'>(
    'recommended'
  );

  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState<Topic | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<Level | 'all'>('all');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<
    'new' | 'updated' | 'popular' | 'recommended' | 'timeAsc'
  >('new');

  const [articleId, setArticleId] = useState<string>('inflation-basics');

  // --- tool demo state
  const [inflationAmount, setInflationAmount] = useState<number>(100000000);
  const [inflationRate, setInflationRate] = useState<number>(40);
  const inflationResult = useMemo(() => {
    const years = 5;
    let factor = 1;
    for (let i = 0; i < years; i++) factor *= 1 + inflationRate / 100;
    const val = inflationAmount / factor;
    return Math.round(val);
  }, [inflationAmount, inflationRate]);

  const [monthlyIncome, setMonthlyIncome] = useState<number>(12000000);
  const budgetParts = useMemo(() => {
    const needs = Math.round(monthlyIncome * 0.5);
    const wants = Math.round(monthlyIncome * 0.3);
    const savings = Math.round(monthlyIncome * 0.2);
    return { needs, wants, savings };
  }, [monthlyIncome]);

  // --- derived lists
  const shelfItems = useMemo(() => {
    let items = [...CONTENT];
    if (shelf === 'recommended') items = items.filter((x) => x.recommended);
    if (shelf === 'popular') items.sort((a, b) => b.popularity - a.popularity);
    if (shelf === 'new')
      items.sort((a, b) => faDateToNumber(b.date) - faDateToNumber(a.date));
    return items.slice(0, 6);
  }, [shelf]);

  const libraryItems = useMemo(() => {
    let items = [...CONTENT];

    if (filterTopic !== 'all') items = items.filter((x) => x.topic === filterTopic);
    if (filterLevel !== 'all') items = items.filter((x) => x.level === filterLevel);
    if (filterType !== 'all') items = items.filter((x) => x.type === filterType);

    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.excerpt.toLowerCase().includes(q) ||
          (x.topicLabel || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'new')
      items.sort((a, b) => faDateToNumber(b.date) - faDateToNumber(a.date));
    if (sortBy === 'updated')
      items.sort(
        (a, b) => faDateToNumber(b.updated) - faDateToNumber(a.updated)
      );
    if (sortBy === 'popular')
      items.sort((a, b) => b.popularity - a.popularity);
    if (sortBy === 'recommended')
      items.sort((a, b) => Number(b.recommended) - Number(a.recommended));
    if (sortBy === 'timeAsc') items.sort((a, b) => a.readTimeMin - b.readTimeMin);

    return items;
  }, [filterLevel, filterTopic, filterType, search, sortBy]);

  const article = useMemo(
    () => CONTENT.find((x) => x.id === articleId) ?? CONTENT[0],
    [articleId]
  );

  // --- init charts once
  useEffect(() => {
    // defaults
    Chart.defaults.font.family = "'Vazirmatn', Tahoma, sans-serif";
    Chart.defaults.color = '#57534E';

    const brand = {
      green: '#10B981',
      dark: '#1C1917',
    };

    // Home line
    if (homeCanvasRef.current && !homeChartRef.current) {
      homeChartRef.current = new Chart(homeCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['۱۳۹۴', '۱۳۹۶', '۱۳۹۸', '۱۴۰۰', '۱۴۰۲'],
          datasets: [
            {
              label: 'میانگین قیمت مسکن (تهران)',
              data: [4, 6, 13, 32, 75],
              borderColor: brand.green,
              backgroundColor: 'rgba(16,185,129,0.10)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f5f5f4' } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // Inflation bar (will be updated by effect below)
    if (inflationCanvasRef.current && !inflationChartRef.current) {
      inflationChartRef.current = new Chart(inflationCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['امسال', 'سال ۱', 'سال ۲', 'سال ۳', 'سال ۴', 'سال ۵'],
          datasets: [
            {
              label: 'ارزش واقعی پول (قدرت خرید)',
              data: [100, 71, 51, 36, 26, 18],
              backgroundColor: [
                brand.green,
                '#34D399',
                '#6EE7B7',
                '#A7F3D0',
                '#D1FAE5',
                '#ECFDF5',
              ],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, title: { display: true, text: 'درصد ارزش باقی‌مانده' } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // Invest horizontal bar
    if (investCanvasRef.current && !investChartRef.current) {
      investChartRef.current = new Chart(investCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['سپرده بانکی', 'دلار', 'مسکن', 'طلا', 'بورس'],
          datasets: [
            {
              label: 'بازدهی فرضی',
              data: [120, 450, 800, 950, 1200],
              backgroundColor: ['#D6D3D1', '#86EFAC', '#34D399', '#F59E0B', '#10B981'],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
        },
      });
    }

    // Budget doughnut
    if (budgetCanvasRef.current && !budgetChartRef.current) {
      budgetChartRef.current = new Chart(budgetCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['نیازها (۵۰٪)', 'خواسته‌ها (۳۰٪)', 'پس‌انداز (۲۰٪)'],
          datasets: [
            {
              data: [50, 30, 20],
              backgroundColor: [brand.dark, '#A8A29E', brand.green],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }

    return () => {
      homeChartRef.current?.destroy();
      inflationChartRef.current?.destroy();
      investChartRef.current?.destroy();
      budgetChartRef.current?.destroy();
      homeChartRef.current = null;
      inflationChartRef.current = null;
      investChartRef.current = null;
      budgetChartRef.current = null;
    };
  }, []);

  // update inflation chart when rate changes
  useEffect(() => {
    const chart = inflationChartRef.current;
    if (!chart) return;

    const newData: number[] = [];
    let currentPower = 100;
    for (let i = 0; i < 6; i++) {
      newData.push(Number(currentPower.toFixed(1)));
      currentPower = currentPower / (1 + inflationRate / 100);
    }
    chart.data.datasets[0].data = newData as any;
    chart.update();
  }, [inflationRate]);

  const openArticle = (id: string) => {
    setArticleId(id);
    // اسکرول نرم به بخش مقاله
    const el = document.getElementById('article');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="text-[#1C1917] font-sans leading-relaxed">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[9999] bg-white border border-stone-200 px-4 py-2 rounded-xl shadow"
      >
        پرش به محتوای اصلی
      </a>

      {/* HERO */}
      <header className="relative overflow-hidden pt-16 pb-20 lg:pt-28 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            تصمیم‌سازی مالی،
            <br className="hidden md:block" />
            <span className="text-emerald-600">نه پیش‌بینی‌های خیالی</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-stone-600">
            آکادمی تخمینو کمک می‌کند در اقتصاد متلاطم ایران، به جای قمار روی احتمالات،
            با <strong className="text-stone-900">تخمین‌های شفاف و قابل دفاع</strong> تصمیم بگیرید.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="#start"
              className="bg-emerald-500 text-white px-7 py-3.5 rounded-xl text-base sm:text-lg font-black hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
            >
              شروع سریع (۳ سطح کاربری)
            </a>
            <a
              href="#library"
              className="bg-white text-stone-900 border border-stone-200 px-7 py-3.5 rounded-xl text-base sm:text-lg font-black hover:bg-stone-50"
            >
              جستجو در کتابخانه محتوا
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-stone-200 pt-8">
            <div className="bg-white/60 border border-stone-200 rounded-2xl p-5">
              <div className="text-3xl font-black mb-1">سادگی</div>
              <div className="text-sm text-stone-600">پیچیدگی دشمن اجراست</div>
            </div>
            <div className="bg-white/60 border border-stone-200 rounded-2xl p-5">
              <div className="text-3xl font-black mb-1">شفافیت</div>
              <div className="text-sm text-stone-600">دوری از دقت فیک و اعداد دروغین</div>
            </div>
            <div className="bg-white/60 border border-stone-200 rounded-2xl p-5">
              <div className="text-3xl font-black mb-1">تخمین</div>
              <div className="text-sm text-stone-600">مدیریت ریسک به جای پیش‌گویی</div>
            </div>
          </div>

          <div className="mt-10 max-w-5xl mx-auto">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-sm text-stone-600 flex flex-wrap items-center gap-2 justify-center">
              <span className="font-black text-stone-900">مسیر شما:</span>
              <a href="#start" className="hover:text-emerald-600">شروع سریع</a>
              <span className="text-stone-300">/</span>
              <a href="#paths" className="hover:text-emerald-600">مسیرها</a>
              <span className="text-stone-300">/</span>
              <a href="#library" className="hover:text-emerald-600">کتابخانه</a>
              <span className="text-stone-300">/</span>
              <a href="#tools" className="hover:text-emerald-600">ابزارها</a>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-stone-200/50 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl -z-10" />
      </header>

      <main id="main">
        {/* START QUICK */}
        <section id="start" className="py-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <span className="text-emerald-600 font-black tracking-wider uppercase text-xs">
                    شروع سریع
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black mt-2">
                    از همین‌جا شروع کن — دقیقاً متناسب با سطح تو
                  </h2>
                  <p className="mt-3 text-stone-600 max-w-3xl">
                    برای مبتدی‌ها مسیر ۱۰ دقیقه‌ای، برای نیمه‌حرفه‌ای‌ها نقشه راه هدف‌محور، و
                    برای حرفه‌ای‌ها دسترسی مستقیم به کتابخانه و ابزارها.
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="#assessment"
                    className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-black hover:bg-emerald-700"
                  >
                    تست مسیر مناسب
                  </a>
                  <a
                    href="#library"
                    className="bg-stone-100 text-stone-900 px-5 py-3 rounded-xl font-black hover:bg-stone-200"
                  >
                    رفتن به کتابخانه
                  </a>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-[#F5F5F4] border border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black">مبتدی</div>
                    <div className="text-2xl">🌱</div>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    مسیر کوتاه و عملی، بدون اصطلاحات سخت: تورم، صندوق اضطراری، بودجه‌بندی،
                    و یک ابزار ساده برای شروع.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openArticle('inflation-basics')}
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      درس ۱: تورم در ۵ دقیقه
                    </button>
                    <button
                      onClick={() => openArticle('emergency-fund')}
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      درس ۲: صندوق اضطراری
                    </button>
                    <a
                      href="#tools"
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      ابزارها
                    </a>
                  </div>
                </div>

                <div className="bg-[#F5F5F4] border border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black">نیمه‌حرفه‌ای</div>
                    <div className="text-2xl">🧭</div>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    هدف‌محور جلو برو: خرید خانه، درک تورم، شروع سرمایه‌گذاری — با درس‌های مرتب،
                    پیش‌نیازها و ابزارهای مرتبط.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href="#paths"
                      className="bg-stone-900 text-white px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-800"
                    >
                      انتخاب مسیر
                    </a>
                    <a
                      href="#library"
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      فیلتر محتوا
                    </a>
                    <button
                      onClick={() => openArticle('budgeting-503020')}
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      درس کلیدی: بودجه ۵۰/۳۰/۲۰
                    </button>
                  </div>
                </div>

                <div className="bg-[#F5F5F4] border border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black">حرفه‌ای</div>
                    <div className="text-2xl">⚙️</div>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    سریع برو سر اصل مطلب: کتابخانه موضوعی، مرتب‌سازی “به‌روزرسانی اخیر”،
                    و پل مستقیم بین مقاله و ابزار.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href="#library"
                      className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-black hover:bg-emerald-700"
                    >
                      کتابخانه حرفه‌ای
                    </a>
                    <a
                      href="#policy"
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      سیاست شفافیت
                    </a>
                    <a
                      href="#tools"
                      className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm font-black hover:bg-stone-50"
                    >
                      ابزارها
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-stone-600">
                  <span className="font-black text-stone-900">موضوعات داغ امروز:</span>
                  <span className="mx-2 text-stone-300">•</span>
                  <a href="#library" className="hover:text-emerald-600" onClick={() => setFilterTopic('inflation')}>
                    تورم
                  </a>
                  <span className="mx-2 text-stone-300">•</span>
                  <a href="#library" className="hover:text-emerald-600" onClick={() => setFilterTopic('home')}>
                    خرید خانه
                  </a>
                  <span className="mx-2 text-stone-300">•</span>
                  <a href="#library" className="hover:text-emerald-600" onClick={() => setFilterTopic('invest')}>
                    سرمایه‌گذاری
                  </a>
                  <span className="mx-2 text-stone-300">•</span>
                  <a href="#library" className="hover:text-emerald-600" onClick={() => setFilterTopic('behavior')}>
                    خطاهای رفتاری
                  </a>
                </div>
                <a
                  href="#library"
                  className="inline-flex items-center justify-center bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50"
                >
                  برو به کتابخانه و فیلتر کن <span className="mr-2">←</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ASSESSMENT (نسخه دمو ساده) */}
        <section id="assessment" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-lg">
              <span className="text-emerald-600 font-black tracking-wider uppercase text-xs">
                تست سریع
              </span>
              <h2 className="text-2xl md:text-4xl font-black mt-2">
                کدام مسیر برای تو مناسب‌تر است؟
              </h2>
              <p className="mt-3 text-stone-600 max-w-3xl">
                با ۳ سوال کوتاه، پیشنهاد مسیر می‌گیری. (بعداً می‌تونه به ابزار «سنجش آگاهی مالی» وصل شود.)
              </p>

              <div className="mt-8 grid lg:grid-cols-3 gap-4">
                <div className="bg-[#F5F5F4] border border-stone-200 rounded-2xl p-5">
                  <div className="text-sm font-black">۱) اولویت فعلی تو چیست؟</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q1" defaultValue="home" className="accent-emerald-600" />
                      خرید خانه / مسکن
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q1" defaultValue="inflation" className="accent-emerald-600" defaultChecked />
                      حفظ قدرت خرید / تورم
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q1" defaultValue="invest" className="accent-emerald-600" />
                      شروع سرمایه‌گذاری
                    </label>
                  </div>
                </div>

                <div className="bg-[#F5F5F4] border border-stone-200 rounded-2xl p-5">
                  <div className="text-sm font-black">۲) سبک تصمیم‌گیری تو کدام است؟</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" defaultValue="beginner" className="accent-emerald-600" defaultChecked />
                      ساده و مرحله‌ای (کم‌اصطلاح)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" defaultValue="mid" className="accent-emerald-600" />
                      هدف‌محور و پروژه‌ای
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q2" defaultValue="pro" className="accent-emerald-600" />
                      سریع و تحلیلی (منابع/فرضیات)
                    </label>
                  </div>
                </div>

                <div className="bg-[#F5F5F4] border border-stone-200 rounded-2xl p-5">
                  <div className="text-sm font-black">۳) چقدر زمان برای شروع داری؟</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q3" defaultValue="10" className="accent-emerald-600" defaultChecked />
                      ۱۰ دقیقه
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q3" defaultValue="60" className="accent-emerald-600" />
                      یک ساعت
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="q3" defaultValue="plan" className="accent-emerald-600" />
                      برنامه چند روزه
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button
                  onClick={() => {
                    const q1 =
                      (document.querySelector('input[name="q1"]:checked') as HTMLInputElement | null)
                        ?.value ?? 'inflation';
                    if (q1 === 'home') setActivePath('home');
                    if (q1 === 'inflation') setActivePath('inflation');
                    if (q1 === 'invest') setActivePath('invest');

                    const el = document.getElementById('paths');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black hover:bg-emerald-700"
                >
                  پیشنهاد مسیر بده
                </button>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-600 w-full md:w-auto">
                  نتیجه: <span className="font-black text-stone-900">روی دکمه کلیک کن تا مسیر انتخاب شود</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PATHS (با چارت‌ها) */}
        <section id="paths" className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-emerald-600 font-black tracking-wider uppercase text-xs">نقشه راه شما</span>
              <h2 className="text-3xl md:text-5xl font-black mt-2">مسیرهای یادگیری اختصاصی</h2>
              <p className="mt-4 text-stone-600 max-w-3xl mx-auto">
                هر مسیر: <strong className="text-stone-900">سناریوی واقعی</strong> +{' '}
                <strong className="text-stone-900">درس‌های مرتب</strong> +{' '}
                <strong className="text-stone-900">ابزارهای مرتبط</strong> +{' '}
                <strong className="text-stone-900">زمان تقریبی تکمیل</strong>.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <button
                onClick={() => setActivePath('home')}
                className={
                  activePath === 'home'
                    ? 'bg-stone-900 text-white px-6 py-3 rounded-full font-black'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 px-6 py-3 rounded-full font-black'
                }
              >
                خرید خانه
              </button>
              <button
                onClick={() => setActivePath('inflation')}
                className={
                  activePath === 'inflation'
                    ? 'bg-stone-900 text-white px-6 py-3 rounded-full font-black'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 px-6 py-3 rounded-full font-black'
                }
              >
                درک تورم
              </button>
              <button
                onClick={() => setActivePath('invest')}
                className={
                  activePath === 'invest'
                    ? 'bg-stone-900 text-white px-6 py-3 rounded-full font-black'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 px-6 py-3 rounded-full font-black'
                }
              >
                شروع سرمایه‌گذاری
              </button>
            </div>

            <div className="bg-[#F5F5F4] rounded-3xl p-6 md:p-10 shadow-inner border border-stone-100">
              {activePath === 'home' && (
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        زمان تکمیل: ۳ تا ۵ ساعت
                      </span>
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        سطح: متوسط
                      </span>
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        پیش‌نیاز: تورم
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black mt-4 mb-3">
                      از رویا تا واقعیت: تخمین خرید خانه
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      در ایران، مسکن فراتر از سرپناه است؛ یک کالای سرمایه‌ای و پرریسک. این مسیر کمک می‌کند با{' '}
                      <strong className="text-stone-900">اعداد واقعی</strong> تصمیم بگیرید.
                      <br />
                      <br />
                      <strong className="text-stone-900">سناریو:</strong> زوج جوانی با ۵۰۰ میلیون پس‌انداز و توان پرداخت ۱۰ میلیون قسط ماهانه.
                    </p>

                    <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <div className="font-black">درس‌های این مسیر</div>
                        <span className="text-xs text-stone-500">مرتب و پیشنهادی</span>
                      </div>

                      <ol className="mt-4 space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xs font-black">
                            ۱
                          </span>
                          <div className="flex-1">
                            <button
                              className="font-black hover:text-emerald-600"
                              onClick={() => openArticle('inflation-basics')}
                            >
                              (دمو) تورم یعنی چه؟
                            </button>
                            <div className="text-xs text-stone-500 mt-1">هدف: فهم رابطه تورم با دارایی‌ها.</div>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xs font-black">
                            ۲
                          </span>
                          <div className="flex-1">
                            <button
                              className="font-black hover:text-emerald-600"
                              onClick={() => openArticle('budgeting-503020')}
                            >
                              (دمو) بودجه ۵۰/۳۰/۲۰
                            </button>
                            <div className="text-xs text-stone-500 mt-1">هدف: ساخت جریان پول قابل مدیریت.</div>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="mt-5 bg-white border border-stone-200 rounded-2xl p-5">
                      <div className="font-black">ابزارهای مرتبط</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href="#tools" className="bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl text-sm font-black">
                          ماشین‌حساب وام
                        </a>
                        <a href="#tools" className="bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl text-sm font-black">
                          ماشین‌حساب تورم
                        </a>
                        <a href="#tools" className="bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl text-sm font-black">
                          خانه‌دار شدن: چند سال دیگه؟
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100">
                    <div className="mb-4 flex justify-between items-end">
                      <h4 className="font-black text-sm text-stone-500">روند رشد قیمت مسکن (مثال آموزشی)</h4>
                      <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-500">شماتیک</span>
                    </div>

                    <div className="relative w-full h-[300px] md:h-[350px]">
                      <canvas ref={homeCanvasRef} />
                    </div>

                    <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <div className="text-xs font-black text-stone-900">شفافیت</div>
                      <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                        این نمودار «آموزشی» است و داده‌ها شماتیک‌اند. هدف: نمایش مفهوم شکاف مسکن با تورم عمومی.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePath === 'inflation' && (
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        زمان تکمیل: ۱ تا ۲ ساعت
                      </span>
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        سطح: مبتدی تا متوسط
                      </span>
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        پیش‌نیاز: ندارد
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black mt-4 mb-3">
                      بقا در اقتصاد متلاطم: درک تورم
                    </h3>

                    <div className="mt-6 bg-stone-100 p-4 rounded-2xl border border-stone-200">
                      <label className="block text-xs font-black text-stone-600 mb-2">مبلغ فعلی (تومان):</label>
                      <input
                        type="number"
                        value={inflationAmount}
                        onChange={(e) => setInflationAmount(Number(e.target.value || 0))}
                        className="w-full bg-white border border-stone-300 rounded-xl p-3 text-left mb-4 font-mono"
                        inputMode="numeric"
                      />

                      <label className="block text-xs font-black text-stone-600 mb-2">
                        نرخ تورم سالانه (فرض): <span className="font-black text-stone-900">{toFaNumber(inflationRate)}٪</span>
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={60}
                        value={inflationRate}
                        onChange={(e) => setInflationRate(Number(e.target.value))}
                        className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer mb-4"
                      />

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-white p-3 rounded-xl border border-stone-200">
                        <span className="text-sm text-stone-600">قدرت خرید در ۵ سال آینده:</span>
                        <span className="font-black text-red-600 font-mono">
                          {new Intl.NumberFormat('fa-IR').format(inflationResult)} تومان
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => openArticle('inflation-basics')}
                          className="bg-white border border-stone-200 px-3 py-2 rounded-xl text-sm font-black hover:bg-stone-50"
                        >
                          مقاله: تورم در ۵ دقیقه
                        </button>
                        <a
                          href="#tools"
                          className="bg-white border border-stone-200 px-3 py-2 rounded-xl text-sm font-black hover:bg-stone-50"
                        >
                          ابزار کامل تورم
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100">
                    <div className="mb-4 flex justify-between items-end">
                      <h4 className="font-black text-sm text-stone-500">کاهش قدرت خرید پول نقد</h4>
                      <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-500">آموزشی</span>
                    </div>

                    <div className="relative w-full h-[300px] md:h-[350px]">
                      <canvas ref={inflationCanvasRef} />
                    </div>

                    <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <div className="text-xs font-black text-stone-900">شفافیت</div>
                      <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                        این نمودار بر اساس «نرخ تورم فرضی» محاسبه می‌شود. خروجی «تخمین آموزشی» است، نه پیش‌بینی قطعی.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePath === 'invest' && (
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        زمان تکمیل: ۳ تا ۶ ساعت
                      </span>
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        سطح: متوسط تا پیشرفته
                      </span>
                      <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                        پیش‌نیاز: تورم + بودجه
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black mt-4 mb-3">
                      شروع سرمایه‌گذاری: تخمین نه پیش‌بینی
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      نسخه واحدی وجود ندارد. این مسیر کمک می‌کند بر اساس <strong className="text-stone-900">ریسک‌پذیری</strong> خودتان تصمیم بگیرید.
                    </p>

                    <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-5">
                      <div className="font-black">درس‌های این مسیر (دمو)</div>
                      <div className="mt-3 text-sm text-stone-600">
                        فعلاً برای مرحله ۱، این مسیر هم به همین محتوای دمو وصل است.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100">
                    <div className="mb-4 flex justify-between items-end">
                      <h4 className="font-black text-sm text-stone-500">مقایسه بازدهی فرضی (۵ ساله)</h4>
                      <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-500">شماتیک</span>
                    </div>

                    <div className="relative w-full h-[300px] md:h-[350px]">
                      <canvas ref={investCanvasRef} />
                    </div>

                    <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <div className="text-xs font-black text-stone-900">شفافیت</div>
                      <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                        اعداد «آموزشی و نسبی» هستند (برای نمایش مفهوم ریسک/بازده). تصمیم واقعی نیازمند بررسی شرایط شماست.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shelves */}
            <div className="mt-14">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black">محتواهای منتخب</h3>
                  <p className="mt-2 text-stone-600">سه قفسه برای شروع سریع: پیشنهادی تخمینو، محبوب، و تازه‌ها.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShelf('recommended')}
                    className={shelf === 'recommended'
                      ? 'bg-stone-900 text-white px-4 py-2 rounded-xl font-black'
                      : 'bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50'}
                  >
                    پیشنهادی تخمینو
                  </button>
                  <button
                    onClick={() => setShelf('popular')}
                    className={shelf === 'popular'
                      ? 'bg-stone-900 text-white px-4 py-2 rounded-xl font-black'
                      : 'bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50'}
                  >
                    محبوب
                  </button>
                  <button
                    onClick={() => setShelf('new')}
                    className={shelf === 'new'
                      ? 'bg-stone-900 text-white px-4 py-2 rounded-xl font-black'
                      : 'bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50'}
                  >
                    تازه‌ها
                  </button>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shelfItems.map((item) => (
                  <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5">
                    <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2">
                      <span className="bg-stone-100 px-2 py-1 rounded font-black">{TOPIC_MAP[item.topic]}</span>
                      <span className="bg-stone-100 px-2 py-1 rounded font-black">{item.typeLabel}</span>
                      <span className="bg-stone-100 px-2 py-1 rounded font-black">{item.level}</span>
                      {item.recommended && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black">
                          پیشنهادی
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openArticle(item.id)}
                      className="mt-3 text-right font-black text-stone-900 hover:text-emerald-600 leading-snug"
                    >
                      {item.title}
                    </button>

                    <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                      {item.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
                      <span>تاریخ: {item.date}</span>
                      <span>آپدیت: {item.updated}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => openArticle(item.id)}
                        className="bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl text-sm font-black"
                      >
                        باز کردن صفحه محتوا
                      </button>
                      <a
                        href="#tools"
                        className="bg-white border border-stone-200 px-3 py-2 rounded-xl text-sm font-black hover:bg-stone-50"
                      >
                        ابزار مرتبط
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LIBRARY */}
        <section id="library" className="py-20 bg-[#F5F5F4] border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span className="text-emerald-600 font-black tracking-wider uppercase text-xs">کتابخانه</span>
                <h2 className="text-3xl md:text-5xl font-black mt-2">جستجو و فیلتر حرفه‌ای محتوا</h2>
                <p className="mt-4 text-stone-600 max-w-3xl">
                  جستجو، فیلتر (موضوع/سطح/نوع/زمان)، و مرتب‌سازی (جدیدترین/محبوب/به‌روزرسانی اخیر).
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4 w-full lg:w-[420px]">
                <label className="text-xs font-black text-stone-600">جستجو</label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="مثلاً: تورم، بودجه..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm"
                  />
                  <button
                    onClick={() => setSearch('')}
                    className="bg-stone-100 hover:bg-stone-200 px-4 rounded-xl font-black text-sm"
                  >
                    پاک
                  </button>
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  این نسخه دمو است؛ در نسخه محصول، سرچ/URLهای ایندکس‌پذیر حرفه‌ای می‌شود.
                </p>
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-4">
                <label className="text-xs font-black text-stone-600">موضوع</label>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value as any)}
                  className="mt-2 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm"
                >
                  <option value="all">همه</option>
                  <option value="inflation">تورم</option>
                  <option value="budget">مدیریت مالی</option>
                  <option value="home">مسکن</option>
                  <option value="invest">سرمایه‌گذاری</option>
                  <option value="behavior">رفتاری</option>
                  <option value="tools">راهنمای ابزار</option>
                </select>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4">
                <label className="text-xs font-black text-stone-600">سطح</label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="mt-2 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm"
                >
                  <option value="all">همه</option>
                  <option value="مبتدی">مبتدی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4">
                <label className="text-xs font-black text-stone-600">نوع محتوا</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="mt-2 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm"
                >
                  <option value="all">همه</option>
                  <option value="article">مقاله</option>
                  <option value="video">ویدیو</option>
                  <option value="podcast">پادکست</option>
                  <option value="guide">راهنما</option>
                </select>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4">
                <label className="text-xs font-black text-stone-600">مرتب‌سازی</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="mt-2 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm"
                >
                  <option value="new">جدیدترین</option>
                  <option value="updated">به‌روزرسانی اخیر</option>
                  <option value="popular">محبوب‌ترین</option>
                  <option value="recommended">پیشنهادی تخمینو</option>
                  <option value="timeAsc">کم‌زمان‌ترین</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-stone-600">
                <span className="font-black text-stone-900">{toFaNumber(libraryItems.length)}</span> نتیجه پیدا شد.
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFilterTopic('all');
                    setFilterLevel('all');
                    setFilterType('all');
                    setSortBy('new');
                    setSearch('');
                  }}
                  className="bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50"
                >
                  ریست فیلترها
                </button>
                <a
                  href="#article"
                  onClick={() => openArticle('inflation-basics')}
                  className="bg-stone-900 text-white px-4 py-2 rounded-xl font-black hover:bg-stone-800"
                >
                  نمونه صفحه مقاله
                </a>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraryItems.map((item) => (
                <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5">
                  <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2">
                    <span className="bg-stone-100 px-2 py-1 rounded font-black">{TOPIC_MAP[item.topic]}</span>
                    <span className="bg-stone-100 px-2 py-1 rounded font-black">{item.typeLabel}</span>
                    <span className="bg-stone-100 px-2 py-1 rounded font-black">{item.level}</span>
                    {item.recommended && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black">
                        پیشنهادی
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openArticle(item.id)}
                    className="mt-3 text-right font-black text-stone-900 hover:text-emerald-600 leading-snug"
                  >
                    {item.title}
                  </button>

                  <p className="mt-3 text-sm text-stone-600 leading-relaxed">{item.excerpt}</p>

                  <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
                    <span>{fmtMinutes(item.readTimeMin)}</span>
                    <span>آپدیت: {item.updated}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openArticle(item.id)}
                      className="bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl text-sm font-black"
                    >
                      باز کردن صفحه محتوا
                    </button>
                    <a
                      href="#tools"
                      className="bg-white border border-stone-200 px-3 py-2 rounded-xl text-sm font-black hover:bg-stone-50"
                    >
                      ابزار مرتبط
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs text-stone-400">
              نکته: در نسخه محصول (Next.js) این بخش می‌تواند صفحه‌بندی/لود تنبل و URLهای قابل ایندکس داشته باشد.
            </div>
          </div>
        </section>

        {/* ARTICLE */}
        <section id="article" className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#F5F5F4] border border-stone-200 rounded-3xl p-6 md:p-10 shadow-inner">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="text-xs text-stone-600">
                    <span className="font-black text-stone-900">Breadcrumb:</span>{' '}
                    <a href="#library" className="hover:text-emerald-600">کتابخانه</a>
                    <span className="mx-2 text-stone-300">/</span>
                    <span>{TOPIC_MAP[article.topic]}</span>
                    <span className="mx-2 text-stone-300">/</span>
                    <span className="font-black text-stone-900">{article.title}</span>
                  </div>

                  <h2 className="mt-4 text-2xl md:text-4xl font-black">{article.title}</h2>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                      {article.typeLabel}
                    </span>
                    <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                      {article.level}
                    </span>
                    <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                      زمان مطالعه: {fmtMinutes(article.readTimeMin)}
                    </span>
                    <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                      نویسنده: تیم تخمینو
                    </span>
                    <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                      تاریخ: {article.date}
                    </span>
                    <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-black">
                      آخرین آپدیت: {article.updated}
                    </span>
                  </div>

                  <p className="mt-4 text-stone-600 leading-relaxed max-w-3xl">{article.excerpt}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="#library" className="bg-white border border-stone-200 px-5 py-3 rounded-xl font-black hover:bg-stone-50">
                      بازگشت به کتابخانه
                    </a>
                    <button
                      onClick={() => {
                        const el = document.getElementById('articleTOC');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="bg-stone-900 text-white px-5 py-3 rounded-xl font-black hover:bg-stone-800"
                    >
                      رفتن به فهرست
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('nextSteps');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-black hover:bg-emerald-700"
                    >
                      گام بعدی
                    </button>
                  </div>
                </div>

                <aside className="w-full lg:w-[360px] space-y-4">
                  <div className="bg-white border border-stone-200 rounded-2xl p-5">
                    <div className="font-black">فهرست مطالب</div>
                    <ul id="articleTOC" className="mt-4 space-y-2 text-sm text-stone-600">
                      {article.sections.map((s) => (
                        <li key={s.id}>
                          <button
                            className="hover:text-emerald-600 text-right"
                            onClick={() => {
                              const el = document.getElementById(`sec-${s.id}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                          >
                            • {s.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-5">
                    <div className="font-black">شفافیت و فرضیات</div>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                      {article.assumptions ?? '—'}
                    </p>
                  </div>
                </aside>
              </div>

              <div className="mt-8 grid lg:grid-cols-3 gap-6">
                <article className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 md:p-8">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                    <div className="font-black">تعریف سریع</div>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{article.definition ?? '—'}</p>
                  </div>

                  <div className="mt-4 bg-stone-50 border border-stone-200 rounded-2xl p-5">
                    <div className="font-black">اشتباه رایج</div>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{article.mistake ?? '—'}</p>
                  </div>

                  <div className="mt-4 bg-stone-50 border border-stone-200 rounded-2xl p-5">
                    <div className="font-black">مثال ایرانی</div>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{article.iranExample ?? '—'}</p>
                  </div>

                  <div className="mt-6 space-y-6">
                    {article.sections.map((s) => (
                      <section key={s.id} id={`sec-${s.id}`} className="scroll-mt-24">
                        <h3 className="text-xl md:text-2xl font-black">{s.title}</h3>
                        <p className="mt-3 text-sm md:text-base text-stone-600 leading-relaxed">{s.body}</p>
                      </section>
                    ))}
                  </div>

                  <div className="mt-8 bg-[#F5F5F4] border border-stone-200 rounded-2xl p-6">
                    <div className="font-black">این را با ابزار انجام بده</div>
                    <p className="mt-2 text-sm text-stone-600">
                      برای اینکه مقاله از حالت تئوری خارج شود، با ابزارهای مرتبط سناریوی خودت را امتحان کن.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(article.tools ?? []).map((t) => (
                        <a
                          key={t.label}
                          href={t.href}
                          className="bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50"
                        >
                          {t.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div id="nextSteps" className="mt-8 bg-white border border-stone-200 rounded-2xl p-6">
                    <div className="font-black">گام بعدی</div>
                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                      {(article.nextSteps ?? [])
                        .map((nid) => CONTENT.find((x) => x.id === nid))
                        .filter(Boolean)
                        .map((n) => (
                          <button
                            key={n!.id}
                            onClick={() => openArticle(n!.id)}
                            className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-right hover:bg-stone-100"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-black">{n!.title}</div>
                              <span className="text-xs bg-white border border-stone-200 px-2 py-1 rounded font-black">
                                {n!.typeLabel}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-stone-600">{n!.excerpt}</div>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6">
                    <div className="font-black">مطالب مرتبط</div>
                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                      {(article.related ?? [])
                        .map((rid) => CONTENT.find((x) => x.id === rid))
                        .filter(Boolean)
                        .map((r) => (
                          <button
                            key={r!.id}
                            onClick={() => openArticle(r!.id)}
                            className="bg-white border border-stone-200 rounded-2xl p-4 text-right hover:bg-stone-50"
                          >
                            <div className="font-black">{r!.title}</div>
                            <div className="mt-2 text-sm text-stone-600">{r!.excerpt}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </article>

                <aside className="lg:col-span-1 space-y-4">
                  <div className="bg-white border border-stone-200 rounded-2xl p-6">
                    <div className="font-black">دسترسی سریع</div>
                    <div className="mt-4 flex flex-col gap-2">
                      <a href="#paths" className="bg-stone-100 hover:bg-stone-200 px-4 py-3 rounded-xl font-black">رفتن به مسیرها</a>
                      <a href="#tools" className="bg-stone-100 hover:bg-stone-200 px-4 py-3 rounded-xl font-black">رفتن به ابزارها</a>
                      <a href="#policy" className="bg-stone-100 hover:bg-stone-200 px-4 py-3 rounded-xl font-black">سیاست شفافیت</a>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-6">
                    <div className="font-black">واژه‌نامه سریع</div>
                    <ul className="mt-3 space-y-2 text-sm text-stone-600">
                      <li><span className="font-black text-stone-900">تورم:</span> کاهش قدرت خرید پول در زمان.</li>
                      <li><span className="font-black text-stone-900">صندوق اضطراری:</span> پول نقد/نقدشونده برای بحران‌ها.</li>
                      <li><span className="font-black text-stone-900">بهره مرکب:</span> رشد/افت روی رشد/افت قبلی.</li>
                      <li><span className="font-black text-stone-900">تنوع‌بخشی:</span> تقسیم دارایی برای مدیریت ریسک.</li>
                      <li><span className="font-black text-stone-900">خطاهای رفتاری:</span> تصمیمات غیرمنطقی تحت هیجان.</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section id="modules" className="py-20 bg-[#F5F5F4] border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-black">دسته‌بندی‌های آموزشی</h2>
              <p className="mt-2 text-stone-600">
                دسترسی مستقیم به سرفصل‌ها — هر کدام شامل مقاله/ویدیو/پادکست + ابزار مرتبط
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { topic: 'inflation' as const, icon: '🏛️', title: 'مفاهیم پایه مالی', desc: 'درک تورم واقعی، قدرت خرید و چرخه نقدینگی در ایران.' },
                { topic: 'budget' as const, icon: '💰', title: 'مدیریت مالی شخصی', desc: 'بودجه‌بندی ۵۰/۳۰/۲۰ به سبک ایرانی و مدیریت بدهی.' },
                { topic: 'invest' as const, icon: '📈', title: 'سرمایه‌گذاری برای همه', desc: 'مقایسه طلا، دلار، مسکن و بورس با نگاه ریسک/بازده.' },
                { topic: 'behavior' as const, icon: '🧠', title: 'خطاهای رفتاری', desc: 'FOMO، ترس، طمع و تصمیم‌های هیجانی.' },
                { topic: 'tools' as const, icon: '🛠️', title: 'راهنمای ابزارها', desc: 'چطور از ماشین‌حساب‌ها برای سناریوی شخصی استفاده کنیم؟' },
                { topic: 'inflation' as const, icon: '🔄', title: 'یادگیری تطبیقی', desc: 'با تست‌های کوتاه، مسیر آموزشی مناسب خودت را پیدا کن.' },
              ].map((c, idx) => (
                <a
                  key={idx}
                  href={idx === 5 ? '#assessment' : '#library'}
                  onClick={() => {
                    if (idx !== 5) setFilterTopic(c.topic);
                  }}
                  className="bg-white p-6 rounded-2xl border border-stone-100 hover:bg-stone-50"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                    {c.icon}
                  </div>
                  <h3 className="text-xl font-black mb-2">{c.title}</h3>
                  <p className="text-sm text-stone-600 mb-4">{c.desc}</p>
                  <span className="text-emerald-600 text-sm font-black">مشاهده ←</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* TOOLS (budget demo + chart) */}
        <section id="tools" className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
              <div>
                <span className="text-emerald-600 font-black tracking-wider uppercase text-xs">ابزارها</span>
                <h2 className="text-3xl md:text-5xl font-black mt-2">پل بین آموزش و تصمیم واقعی</h2>
                <p className="mt-4 text-stone-600 max-w-3xl">
                  هر جا “حس کردی فهمیدی”، باید با ابزار امتحانش کنی تا تبدیل به تصمیم شود.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div className="order-2 lg:order-1">
                <div className="bg-stone-50 rounded-3xl p-6 md:p-8 border border-stone-200 shadow-xl">
                  <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
                    <h3 className="font-black">ماشین‌حساب بودجه شخصی</h3>
                    <span className="text-xs bg-white border px-2 py-1 rounded font-black">
                      قانون ۵۰/۳۰/۲۰
                    </span>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-black text-stone-600 mb-2">
                      درآمد ماهانه (تومان):
                    </label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value || 0))}
                      className="w-full p-3 rounded-xl border border-stone-300 outline-none font-mono text-left"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-6">
                    <div className="bg-white p-3 rounded-xl border border-stone-100">
                      <div className="text-xs text-stone-600 mb-1">نیازها (۵۰٪)</div>
                      <div className="font-black text-sm">
                        {new Intl.NumberFormat('fa-IR').format(budgetParts.needs)}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-100">
                      <div className="text-xs text-stone-600 mb-1">خواسته‌ها (۳۰٪)</div>
                      <div className="font-black text-sm">
                        {new Intl.NumberFormat('fa-IR').format(budgetParts.wants)}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-100">
                      <div className="text-xs text-stone-600 mb-1">پس‌انداز (۲۰٪)</div>
                      <div className="font-black text-sm">
                        {new Intl.NumberFormat('fa-IR').format(budgetParts.savings)}
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full h-[300px] md:h-[350px]">
                    <canvas ref={budgetCanvasRef} />
                  </div>

                  <div className="mt-4 bg-white border border-stone-200 rounded-2xl p-4">
                    <div className="text-xs font-black text-stone-900">شفافیت</div>
                    <p className="mt-1 text-xs text-stone-600">
                      این دمو «آموزشی» است. قانون ۵۰/۳۰/۲۰ باید با واقعیت زندگی در ایران (اجاره/قسط/درآمد) تنظیم شود.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openArticle('budgeting-503020')}
                      className="bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50"
                    >
                      مقاله: بودجه ۵۰/۳۰/۲۰
                    </button>
                    <a
                      href="#"
                      className="bg-stone-900 text-white px-4 py-2 rounded-xl font-black hover:bg-stone-800"
                    >
                      ابزار کامل مدیریت هزینه
                    </a>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-black mb-4">انضباط مالی: کلید آرامش</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  در اقتصاد ایران، مدیریت درآمد کارمندی یک هنر است. بودجه‌بندی ۵۰/۳۰/۲۰ یک چارچوب ساده است که ما آن را واقع‌بینانه توضیح می‌دهیم.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-4">
                    <div className="bg-emerald-500 text-white w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black">
                      ۱
                    </div>
                    <div>
                      <strong className="block font-black text-stone-900">۵۰٪ نیازهای ضروری</strong>
                      <span className="text-sm text-stone-500">اجاره، قسط‌های واجب، مواد غذایی…</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-stone-500 text-white w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black">
                      ۲
                    </div>
                    <div>
                      <strong className="block font-black text-stone-900">۳۰٪ خواسته‌ها</strong>
                      <span className="text-sm text-stone-500">تفریح، خریدهای غیرضروری…</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-emerald-800 text-white w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black">
                      ۳
                    </div>
                    <div>
                      <strong className="block font-black text-stone-900">۲۰٪ پس‌انداز و سرمایه‌گذاری</strong>
                      <span className="text-sm text-stone-500">طلا، صندوق درآمد ثابت یا سهام…</span>
                    </div>
                  </li>
                </ul>

                <div className="bg-[#F5F5F4] border border-stone-200 rounded-3xl p-6">
                  <div className="font-black">از آموزش به اجرا</div>
                  <p className="mt-2 text-sm text-stone-600">
                    پیشنهاد: اول مقاله بودجه را بخوان، بعد عددها را وارد کن، بعد برو سراغ ابزار کامل.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openArticle('budgeting-503020')}
                      className="bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50"
                    >
                      شروع با مقاله بودجه
                    </button>
                    <a
                      href="#library"
                      onClick={() => setFilterTopic('budget')}
                      className="bg-white border border-stone-200 px-4 py-2 rounded-xl font-black hover:bg-stone-50"
                    >
                      مشاهده همه محتواهای بودجه
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}