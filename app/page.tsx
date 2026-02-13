'use client';

import React, { useEffect, useMemo, useRef, useState, useId } from 'react';
import { Vazirmatn } from 'next/font/google';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Home,
  Menu,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
  Clock,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '900'],
});

// --------- ✅ Deterministic RNG helpers (NO Math.random) ----------
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

// --- Background Particles Component (fixed hydration) ---
const LiveParticles = () => {
  const rid = useId(); // ✅ stable between server & client

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

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${p.x}%`,
            y: `${p.y}%`,
            opacity: p.o,
          }}
          animate={{
            y: ['0%', '-20%', '0%'],
            x: ['0%', '5%', '0%'],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.d,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full"
        />
      ))}
    </div>
  );
};

// --- Magnetic Hover Effect Component ---
type MagneticWrapperProps = {
  children: React.ReactNode;
  strength?: number;
};

const MagneticWrapper = ({ children, strength = 0.3 }: MagneticWrapperProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

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

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'صفحه اصلی', link: '#' },
    { name: 'ابزارها', link: '#tools' },
    { name: 'دانشنامه', link: '#wiki' },
    { name: 'وبلاگ', link: '#blog' },
  ];

  return (
    <>
      <nav className="fixed top-6 left-0 right-0 z-[100] transition-all duration-500 flex justify-center px-6">
        <motion.div
          layout
          className={`flex items-center justify-between gap-8 px-6 py-3 rounded-full border transition-all duration-500 ${
            scrolled
              ? 'bg-white/80 backdrop-blur-2xl border-white/50 shadow-2xl w-full max-w-4xl'
              : 'bg-white/40 backdrop-blur-md border-white/20 w-full max-w-5xl'
          }`}
        >
          <a href="#" className="flex items-center gap-3 cursor-pointer group">
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
            >
              <Activity className="text-white w-5 h-5" />
            </motion.div>
            <span className="text-[#111827] font-black text-xl tracking-tighter">تخمینو</span>
          </a>

          <div className="hidden md:flex items-center gap-8 bg-white/30 px-6 py-2 rounded-full border border-white/40 shadow-inner">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="text-xs font-bold text-gray-700 hover:text-[#059669] transition-all relative group"
              >
                {item.name}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#059669] rounded-full"
                  whileHover={{ width: '100%' }}
                />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <MagneticWrapper strength={0.2}>
              <button className="hidden sm:block bg-[#111827] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#059669] transition-all shadow-lg active:scale-95">
                پنل کاربری
              </button>
            </MagneticWrapper>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 h-[2px] bg-emerald-500 rounded-full"
          style={{ width: useTransform(scrollYProgress, [0, 1], ['0%', '80%']) }}
        />
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white p-8 flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-2">
                <Activity className="text-[#059669]" />
                <span className="font-black text-xl">تخمینو</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-gray-50 rounded-full"
                aria-label="بستن منو"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {menuItems.map((item, idx) => (
                <motion.a
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  href={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black text-gray-800 hover:text-[#059669] transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 bg-[#059669] text-white py-6 rounded-3xl font-black text-xl shadow-2xl"
              >
                ورود به حساب
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

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
  | {
      title: string;
      subtitle: string;
      items: ToolItem[];
      type?: 'tool';
    }
  | {
      title: string;
      subtitle: string;
      items: ArticleItem[];
      type: 'article';
    };

const HorizontalSlider = ({ title, subtitle, items, type = 'tool' }: HorizontalSliderProps) => {
  // ✅ TS Narrowing قطعی برای build (جلوگیری از ToolItem | ArticleItem)
  if (type === 'tool') {
    const toolItems = items as ToolItem[];

    return (
      <section className="py-24 px-6 md:px-12 relative" id="tools">
        <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">{title}</h2>
            <p className="text-gray-400 font-medium">{subtitle}</p>
          </motion.div>
        </div>

        <div className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 px-4 scroll-smooth">
          {toolItems.map((item, i) => (
            <motion.div
              key={i}
              className="min-w-[320px] md:min-w-[420px] snap-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <LuxuryCard className="p-10 h-full flex flex-col group cursor-pointer border-white/60 hover:border-emerald-200 shadow-xl shadow-emerald-900/5">
                <div
                  className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-all duration-500 ${item.color} group-hover:rotate-[15deg] group-hover:scale-110`}
                >
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-[#059669] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-10 opacity-90">{item.desc}</p>
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
      </section>
    );
  }

  const articleItems = items as ArticleItem[];

  return (
    <section className="py-24 px-6 md:px-12 relative" id="wiki">
      <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">{title}</h2>
          <p className="text-gray-400 font-medium">{subtitle}</p>
        </motion.div>
      </div>

      <div className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 px-4 scroll-smooth">
        {articleItems.map((item, i) => (
          <motion.div
            key={i}
            className="min-w-[320px] md:min-w-[420px] snap-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="group cursor-pointer" id="blog">
              <div className="aspect-[16/10] bg-gray-100 rounded-[40px] mb-8 overflow-hidden relative shadow-lg">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <BookOpen className="w-32 h-32" />
                </div>
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/40 backdrop-blur-xl text-gray-800 text-[10px] rounded-full font-black border border-white/50">
                    مجله اقتصادی
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 leading-snug group-hover:text-[#059669] transition-all">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default function Page() {
  const tools: ToolItem[] = [
    {
      icon: Home,
      title: 'تملک مسکن',
      color: 'bg-blue-50 text-blue-600',
      desc: 'محاسبه زمان واقعی خرید خانه با پایش لحظه‌ای قیمت متری در مناطق مختلف.',
    },
    {
      icon: Plane,
      title: 'مهاجرت تحصیلی',
      color: 'bg-purple-50 text-purple-600',
      desc: 'شبیه‌سازی هزینه‌های زندگی و تحصیل در کشورهای مقصد با نرخ ارز آزاد.',
    },
    {
      icon: Clock,
      title: 'آزادی مالی',
      color: 'bg-orange-50 text-orange-600',
      desc: 'عددی را پیدا کنید که در آن سود دارایی‌هایتان تمام هزینه‌های زندگی را پوشش دهد.',
    },
    {
      icon: BarChart3,
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
      className={`${vazirmatn.className} min-h-screen bg-[#FDFDFD] text-[#111827] overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900`}
      dir="rtl"
    >
      <Navbar />
      <LiveParticles />

      <main className="relative z-10 pt-20">
        <section className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-5xl relative z-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-50 text-[#059669] text-[11px] font-black mb-10 border border-emerald-100 shadow-sm"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              هوش مصنوعی تحلیل تورم فعال شد
            </motion.div>

            <h1 className="text-7xl md:text-[10rem] font-black leading-[0.9] mb-12 tracking-tighter">
              فراتر از <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-950 via-emerald-600 to-emerald-400">
                یک تخمین.
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-xl md:text-3xl leading-relaxed mb-20 max-w-3xl mx-auto font-light"
            >
              ما با داده‌های واقعی، مسیر مالی شما را از میان طوفان‌های اقتصادی ترسیم می‌کنیم.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <MagneticWrapper strength={0.15}>
                <button className="w-full sm:w-auto bg-[#111827] text-white px-16 py-8 rounded-[30px] text-2xl font-black shadow-2xl hover:bg-[#059669] transition-all transform hover:scale-105 active:scale-95">
                  رایگان شروع کنید
                </button>
              </MagneticWrapper>

              <button className="w-full sm:w-auto flex items-center gap-3 text-xl font-black group">
                <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-gray-50 transition-all">
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </div>
                <span>مشاهده ویدیو معرفی</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -right-20 opacity-20 lg:opacity-100 hidden lg:block"
          >
            <LuxuryCard className="p-6 w-64 bg-white/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-100" />
                <div className="h-2 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-emerald-50 rounded-full" />
                <div className="h-2 w-2/3 bg-emerald-50 rounded-full" />
              </div>
            </LuxuryCard>
          </motion.div>
        </section>

        <HorizontalSlider
          title="ابزارهای هوشمند"
          subtitle="بر اساس متغیرهای کلان اقتصاد ایران در سال ۱۴۰۴"
          items={tools}
          type="tool"
        />

        <section className="py-40 relative">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-6xl font-black tracking-tighter leading-tight">
                پویاترین موتور <br />
                محاسباتی فارسی.
              </h2>

              <div className="space-y-8">
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
                    className="flex gap-6 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="w-14 h-14 shrink-0 rounded-[20px] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-all">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/20 blur-[120px] rounded-full" />

              <LuxuryCard className="p-12 relative z-10 overflow-hidden">
                <div className="flex justify-between items-center mb-12">
                  <span className="font-black text-xl">وضعیت زنده بازار</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                    LIVE
                  </div>
                </div>

                <div className="space-y-8">
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

                <div className="mt-12 p-6 bg-[#111827] rounded-[30px] text-center">
                  <p className="text-gray-400 text-[10px] font-bold mb-2 uppercase tracking-widest">
                    توصیه هوشمند
                  </p>
                  <p className="text-white font-black text-sm leading-relaxed">
                    با توجه به تورم فعلی، تبدیل ۲۰٪ نقدینگی به دارایی‌های ثابت توصیه می‌شود.
                  </p>
                </div>
              </LuxuryCard>
            </div>
          </div>
        </section>

        <HorizontalSlider
          title="دانشنامه تخمینو"
          subtitle="آموزش‌هایی برای بقا و رشد در اقتصادهای پرتلاطم"
          items={articles}
          type="article"
        />

        <section className="py-60 relative flex flex-col items-center justify-center text-center px-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter mb-16">
              سفر مالی شما <br />
              <span className="text-[#059669]">از اینجا آغاز می‌شود.</span>
            </h2>
            <MagneticWrapper strength={0.2}>
              <button className="bg-[#111827] text-white px-20 py-10 rounded-full text-3xl font-black shadow-[0_30px_100px_rgba(5,150,105,0.3)] hover:bg-[#059669] transition-all">
                همین حالا تخمین بزنید
              </button>
            </MagneticWrapper>
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-[400px] h-[400px] border border-emerald-200 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute w-[400px] h-[400px] border border-emerald-100 rounded-full"
            />
          </div>
        </section>
      </main>

      <footer className="py-24 px-10 border-t border-gray-100 bg-white relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Activity className="text-[#059669] w-8 h-8" />
              <span className="font-black text-3xl tracking-tighter">تخمینو</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-loose font-medium">
              تلاشی برای شفافیت در دنیای اعداد. ما ابزار می‌سازیم تا شما با اطمینان بیشتری برای آینده برنامه‌ریزی کنید.
            </p>
          </div>

          <div className="flex flex-wrap gap-20">
            <div className="space-y-6">
              <h5 className="font-black text-lg">بخش‌های سایت</h5>
              <div className="flex flex-col gap-4 text-sm text-gray-500 font-bold">
                <a href="#" className="hover:text-[#059669] transition-colors">
                  شبیه‌ساز مسکن
                </a>
                <a href="#" className="hover:text-[#059669] transition-colors">
                  برآورد مهاجرت
                </a>
                <a href="#" className="hover:text-[#059669] transition-colors">
                  ماشین‌حساب تورم
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="font-black text-lg">تخمینو</h5>
              <div className="flex flex-col gap-4 text-sm text-gray-500 font-bold">
                <a href="#" className="hover:text-[#059669] transition-colors">
                  داستان ما
                </a>
                <a href="#" className="hover:text-[#059669] transition-colors">
                  حریم خصوصی
                </a>
                <a href="#" className="hover:text-[#059669] transition-colors">
                  ارتباط با ما
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-bold">تمامی حقوق برای برند تخمینو محفوظ است © ۱۴۰۴</p>
          <div className="flex gap-6">
            {['توییتر', 'لینکدین', 'اینستاگرام'].map((social) => (
              <a key={social} href="#" className="text-xs font-black text-gray-300 hover:text-[#059669]">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
