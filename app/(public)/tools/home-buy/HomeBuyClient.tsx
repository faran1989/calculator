'use client';

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Script from 'next/script';
import { Vazirmatn } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Car,
  Plane,
  Briefcase,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Target,
  Users,
  HelpCircle,
} from 'lucide-react';

import ToolPageShell, { type ToolTabKey } from '@/components/template/ToolPageShell';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

/* ================================
   Design Tokens (Locked)
================================ */
const SEO = {
  title: 'چند سال دیگه می‌تونم خونه بخرم؟ | تخمینو',
  description:
    'با وارد کردن چند عدد ساده، تخمینو یک تخمین تقریبی و صادقانه از زمان رسیدن به هدف خرید خانه ارائه می‌دهد.',
  canonical: '/tools/home-buy',
};

const ACCENT = {
  // Accent Color حرفه‌ای (آبی مالی عمیق)
  solid: 'bg-blue-700 hover:bg-blue-800',
  ring: 'focus:ring-blue-500/25 focus:border-blue-700',
  text: 'text-blue-700',
  border: 'border-blue-700/20',
};

const MOTION = {
  fast: { duration: 0.22 }, // 200–300ms
};

/* ----------------------------- utils ----------------------------- */

function toEnglishDigits(input: string) {
  // Persian + Arabic digits → English
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
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };

  return input.replace(/[۰-۹٠-٩]/g, (d) => map[d] ?? d);
}

function parseMoney(input: string): number {
  const normalized = toEnglishDigits(input)
    .replace(/[,\s]/g, '')
    .replace(/[^0-9]/g, '');
  if (!normalized) return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function formatFaNumber(n: number): string {
  // Simple fa formatting with separators
  const s = Math.max(0, Math.round(n)).toString();
  const withComma = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const faMap: Record<string, string> = {
    '0': '۰',
    '1': '۱',
    '2': '۲',
    '3': '۳',
    '4': '۴',
    '5': '۵',
    '6': '۶',
    '7': '۷',
    '8': '۸',
    '9': '۹',
    ',': '،',
  };
  return withComma.replace(/[0-9,]/g, (ch) => faMap[ch] ?? ch);
}

function formatWaitTime(months: number): string {
  const m = Math.max(0, Math.ceil(months));
  if (m < 12) return `حدود ${formatFaNumber(m)} ماه`;
  const years = Math.ceil(m / 12);
  return `حدود ${formatFaNumber(years)} سال`;
}

/* ----------------------------- components ----------------------------- */

type AccordionItemProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200/70 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={[
          'w-full py-4 flex justify-between items-center text-right',
          'transition-colors outline-none',
          'hover:text-blue-700',
          'focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'rounded-lg',
        ].join(' ')}
        aria-expanded={isOpen}
      >
        <span className="font-bold text-sm text-slate-900">{title}</span>
        {isOpen ? (
          <ChevronUp size={18} className="text-slate-500" />
        ) : (
          <ChevronDown size={18} className="text-slate-500" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={MOTION.fast}
            className="pb-4 text-sm text-slate-600 leading-7"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type InnerSectionCardProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

function InnerSectionCard({ title, icon, children }: InnerSectionCardProps) {
  return (
    <section className="bg-white/95 border border-slate-200/70 rounded-[22px] p-6 md:p-7 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
        {icon ? <span className="text-blue-700">{icon}</span> : null}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/* ----------------------------- client page ----------------------------- */

export default function HomeBuyClient() {
  const [activeTab, setActiveTab] = useState<ToolTabKey>('tool');
  const [isCalculated, setIsCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [income, setIncome] = useState('۳۰,۰۰۰,۰۰۰');
  const [savings, setSavings] = useState('۱۵۰,۰۰۰,۰۰۰');
  const [goalPrice, setGoalPrice] = useState('۵,۰۰۰,۰۰۰,۰۰۰');

  // Hash routing helpers (locked behavior)
  const pendingScrollToAboutRef = useRef(false);
  const pendingScrollToTopRef = useRef(false);

  const calc = useMemo(() => {
    const incomeN = parseMoney(income);
    const savingsN = parseMoney(savings);
    const goalN = parseMoney(goalPrice);

    const remaining = Math.max(0, goalN - savingsN);

    // base: 30% of income saved monthly
    const baseMonthlySave = incomeN * 0.3;
    const minMonthlySave = incomeN * 0.25;
    const maxMonthlySave = incomeN * 0.35;

    const baseMonths = baseMonthlySave > 0 ? Math.ceil(remaining / baseMonthlySave) : 0;
    const minMonths = maxMonthlySave > 0 ? Math.ceil(remaining / maxMonthlySave) : 0; // faster
    const maxMonths = minMonthlySave > 0 ? Math.ceil(remaining / minMonthlySave) : 0; // slower

    return {
      incomeN,
      savingsN,
      goalN,
      remaining,
      baseMonths,
      minMonths: Math.min(minMonths, maxMonths),
      maxMonths: Math.max(minMonths, maxMonths),
      baseText: formatWaitTime(baseMonths),
      rangeText:
        remaining === 0
          ? 'همین الان'
          : `${formatWaitTime(Math.min(minMonths, maxMonths))} تا ${formatWaitTime(
              Math.max(minMonths, maxMonths)
            )}`,
    };
  }, [income, savings, goalPrice]);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsCalculated(true);
    }, 700);
  };

  // ===============================
  // SEO: Schema placeholders (Locked)
  // ===============================
  const schemaWebApp = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'چند سال دیگه می‌تونم خونه بخرم؟',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description: SEO.description,
    }),
    []
  );

  const schemaBreadcrumb = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'تخمینو', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'ابزارها', item: '/tools' },
        { '@type': 'ListItem', position: 3, name: 'خرید خانه', item: SEO.canonical },
      ],
    }),
    []
  );

  const schemaFAQ = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'آیا تورم در محاسبات لحاظ شده است؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'خیر، این ابزار بر اساس قدرت خرید امروز محاسبه می‌کند تا مقیاسی برای توان مالی فعلی شما باشد.',
          },
        },
        {
          '@type': 'Question',
          name: 'آیا اطلاعات من ذخیره می‌شود؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'خیر، تمام محاسبات در مرورگر شما انجام می‌شود و هیچ داده‌ای در سرور ذخیره نمی‌شود.',
          },
        },
      ],
    }),
    []
  );

  // Hash Routing (Locked): sync initial load + back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyFromHash = () => {
      const isAbout = window.location.hash === '#about';
      if (isAbout) {
        pendingScrollToAboutRef.current = true;
        setActiveTab('about');
      } else {
        setActiveTab('tool');
      }
    };

    applyFromHash();

    const onHashChange = () => applyFromHash();
    const onPopState = () => applyFromHash();

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  // Hash Routing (Locked): scroll behaviors after tab mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (activeTab === 'about' && pendingScrollToAboutRef.current) {
      pendingScrollToAboutRef.current = false;

      const doScroll = () => {
        const el = document.getElementById('panel-about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      requestAnimationFrame(() => {
        if (doScroll()) return;
        requestAnimationFrame(() => {
          if (doScroll()) return;
          setTimeout(() => {
            doScroll();
          }, 0);
        });
      });
    }

    if (activeTab === 'tool' && pendingScrollToTopRef.current) {
      pendingScrollToTopRef.current = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const goToToolTab = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, '', baseUrl);
      pendingScrollToTopRef.current = true;
    }
    setActiveTab('tool');
  };

  const goToAboutTab = () => {
    if (typeof window !== 'undefined') {
      const withHash = `${window.location.pathname}${window.location.search}#about`;
      window.history.replaceState(null, '', withHash);
      pendingScrollToAboutRef.current = true;
    }
    setActiveTab('about');
  };

  return (
    <>
      <Script id="schema-webapp" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(schemaWebApp)}
      </Script>
      <Script id="schema-breadcrumb" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(schemaBreadcrumb)}
      </Script>
      <Script id="schema-faq" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(schemaFAQ)}
      </Script>

      <ToolPageShell
        fontClassName={vazirmatn.className}
        h1="چند سال دیگه می‌تونم خونه بخرم؟"
        subtitle="فقط چند عدد ساده وارد کن، تخمین تقریبی صادقانه می‌دم."
        activeTab={activeTab}
        onGoTool={goToToolTab}
        onGoAbout={goToAboutTab}
        accentSolidClass={ACCENT.solid}
        relatedTitle="ابزارهای مرتبط"
        relatedTools={[
          {
            href: '/tools/car',
            title: 'تخمین خودرو',
            desc: 'چند سال تا ماشین؟',
            icon: <Car className="text-blue-700" />,
          },
          {
            href: '/tools/migration',
            title: 'مهاجرت',
            desc: 'هزینه و زمان تقریبی',
            icon: <Plane className="text-blue-700" />,
          },
          {
            href: '/tools/retirement',
            title: 'بازنشستگی',
            desc: 'تخمین سن فراغت',
            icon: <Briefcase className="text-blue-700" />,
          },
        ]}
        footerLinks={[
          { href: '/about', label: 'درباره ما' },
          { href: '/terms', label: 'قوانین' },
          { href: '/contact', label: 'تماس' },
        ]}
      >
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'tool' ? (
            <motion.div
              key="panel-tool"
              id="panel-tool"
              role="tabpanel"
              aria-labelledby="tab-tool"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={MOTION.fast}
            >
              {/* Tool Tab: Inputs + Primary Results + Insight Box + State management */}
              {!isCalculated ? (
                <div className="space-y-8">
                  <div className="grid gap-6">
                    <div className="space-y-2.5">
                      <label className="block text-sm font-bold text-slate-800 mr-1">درآمد ماهانه (تومان)</label>
                      <input
                        type="text"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        inputMode="numeric"
                        className={[
                          'w-full h-[56px] px-5 rounded-2xl',
                          'bg-white border border-slate-200',
                          'text-lg font-semibold text-slate-900',
                          'outline-none transition-shadow',
                          'focus:ring-4',
                          ACCENT.ring,
                          'placeholder:text-slate-400',
                          'focus-visible:ring-blue-500/25',
                        ].join(' ')}
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-sm font-bold text-slate-800 mr-1">پس‌انداز فعلی (تومان)</label>
                      <input
                        type="text"
                        value={savings}
                        onChange={(e) => setSavings(e.target.value)}
                        inputMode="numeric"
                        className={[
                          'w-full h-[56px] px-5 rounded-2xl',
                          'bg-white border border-slate-200',
                          'text-lg font-semibold text-slate-900',
                          'outline-none transition-shadow',
                          'focus:ring-4',
                          ACCENT.ring,
                          'placeholder:text-slate-400',
                          'focus-visible:ring-blue-500/25',
                        ].join(' ')}
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-sm font-bold text-slate-800 mr-1">قیمت هدف (تومان)</label>
                      <input
                        type="text"
                        value={goalPrice}
                        onChange={(e) => setGoalPrice(e.target.value)}
                        inputMode="numeric"
                        className={[
                          'w-full h-[56px] px-5 rounded-2xl',
                          'bg-white border border-slate-200',
                          'text-lg font-semibold text-slate-900',
                          'outline-none transition-shadow',
                          'focus:ring-4',
                          ACCENT.ring,
                          'placeholder:text-slate-400',
                          'focus-visible:ring-blue-500/25',
                        ].join(' ')}
                      />
                    </div>
                  </div>

                  {/* Primary Button (locked) */}
                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={loading}
                    className={[
                      'w-full h-[60px] rounded-2xl',
                      'text-white font-black text-lg',
                      'transition-transform transition-colors',
                      'active:scale-[0.98]',
                      ACCENT.solid,
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50',
                      'shadow-lg shadow-blue-700/20',
                    ].join(' ')}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-3">
                        <span className="w-6 h-6 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                        در حال محاسبه…
                      </span>
                    ) : (
                      'تخمین بزن'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-slate-500 font-semibold mb-3">نتیجه تخمین صادقانه</p>

                  <div className="text-3xl md:text-5xl font-black text-blue-700 mb-4 tracking-tight">
                    {calc.remaining === 0 ? 'همین الان ✅' : calc.rangeText}
                  </div>

                  <p className="text-base md:text-lg text-slate-700 font-semibold leading-relaxed mb-8 max-w-md mx-auto">
                    {calc.remaining === 0
                      ? 'با اعداد فعلی، به هدف رسیدی.'
                      : `با روند فعلی ذخیره درآمد شما، ${calc.baseText} به هدفت می‌رسی (فرض ذخیره ۳۰٪ درآمد).`}
                  </p>

                  {/* Insight Box (locked) */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 mb-8 text-right">
                    <p className="text-[13px] text-slate-600 italic leading-7">
                      * توجه: این یک تخمین ریاضی ساده است. تورم، رشد درآمد، یا تغییرات بازار در نظر گرفته نشده.
                    </p>
                  </div>

                  {/* Secondary (outline) */}
                  <button
                    type="button"
                    onClick={() => setIsCalculated(false)}
                    className={[
                      'inline-flex items-center gap-2 mx-auto',
                      'text-sm font-black',
                      'px-4 py-2 rounded-xl',
                      'border border-blue-700/25 text-blue-700 hover:bg-blue-50 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50',
                    ].join(' ')}
                  >
                    <ArrowLeft size={18} className="mt-0.5" />
                    تغییر اعداد و محاسبه مجدد
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="panel-about"
              id="panel-about"
              role="tabpanel"
              aria-labelledby="tab-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={MOTION.fast}
              className="space-y-6"
            >
              {/* About Tab: دقیقا 5 بخش با H2 */}
              <InnerSectionCard title="این ابزار چه می‌کند؟" icon={<Target size={22} />}>
                <p className="text-slate-700 leading-8 text-base md:text-[15px]">
                  «تخمینو» یک دستیار شفاف برای دیدن واقعیت‌های مالی است. این ابزار به جای پیش‌بینی‌های پیچیده، بر اساس
                  قدرت پس‌انداز فعلی شما، یک تخمین زمانی واقع‌بینانه ارائه می‌دهد.
                </p>
              </InnerSectionCard>

              <InnerSectionCard title="نحوه محاسبه">
                <p className="text-slate-700 mb-2 text-sm leading-7">
                  مبلغ مورد نیاز را بر توان ذخیره‌سازی ماهانه شما (پیش‌فرض ۳۰٪ درآمد) تقسیم می‌کنیم.
                </p>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-inner font-mono text-center text-slate-600 text-sm overflow-x-auto">
                  (قیمت هدف - پس‌انداز) ÷ (درآمد × ۰.۳) = تعداد ماه‌های انتظار
                </div>

                <AccordionItem title="توضیحات تکمیلی فرمول">
                  این محاسبه عمداً ساده است تا «مقیاس زمانی» توان مالی امروزتان را بفهمید؛ نه اینکه آینده اقتصاد را
                  پیش‌بینی کند.
                </AccordionItem>
              </InnerSectionCard>

              <InnerSectionCard title="مناسب چه کسانی است؟" icon={<Users size={22} />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200/70 rounded-2xl">
                    <h3 className="font-black text-sm mb-2 text-slate-900">برنامه‌ریزان واقع‌بین</h3>
                    <p className="text-xs text-slate-600 leading-6">
                      کسانی که می‌خواهند بدانند با فرمان فعلی، چند سال تا هدف فاصله دارند.
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200/70 rounded-2xl">
                    <h3 className="font-black text-sm mb-2 text-slate-900">جویندگان شفافیت</h3>
                    <p className="text-xs text-slate-600 leading-6">
                      افرادی که از فرمول‌های پیچیده و وعده‌های غیرواقعی خسته شده‌اند.
                    </p>
                  </div>
                </div>
              </InnerSectionCard>

              <InnerSectionCard title="چه خروجی‌هایی دریافت می‌کنید؟">
                <ul className="space-y-3">
                  {[
                    'تخمین بازه زمانی (حداقل و حداکثر)',
                    'تخمین زمان رسیدن با فرض ذخیره ۳۰٪ درآمد',
                    'هشدار درباره ساده بودن مدل و تغییرپذیری شرایط',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700 text-sm md:text-[15px]">
                      <CheckCircle2 size={18} className="text-blue-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              </InnerSectionCard>

              <InnerSectionCard title="سوالات متداول (FAQ آکاردئونی)" icon={<HelpCircle size={22} />}>
                <div className="divide-y divide-slate-200/70" role="region" aria-label="سوالات متداول">
                  <AccordionItem title="آیا تورم در محاسبات لحاظ شده است؟">
                    خیر، این ابزار بر اساس قدرت خرید امروز محاسبه می‌کند تا مقیاسی برای توان مالی فعلی‌تان باشد.
                  </AccordionItem>
                  <AccordionItem title="آیا اطلاعات من ذخیره می‌شود؟">
                    خیر، تمام محاسبات در مرورگر شما انجام می‌شود و هیچ داده‌ای در سرور ذخیره نمی‌شود.
                  </AccordionItem>
                </div>
              </InnerSectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </ToolPageShell>
    </>
  );
}
