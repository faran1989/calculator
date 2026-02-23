// app/(light)/HomeClient.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useId } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Compass,
  Home,
  Plane,
  Percent,
  ShieldCheck,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

import HomeSmartSection from './_components/HomeSmartSection';
import { getHomeFeaturedResolved } from './home.homeData';

type Props = {
  fontClassName: string;
};

/* ─────────────────────────────────────────────
   ✅ تشخیص موبایل
───────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calc = () => setIsMobile(window.innerWidth < breakpoint);
    calc();
    window.addEventListener('resize', calc, { passive: true });
    return () => window.removeEventListener('resize', calc);
  }, [breakpoint]);

  return isMobile;
}

/* ─────────────────────────────────────────────
   ✅ RNG قطعی
───────────────────────────────────────────── */
function hashStringToUint32(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─────────────────────────────────────────────
   ✅ ذرات پس‌زمینه
───────────────────────────────────────────── */
const LiveParticles = () => {
  const rid = useId();
  const reduceMotion = useReducedMotion();

  const particles = useMemo(() => {
    const baseSeed = hashStringToUint32(`takhmino-particles:${rid}`);
    return Array.from({ length: 15 }).map((_, i) => {
      const rnd = mulberry32(baseSeed + i * 1013);
      return {
        x: rnd() * 100,
        y: rnd() * 100,
        o: rnd() * 0.5,
        d: 10 + rnd() * 10,
      };
    });
  }, [rid]);

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: p.o }}
          animate={{
            y: ['0%', '-20%', '0%'],
            x: ['0%', '5%', '0%'],
            opacity: [0.08, 0.22, 0.08],
          }}
          transition={{ duration: p.d, repeat: Infinity, ease: 'linear' }}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full"
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   ✅ Magnetic Hover
───────────────────────────────────────────── */
type MagneticWrapperProps = {
  children: React.ReactNode;
  strength?: number;
};

const MagneticWrapper = ({ children, strength = 0.3 }: MagneticWrapperProps) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    if (reduceMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   ✅ Luxury Card
───────────────────────────────────────────── */
type LuxuryCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

const LuxuryCard = ({ children, className = '', delay = 0 }: LuxuryCardProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all rounded-[40px] ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   ✅ تایپ‌ها
───────────────────────────────────────────── */
type ToolItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  color: string;
  desc: string;
};

type ArticleItem = {
  title: string;
  desc: string;
};

type HorizontalSliderProps =
  | { title: string; subtitle: string; items: ToolItem[]; type?: 'tool' }
  | { title: string; subtitle: string; items: ArticleItem[]; type: 'article' };

/* ─────────────────────────────────────────────
   ✅ اسلایدر افقی
───────────────────────────────────────────── */
const HorizontalSlider = ({ title, subtitle, items, type = 'tool' }: HorizontalSliderProps) => {
  const isMobile = useIsMobile(768);
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    if (!isMobile) setVisibleCount(Number.MAX_SAFE_INTEGER);
    else setVisibleCount(2);
  }, [isMobile]);

  const loadMore = () => setVisibleCount((v) => v + 2);
  const moreLabel = type === 'tool' ? 'ابزارهای بیشتر' : 'مقالات بیشتر';

  const shownItems = isMobile ? (items as any[]).slice(0, visibleCount) : (items as any[]);
  const total = items.length;
  const canLoadMore = isMobile && visibleCount < total;

  const Title = (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="space-y-2"
    >
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter">{title}</h2>
      <p className="text-gray-400 font-medium text-sm sm:text-base">{subtitle}</p>
    </motion.div>
  );

  if (type === 'tool') {
    const toolItems = shownItems as ToolItem[];
    return (
      <section className="py-16 sm:py-20 px-6 md:px-12 relative">
        <div className="max-w-7xl mx-auto mb-8 flex justify-between items-end">{Title}</div>

        <div
          className={
            isMobile
              ? 'grid grid-cols-1 gap-8'
              : 'flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10 px-4 scroll-smooth'
          }
        >
          {toolItems.map((item, i) => (
            <motion.div
              key={i}
              className={isMobile ? '' : 'min-w-[320px] md:min-w-[420px] snap-center'}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <LuxuryCard className="p-10 h-full flex flex-col group cursor-pointer border-white/60 hover:border-emerald-200 shadow-xl shadow-emerald-900/5">
                <div
                  className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-all duration-500 ${item.color} group-hover:rotate-[15deg] group-hover:scale-110`}
                >
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4 group-hover:text-[#059669] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-10 opacity-90 text-sm sm:text-base">
                  {item.desc}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      آماده محاسبه
                    </span>
                  </div>
                  <ArrowUpRight className="text-[#059669] w-6 h-6 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                </div>
              </LuxuryCard>
            </motion.div>
          ))}
        </div>

        {canLoadMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              className="bg-[#111827] text-white px-8 py-3 rounded-[18px] text-sm font-black hover:bg-[#059669] transition-all shadow-lg active:scale-95"
            >
              {moreLabel}
            </button>
          </div>
        )}
      </section>
    );
  }

  const articleItems = shownItems as ArticleItem[];

  return (
    <section className="py-16 sm:py-20 px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-end">{Title}</div>

      <div
        className={
          isMobile
            ? 'grid grid-cols-1 gap-10'
            : 'flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10 px-4 scroll-smooth'
        }
      >
        {articleItems.map((item, i) => (
          <motion.div
            key={i}
            className={isMobile ? '' : 'min-w-[320px] md:min-w-[420px] snap-center'}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="group cursor-pointer">
              <div className="aspect-[16/10] bg-gray-100 rounded-[30px] mb-6 overflow-hidden relative shadow-lg">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <BookOpen className="w-24 sm:w-28 h-24 sm:h-28" />
                </div>
                <div className="absolute top-5 left-5">
                  <span className="px-4 py-2 bg-white/40 backdrop-blur-xl text-gray-800 text-[10px] rounded-full font-black border border-white/50">
                    مجله اقتصادی
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black mb-3 leading-snug group-hover:text-[#059669] transition-all">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-medium">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {canLoadMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((v) => v + 2)}
            className="bg-[#111827] text-white px-8 py-3 rounded-[18px] text-sm font-black hover:bg-[#059669] transition-all shadow-lg active:scale-95"
          >
            مقالات بیشتر
          </button>
        </div>
      )}
    </section>
  );
};

/* ─────────────────────────────────────────────
   ✅ Hero Illustration (Scenario Path SVG)
───────────────────────────────────────────── */
const HeroScenarioIllustration = () => {
  const reduceMotion = useReducedMotion();

  const dashAnim = reduceMotion ? undefined : { strokeDashoffset: [0, -240] };
  const dashTrans = reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'linear' as const };

  const pulseAnim = reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] };
  const pulseTrans = reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <div className="relative">
      <div className="absolute -inset-10 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-400/15 blur-[90px] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative rounded-[34px] border border-black/5 bg-white/55 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.10)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[16px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-black text-gray-500">خروجی سناریویی</p>
              <p className="text-sm font-black text-[#111827]">۳ مسیر برای یک تصمیم</p>
            </div>
          </div>

          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">شفاف</span>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-black/5 text-[11px] font-black text-gray-700">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              بدبینانه
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-black/5 text-[11px] font-black text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              واقع‌بینانه
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-black/5 text-[11px] font-black text-gray-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              خوش‌بینانه
            </span>
          </div>

          <div className="relative rounded-[26px] bg-gradient-to-br from-white/70 to-white/35 border border-black/5 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-400/10 blur-[70px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/8 blur-[80px] rounded-full" />
            </div>

            <div className="relative p-5 sm:p-6">
              <svg viewBox="0 0 560 280" className="w-full h-[200px] sm:h-[240px]" aria-hidden="true">
                <g opacity="0.25">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="40"
                      y1={40 + i * 34}
                      x2="520"
                      y2={40 + i * 34}
                      stroke="#111827"
                      strokeWidth="1"
                      strokeDasharray="4 8"
                    />
                  ))}
                </g>

                <circle cx="70" cy="210" r="7" fill="#111827" opacity="0.9" />

                <path
                  d="M70 210 C 170 120, 270 260, 350 190 C 420 130, 470 170, 520 110"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="5"
                  opacity="0.14"
                  strokeLinecap="round"
                />
                <path
                  d="M70 210 C 170 170, 260 250, 350 210 C 420 170, 470 190, 520 150"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="5"
                  opacity="0.18"
                  strokeLinecap="round"
                />
                <path
                  d="M70 210 C 160 190, 255 205, 350 175 C 420 150, 470 140, 520 120"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="5"
                  opacity="0.14"
                  strokeLinecap="round"
                />

                <motion.path
                  d="M70 210 C 170 120, 270 260, 350 190 C 420 130, 470 170, 520 110"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="10 10"
                  style={{ strokeDashoffset: 0 }}
                  animate={dashAnim}
                  transition={dashTrans}
                  opacity="0.55"
                />
                <motion.path
                  d="M70 210 C 170 170, 260 250, 350 210 C 420 170, 470 190, 520 150"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="10 10"
                  style={{ strokeDashoffset: 0 }}
                  animate={dashAnim}
                  transition={dashTrans}
                  opacity="0.65"
                />
                <motion.path
                  d="M70 210 C 160 190, 255 205, 350 175 C 420 150, 470 140, 520 120"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="10 10"
                  style={{ strokeDashoffset: 0 }}
                  animate={dashAnim}
                  transition={dashTrans}
                  opacity="0.55"
                />

                <motion.circle cx="520" cy="110" r="7" fill="#ef4444" animate={pulseAnim} transition={pulseTrans} />
                <motion.circle cx="520" cy="150" r="7" fill="#059669" animate={pulseAnim} transition={pulseTrans} />
                <motion.circle cx="520" cy="120" r="7" fill="#3b82f6" animate={pulseAnim} transition={pulseTrans} />
              </svg>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-[18px] bg-white/70 border border-black/5 px-3 py-3 text-center">
                  <p className="text-[10px] font-black text-gray-500">بدبینانه</p>
                  <p className="text-sm sm:text-base font-black text-[#111827]">۲۲ ماه</p>
                </div>
                <div className="rounded-[18px] bg-white/70 border border-emerald-200/60 px-3 py-3 text-center shadow-[0_14px_40px_rgba(5,150,105,0.10)]">
                  <p className="text-[10px] font-black text-emerald-700/80">واقع‌بینانه</p>
                  <p className="text-sm sm:text-base font-black text-[#111827]">۱۴ ماه</p>
                </div>
                <div className="rounded-[18px] bg-white/70 border border-black/5 px-3 py-3 text-center">
                  <p className="text-[10px] font-black text-gray-500">خوش‌بینانه</p>
                  <p className="text-sm sm:text-base font-black text-[#111827]">۹ ماه</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              خروجی‌ها «تخمین» هستند؛ نه پیش‌بینی قطعی.
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              آماده استفاده
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ✅ Hero
───────────────────────────────────────────── */
const HeroSection = () => {
  return (
    <section
      className="
        min-h-screen flex items-center px-6 sm:px-8 relative overflow-hidden
        pb-28 sm:pb-32 lg:pb-0
      "
    >
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-14 items-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center lg:text-right"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="inline-flex items-center gap-3 px-5 sm:px-6 py-2 rounded-full bg-emerald-50 text-[#059669] text-[10px] sm:text-[11px] font-black mb-8 sm:mb-10 border border-emerald-100 shadow-sm"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            هوش مصنوعی تحلیل تورم فعال شد
          </motion.div>

          <h1 className="text-[44px] sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] mb-8 sm:mb-10 tracking-tight">
            <span className="block text-[#059669] mb-4">تخمینو</span>

            <span className="block text-[#111827] font-black leading-[1.65] tracking-tight text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px]">
              <span className="inline md:whitespace-nowrap">
                <span className="text-[#059669]">ت</span>صمیم{' '}
                <span className="text-[#059669]">خ</span>ردمندانه،{' '}
                <span className="text-[#059669]">م</span>بنای{' '}
                <span className="text-[#059669]">ی</span>افتن{' '}
                <span className="text-[#059669]">ن</span>تیجه{' '}
                <span className="text-[#059669]">و</span>اقعی
              </span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-gray-500 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 font-medium"
          >
            تصمیم شما مسیر را می‌سازد؛ ما فقط واقعیت‌ها را شفاف می‌کنیم.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-6 sm:gap-8">
            <MagneticWrapper strength={0.15}>
              <Link
                href="/tools"
                className="w-full sm:w-auto inline-flex items-center justify-center 
bg-[#111827] text-white 
px-7 sm:px-10 
py-3.5 sm:py-4.5 
rounded-[22px] sm:rounded-[26px] 
text-base sm:text-lg 
font-black 
shadow-[0_18px_50px_rgba(0,0,0,0.18)] 
hover:bg-[#059669] 
hover:shadow-[0_22px_60px_rgba(5,150,105,0.25)]
transition-all duration-300 
active:scale-[0.97]"
              >
                شروع تصمیم گیری
              </Link>
            </MagneticWrapper>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/5 px-3 py-2 text-[11px] font-black text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              رایگان
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/5 px-3 py-2 text-[11px] font-black text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              سناریوهای چندگانه
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/5 px-3 py-2 text-[11px] font-black text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              خروجی قابل توضیح
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.1 }}
          className="w-full"
        >
          <HeroScenarioIllustration />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-b from-transparent via-[#F5F7F6]/55 to-[#F5F7F6] z-10" />
    </section>
  );
};

/* ─────────────────────────────────────────────
   ✅ سکشن «قبل از هر تصمیم مالی، خودت را بشناس.»
───────────────────────────────────────────── */
const KnowYourselfSection = () => {
  return (
    <section className="py-16 sm:py-20 px-6 md:px-12 relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/10 blur-[90px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-center md:text-right space-y-3 sm:space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter">
            قبل از هر تصمیم مالی، <span className="text-[#059669]">خودت را بشناس.</span>
          </h2>

          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed max-w-3xl mx-auto md:mx-0">
            گاهی مسئله عددها نیستند؛ مسئله این است که نمی‌دانیم چگونه تصمیم می‌گیریم.
            <br className="hidden sm:block" />
            قبل از ورود به ابزارها، یک نگاه شفاف به «سواد» و «رفتار» مالی خودت داشته باش.
          </p>
        </motion.div>

        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <LuxuryCard className="p-9 sm:p-10 h-full border-white/60 hover:border-emerald-200 shadow-xl shadow-emerald-900/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[22px] bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                    <Brain className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-widest text-emerald-700/80 uppercase">
                      ارزیابی سریع
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black">سواد مالی تو در چه سطحی است؟</h3>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-black/5 text-[11px] font-black text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ۳ دقیقه
                </span>
              </div>

              <p className="mt-6 text-gray-500 leading-relaxed text-sm sm:text-base font-medium">
                آیا مفهوم تورم را عمیق می‌فهمی؟<br />
                آیا می‌دانی بهره واقعی و اسمی چه تفاوتی دارند؟<br />
                پیش از تصمیم‌های بزرگ، میزان آگاهی خودت را بسنج.
              </p>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  بدون ذخیره‌سازی داده حساس
                </div>

                <MagneticWrapper strength={0.14}>
                  <Link
                    href="/tools/financial-literacy"
                    className="
                      inline-flex items-center gap-2
                      text-[#059669] font-black text-sm
                      px-4 py-2 rounded-[14px]
                      bg-white/55 border border-black/5
                      shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                      hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(5,150,105,0.14)]
                      transition-all active:scale-95
                    "
                    aria-label="ارزیابی سواد مالی"
                  >
                    ارزیابی سواد مالی
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </MagneticWrapper>
              </div>
            </LuxuryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.05 }}
          >
            <LuxuryCard className="p-9 sm:p-10 h-full border-white/60 hover:border-emerald-200 shadow-xl shadow-emerald-900/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[22px] bg-white/70 text-[#059669] border border-black/5 flex items-center justify-center">
                    <Compass className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                      تیپ‌شناسی تصمیم
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black">سبک تصمیم‌گیری مالی تو چیست؟</h3>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-black/5 text-[11px] font-black text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  شناختی
                </span>
              </div>

              <p className="mt-6 text-gray-500 leading-relaxed text-sm sm:text-base font-medium">
                ریسک‌پذیر هستی یا محافظ سرمایه؟<br />
                احساسی تصمیم می‌گیری یا تحلیلی؟<br />
                شناخت رفتار مالی، نصف مسیر موفقیت است.
              </p>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-600">
                  <Users className="w-4 h-4 text-emerald-700" />
                  نتیجه قابل توضیح
                </div>

                <MagneticWrapper strength={0.14}>
                  <Link
                    href="/tools/financial-taste"
                    className="
                      inline-flex items-center gap-2
                      text-[#059669] font-black text-sm
                      px-4 py-2 rounded-[14px]
                      bg-white/55 border border-black/5
                      shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                      hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(5,150,105,0.14)]
                      transition-all active:scale-95
                    "
                    aria-label="شناخت تیپ مالی"
                  >
                    شناخت تیپ مالی
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </MagneticWrapper>
              </div>
            </LuxuryCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 sm:mt-12 flex justify-center lg:justify-start"
        >
          <MagneticWrapper strength={0.16}>
            <Link
              href="/tools"
              className="
                inline-flex items-center justify-center gap-3
                bg-[#111827] text-white
                px-7 sm:px-9 py-3.5
                rounded-[22px]
                text-sm sm:text-base
                font-black
                shadow-[0_18px_50px_rgba(0,0,0,0.18)]
                hover:bg-[#059669]
                hover:shadow-[0_22px_60px_rgba(5,150,105,0.22)]
                transition-all duration-300
                active:scale-[0.97]
              "
              aria-label="مشاهده همه ابزارها"
            >
              مشاهده همه ابزارها
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </MagneticWrapper>
        </motion.div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ✅ NEW: Two-Column Section (Explanation + Mini Calculator)
───────────────────────────────────────────── */
const AssumptionsWithMiniToolSection = () => {
  const reduceMotion = useReducedMotion();

  const nf = useMemo(
    () =>
      new Intl.NumberFormat('fa-IR', {
        maximumFractionDigits: 0,
      }),
    []
  );

  const [mode, setMode] = useState<'pp' | 'rule'>('pp');

  // ---- Power Purchasing (pp) ----
  const [ppAmount, setPpAmount] = useState<number>(10000000);
  const [ppInflation, setPpInflation] = useState<number>(40);
  const [ppYears, setPpYears] = useState<number>(1);

  const ppFactor = useMemo(() => {
    const r = Math.max(0, ppInflation) / 100;
    const y = Math.max(0, ppYears);
    return Math.pow(1 + r, y);
  }, [ppInflation, ppYears]);

  const ppFuture = useMemo(() => {
    const a = Math.max(0, ppAmount);
    return a * ppFactor;
  }, [ppAmount, ppFactor]);

  // ---- 50/30/20 ----
  const [income, setIncome] = useState<number>(30000000);
  const ruleNeeds = Math.max(0, income) * 0.5;
  const ruleWants = Math.max(0, income) * 0.3;
  const ruleSave = Math.max(0, income) * 0.2;

  const chip = (txt: string) => (
    <span className="inline-flex items-center rounded-full bg-white/70 border border-black/5 px-3 py-2 text-[11px] sm:text-xs font-black text-gray-700">
      {txt}
    </span>
  );

  const Field = ({
    label,
    hint,
    value,
    onChange,
    suffix,
  }: {
    label: string;
    hint?: string;
    value: number;
    onChange: (n: number) => void;
    suffix?: React.ReactNode;
  }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-black text-gray-700">{label}</p>
          {hint && <p className="text-[11px] font-bold text-gray-400">{hint}</p>}
        </div>

        <div className="relative">
          <input
            inputMode="numeric"
            value={Number.isFinite(value) ? String(value) : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.]/g, '');
              const n = raw === '' ? 0 : Number(raw);
              onChange(Number.isFinite(n) ? n : 0);
            }}
            className="
              w-full
              rounded-[18px]
              bg-white/70
              border border-black/5
              px-4 py-3
              text-sm sm:text-base
              font-black text-[#111827]
              outline-none
              focus:border-emerald-200
              focus:shadow-[0_18px_55px_rgba(5,150,105,0.10)]
              transition-all
            "
          />
          {suffix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-500">
              {suffix}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 sm:py-20 px-6 md:px-12 relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/10 blur-[90px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* RIGHT (Explanation) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-1 lg:order-2 text-center lg:text-right space-y-5"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-50 text-[#059669] text-[10px] sm:text-[11px] font-black border border-emerald-100 shadow-sm w-fit mx-auto lg:mx-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
            تصمیم = فرض‌ها + محاسبه + پیامد
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter leading-tight">
            هر تصمیم مالی، از <span className="text-[#059669]">چند فرض ساده</span> ساخته می‌شود.
          </h2>

          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
            تخمینو آینده را پیش‌بینی نمی‌کند؛ فقط نشان می‌دهد اگر فرض‌ها تغییر کنند، نتیجه چطور تغییر می‌کند.
          </p>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="rounded-[26px] bg-white/55 border border-black/5 px-5 py-5 text-right shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-black text-gray-500">مرحله ۱</p>
                <div className="w-10 h-10 rounded-[18px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669]">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-base font-black text-[#111827]">ورودی‌ها</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                {chip('تورم')}
                {chip('درآمد')}
                {chip('مدت زمان')}
                {chip('ریسک')}
              </div>
            </div>

            <div className="rounded-[26px] bg-white/55 border border-black/5 px-5 py-5 text-right shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-black text-gray-500">مرحله ۲</p>
                <div className="w-10 h-10 rounded-[18px] bg-white/70 border border-black/5 flex items-center justify-center text-[#111827]">
                  <Sigma className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-base font-black text-[#111827]">محاسبه</p>
              <p className="mt-2 text-[12px] sm:text-[13px] font-medium text-gray-500 leading-relaxed">
                اعداد فقط بر اساس همین فرض‌ها تغییر می‌کنند — نه ادعای جادویی.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                {chip('منطق')}
                {chip('ریاضی')}
                {chip('سناریو')}
              </div>
            </div>

            <div className="rounded-[26px] bg-white/55 border border-black/5 px-5 py-5 text-right shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-black text-gray-500">مرحله ۳</p>
                <div className="w-10 h-10 rounded-[18px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669]">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-base font-black text-[#111827]">خروجی</p>
              <p className="mt-2 text-[12px] sm:text-[13px] font-medium text-gray-500 leading-relaxed">
                نتیجه، پیش‌بینی آینده نیست؛ نمایش پیامد انتخاب‌های توست.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                خروجی‌ها «تخمین» هستند
              </div>
            </div>
          </div>
        </motion.div>

        {/* LEFT (Mini Tool) */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="order-2 lg:order-1"
        >
          <LuxuryCard className="p-8 sm:p-9 border-white/60 hover:border-emerald-200 shadow-xl shadow-emerald-900/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[22px] bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                  {mode === 'pp' ? <Percent className="w-7 h-7" /> : <Wallet className="w-7 h-7" />}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-widest text-emerald-700/80 uppercase">ابزار کوچک</p>
                  <h3 className="text-xl sm:text-2xl font-black">{mode === 'pp' ? 'قدرت خرید در آینده' : 'قانون 50-30-20'}</h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-black/5 text-[11px] font-black text-gray-700">
                {!reduceMotion && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                ساده و سریع
              </span>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('pp')}
                className={`px-4 py-2 rounded-full text-[12px] font-black border transition-all ${
                  mode === 'pp'
                    ? 'bg-[#111827] text-white border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
                    : 'bg-white/70 text-gray-700 border-black/5 hover:border-emerald-200'
                }`}
              >
                قدرت خرید
              </button>
              <button
                type="button"
                onClick={() => setMode('rule')}
                className={`px-4 py-2 rounded-full text-[12px] font-black border transition-all ${
                  mode === 'rule'
                    ? 'bg-[#111827] text-white border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
                    : 'bg-white/70 text-gray-700 border-black/5 hover:border-emerald-200'
                }`}
              >
                50-30-20
              </button>
            </div>

            {mode === 'pp' ? (
              <div className="mt-7 space-y-5">
                <Field
                  label="مبلغ امروز (تومان)"
                  hint="مثلاً هزینه ماهانه یا قیمت کالا"
                  value={ppAmount}
                  onChange={setPpAmount}
                  suffix="تومان"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="تورم سالانه (%)" value={ppInflation} onChange={setPpInflation} suffix="%" />
                  <Field label="چند سال بعد؟" value={ppYears} onChange={setPpYears} suffix="سال" />
                </div>

                <div className="mt-2 rounded-[26px] bg-[#111827] text-white p-5 sm:p-6 shadow-[0_26px_80px_rgba(5,150,105,0.14)]">
                  <p className="text-gray-300 text-[10px] font-bold mb-2 uppercase tracking-widest">خروجی تخمینی</p>
                  <p className="text-sm sm:text-base font-black leading-relaxed">
                    اگر تورم سالانه <span className="text-emerald-300">{nf.format(ppInflation)}٪</span> باشد، مبلغ{' '}
                    <span className="text-emerald-300">{nf.format(ppAmount)}</span> تومان بعد از{' '}
                    <span className="text-emerald-300">{nf.format(ppYears)}</span> سال حدوداً می‌شود:
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-2xl sm:text-3xl font-black tracking-tight">{nf.format(ppFuture)}</p>
                    <p className="text-[11px] font-bold text-gray-300">تومان</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      پیش‌بینی نیست؛ فقط پیامد فرض‌هاست.
                    </div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      شفاف
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-7 space-y-5">
                <Field
                  label="درآمد ماهانه (تومان)"
                  hint="عدد خالص دریافتی"
                  value={income}
                  onChange={setIncome}
                  suffix="تومان"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-[22px] bg-white/70 border border-black/5 p-4">
                    <p className="text-[11px] font-black text-gray-500">نیازها (۵۰٪)</p>
                    <p className="mt-2 text-lg sm:text-xl font-black text-[#111827]">{nf.format(ruleNeeds)}</p>
                    <p className="text-[11px] font-bold text-gray-400">تومان</p>
                  </div>
                  <div className="rounded-[22px] bg-white/70 border border-black/5 p-4">
                    <p className="text-[11px] font-black text-gray-500">خواسته‌ها (۳۰٪)</p>
                    <p className="mt-2 text-lg sm:text-xl font-black text-[#111827]">{nf.format(ruleWants)}</p>
                    <p className="text-[11px] font-bold text-gray-400">تومان</p>
                  </div>
                  <div className="rounded-[22px] bg-white/70 border border-emerald-200/60 p-4 shadow-[0_14px_40px_rgba(5,150,105,0.10)]">
                    <p className="text-[11px] font-black text-emerald-700/80">پس‌انداز (۲۰٪)</p>
                    <p className="mt-2 text-lg sm:text-xl font-black text-[#111827]">{nf.format(ruleSave)}</p>
                    <p className="text-[11px] font-bold text-gray-400">تومان</p>
                  </div>
                </div>

                <div className="rounded-[22px] bg-white/60 border border-black/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-600">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      هدف: ساخت عادت، نه سخت‌گیری
                    </div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-500">
                      {!reduceMotion && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      قابل تنظیم
                    </div>
                  </div>
                  <p className="mt-2 text-[12px] sm:text-[13px] font-medium text-gray-500 leading-relaxed">
                    اگر از همین تقسیم ساده شروع کنی، تصمیم‌هایت شفاف‌تر و قابل کنترل‌تر می‌شوند.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                محاسبه داخل مرورگر
              </div>

              <MagneticWrapper strength={0.14}>
                <Link
                  href="/tools"
                  className="
                    inline-flex items-center gap-2
                    text-[#059669] font-black text-sm
                    px-4 py-2 rounded-[14px]
                    bg-white/55 border border-black/5
                    shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                    hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(5,150,105,0.14)]
                    transition-all active:scale-95
                  "
                  aria-label="رفتن به ابزارها"
                >
                  ابزارهای کامل‌تر
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </MagneticWrapper>
            </div>
          </LuxuryCard>
        </motion.div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ✅ Engine Section
───────────────────────────────────────────── */
const EngineSection = () => {
  return (
    <section className="py-24 sm:py-40 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-10 sm:space-y-12"
        >
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight">
            پویاترین موتور <br />
            محاسباتی فارسی.
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {[
              {
                icon: Zap,
                title: 'تحلیل سناریوهای چندگانه',
                desc: 'بررسی حالت‌های خوش‌بینانه و بدبینانه تورم به صورت همزمان.',
              },
              {
                icon: Users,
                title: 'داده‌های جمع‌سپاری شده',
                desc: 'استفاده از قیمت‌های واقعی بازار که توسط کاربران تایید شده‌اند.',
              },
              {
                icon: ShieldCheck,
                title: 'حریم خصوصی در هسته',
                desc: 'پردازش تمام محاسبات در مرورگر شما بدون ارسال داده به سرور.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-5 sm:gap-6 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-[18px] sm:rounded-[20px] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-all">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400/20 blur-[120px] rounded-full" />

          <LuxuryCard className="p-8 sm:p-12 relative z-10 overflow-hidden">
            <div className="flex justify-between items-center mb-8 sm:mb-12">
              <span className="font-black text-lg sm:text-xl">وضعیت زنده بازار</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                LIVE
              </div>
            </div>

            <div className="space-y-7 sm:space-y-8">
              {[
                { label: 'دلار آزاد', val: '۶۸,۴۰۰', color: 'bg-emerald-500' },
                { label: 'طلای ۱۸', val: '۴,۵۲۰,۰۰۰', color: 'bg-amber-500' },
                { label: 'تورم سالانه', val: '۴۲.۴٪', color: 'bg-red-500' },
              ].map((row, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{row.label}</span>
                    <span>{row.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full ${row.color} opacity-60`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 p-5 sm:p-6 bg-[#111827] rounded-[26px] sm:rounded-[30px] text-center">
              <p className="text-gray-400 text-[10px] font-bold mb-2 uppercase tracking-widest">توصیه هوشمند</p>
              <p className="text-white font-black text-sm leading-relaxed">
                با توجه به تورم فعلی، تبدیل ۲۰٪ نقدینگی به دارایی‌های ثابت توصیه می‌شود.
              </p>
            </div>
          </LuxuryCard>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ✅ Final CTA
───────────────────────────────────────────── */
const FinalCTASection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-28 relative flex flex-col items-center justify-center text-center px-6 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-auto"
      >
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05]">
          <span className="block sm:inline">سفر مالی شما</span>{' '}
          <span className="block sm:inline text-[#059669]">از اینجا آغاز می‌شود.</span>
        </h2>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          یک تصمیم شفاف، می‌تواند مسیر چند سال آینده‌ات را تغییر دهد.
        </p>

        <div className="mt-8 sm:mt-10">
          <MagneticWrapper strength={0.18}>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center bg-[#111827] text-white px-9 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-xl font-black shadow-[0_26px_80px_rgba(5,150,105,0.18)] hover:bg-[#059669] transition-all active:scale-95"
            >
              همین حالا تخمین بزنید
            </Link>
          </MagneticWrapper>
        </div>
      </motion.div>
    </section>
  );
};

export default function HomeClient({ fontClassName }: Props) {
  const featured = getHomeFeaturedResolved();

  const tools: ToolItem[] = [
    {
      icon: Home as any,
      title: 'تملک مسکن',
      color: 'bg-blue-50 text-blue-600',
      desc: 'محاسبه زمان واقعی خرید خانه با پایش لحظه‌ای قیمت متری در مناطق مختلف.',
    },
    {
      icon: Plane as any,
      title: 'مهاجرت تحصیلی',
      color: 'bg-purple-50 text-purple-600',
      desc: 'شبیه‌سازی هزینه‌های زندگی و تحصیل در کشورهای مقصد با نرخ ارز آزاد.',
    },
    {
      icon: Clock as any,
      title: 'آزادی مالی',
      color: 'bg-orange-50 text-orange-600',
      desc: 'عددی را پیدا کنید که در آن سود دارایی‌هایتان تمام هزینه‌های زندگی را پوشش دهد.',
    },
    {
      icon: BarChart3 as any,
      title: 'سبدگردان هوشمند',
      color: 'bg-emerald-50 text-emerald-600',
      desc: 'پیش‌بینی رشد سرمایه شما در بورس، طلا و رمزارز طی ۵ سال آینده.',
    },
  ];

  const articles: ArticleItem[] = [
    { title: 'فرار از تله نقدینگی در سال ۱۴۰۵', desc: 'چگونه بدون ریسک‌های بزرگ، ارزش سرمایه خرد خود را در برابر تورم حفظ کنیم؟' },
    { title: 'معمای حباب مسکن در کلان‌شهرها', desc: 'بررسی آماری قیمت‌ها؛ آیا اکنون زمان مناسبی برای ورود به بازار املاک است؟' },
    { title: 'روانشناسی ثروت در عصر نوسان', desc: 'چرا برخی در بحران‌ها ثروتمندتر می‌شوند؟ بررسی رفتارهای مالی هوشمندانه.' },
    { title: 'ارزهای دیجیتال یا طلای فیزیکی؟', desc: 'مقایسه استراتژیک دو پناهگاه امن سرمایه برای بازه زمانی بلندمدت.' },
  ];

  return (
    <div
      dir="rtl"
      className={`${fontClassName} min-h-screen text-[#111827] overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900`}
    >
      <LiveParticles />

      {/* ✅ چون هدر در AppShell ثابت (fixed) است، محتوا زیر هدر نرود */}
      <main className="relative z-10">
        <HeroSection />

        <HomeSmartSection
          primaryCtaHref={(featured.tools?.[0] as any)?.toolRoute ?? '/tools'}
          primaryCtaLabel={(featured.tools?.[0] as any)?.title ?? 'رفتن به ابزار منتخب'}
          secondaryCtaHref={(featured.articleOfWeek as any)?.articleRoute ?? '/academy'}
          secondaryCtaLabel="مطالعه مقاله هفته"
        />

        <KnowYourselfSection />
        <AssumptionsWithMiniToolSection />

        <HorizontalSlider
          title="ابزارهای هوشمند"
          subtitle="بر اساس متغیرهای کلان اقتصاد ایران در سال ۱۴۰۴"
          items={tools}
          type="tool"
        />

        <EngineSection />

        <HorizontalSlider
          title="دانشنامه تخمینو"
          subtitle="آموزش‌هایی برای بقا و رشد در اقتصادهای پرتلاطم"
          items={articles}
          type="article"
        />

        <FinalCTASection />
      </main>
    </div>
  );
}