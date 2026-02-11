'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Briefcase,
  ChevronLeft,
  Coins,
  Command,
  Cpu,
  CreditCard,
  Gem,
  Globe,
  Home,
  Landmark,
  Moon,
  Percent,
  PieChart,
  Search,
  ShoppingCart,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Umbrella,
  User,
} from 'lucide-react';

// --- Global Styles (page-local) ---
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;400;700;900&family=Outfit:wght@100;400;900&display=swap');

  :root {
    --font-main: 'Vazirmatn', sans-serif;
    --font-logo: 'Outfit', sans-serif;
    --accent: #3b82f6;
  }

  .font-logo { font-family: var(--font-logo); }

  /* Desktop glass (lux) */
  .glass {
    background: rgba(255, 255, 255, 0.42);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.32);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dark .glass {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.10);
  }

  /* Mobile performance glass (no backdrop-filter) */
  .perf .glass {
    backdrop-filter: none !important;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(15, 23, 42, 0.06);
  }
  .perf.dark .glass {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.10);
  }

  .orbit-path {
    border: 1px solid rgba(59, 130, 246, 0.12);
    pointer-events: none;
    position: absolute;
    border-radius: 9999px;
  }
  .dark .orbit-path { border: 1px solid rgba(59, 130, 246, 0.06); }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  .floating { animation: float 6s infinite ease-in-out; }

  html, body { overscroll-behavior-y: none; }
  .will-gpu { transform: translateZ(0); will-change: transform; }
`;

type Tool = {
  id: number;
  title: string;
  icon: LucideIcon;
  category: string;
  color: string;
  desc: string;
};

const TOOLS: Tool[] = [
  { id: 1, title: 'خرید خانه', icon: Home, category: 'مالی', color: '#10b981', desc: 'تخمین زمان مالکیت ملک بر اساس قدرت خرید.' },
  { id: 2, title: 'مالیات درآمد', icon: Percent, category: 'مالی', color: '#f59e0b', desc: 'محاسبه سهم مالیات از درآمدهای جاری.' },
  { id: 3, title: 'سبد دارایی', icon: PieChart, category: 'مالی', color: '#3b82f6', desc: 'تحلیل توزیع ریسک در دارایی‌های شما.' },
  { id: 4, title: 'هدف‌گذاری', icon: Target, category: 'شخصی', color: '#ef4444', desc: 'برنامه‌ریزی برای اهداف کوتاه و بلند مدت.' },
  { id: 5, title: 'توسعه فردی', icon: User, category: 'شخصی', color: '#a855f7', desc: 'تخمین زمان مورد نیاز برای یادگیری مهارت جدید.' },
  { id: 6, title: 'تورم‌سنج', icon: TrendingUp, category: 'اقتصاد', color: '#f97316', desc: 'ارزیابی ارزش پول در سال‌های آینده.' },
  { id: 7, title: 'شاخص بازار', icon: BarChart3, category: 'اقتصاد', color: '#06b6d4', desc: 'بررسی روندهای کلان بازارهای موازی.' },
  { id: 8, title: 'وام و اقساط', icon: Landmark, category: 'بانکی', color: '#8b5cf6', desc: 'محاسبه شفاف سود و اقساط ماهانه وام.' },
  { id: 9, title: 'کارت اعتباری', icon: CreditCard, category: 'بانکی', color: '#ec4899', desc: 'مدیریت هزینه‌ها و تسویه اعتبارات.' },
  { id: 10, title: 'فریلنسری', icon: Briefcase, category: 'کار', color: '#f43f5e', desc: 'محاسبه نرخ ساعت کاری مفید و منصفانه.' },
  { id: 11, title: 'بازگشت سرمایه', icon: Activity, category: 'بیزنس', color: '#10b981', desc: 'آنالیز ROI برای پروژه‌های تجاری.' },
  { id: 12, title: 'سود بورس', icon: TrendingUp, category: 'بیزنس', color: '#22c55e', desc: 'تخمین رشد دارایی در بازار سهام.' },
  { id: 13, title: 'پورتفوی کریپتو', icon: Coins, category: 'کریپتو', color: '#eab308', desc: 'رصد لحظه‌ای سود و ضرر ارزهای دیجیتال.' },
  { id: 14, title: 'استخراج', icon: Cpu, category: 'کریپتو', color: '#64748b', desc: 'محاسبه به صرفه بودن استخراج ارز.' },
  { id: 15, title: 'حباب طلا', icon: Gem, category: 'سرمایه', color: '#fbbf24', desc: 'تحلیل قیمت واقعی در برابر قیمت بازار.' },
  { id: 16, title: 'بیمه عمر', icon: Umbrella, category: 'شخصی', color: '#0ea5e9', desc: 'برآورد پوشش‌های بیمه‌ای و سرمایه‌گذاری.' },
  { id: 17, title: 'هزینه سفر', icon: Globe, category: 'شخصی', color: '#2dd4bf', desc: 'بودجه‌بندی هوشمند برای سفرهای خارجی.' },
  { id: 18, title: 'قدرت خرید', icon: ShoppingCart, category: 'اقتصاد', color: '#84cc16', desc: 'مقایسه قدرت خرید شما در دهه‌های مختلف.' },
];

const CATEGORIES: Record<string, { title: string; desc: string }> = {
  'همه': { title: 'منظومه محاسباتی تخمینو', desc: 'دقت در هر عدد، وضوح در هر تصمیم. ۱۸ ابزار هوشمند برای آینده مالی شما.' },
  'مالی': { title: 'مدیریت سرمایه و دارایی', desc: 'تحلیل عمیق جریان نقدینگی، مالیات و مالکیت مسکن.' },
  'شخصی': { title: 'برنامه‌ریزی سبک زندگی', desc: 'از اهداف توسعه فردی تا بودجه‌بندی سفرهای پیش رو.' },
  'اقتصاد': { title: 'تحلیل متغیرهای کلان', desc: 'درک اثرات تورم و نوسانات قدرت خرید بر دارایی‌ها.' },
  'کریپتو': { title: 'پلتفرم دارایی‌های دیجیتال', desc: 'رصد دقیق سود و ضرر در بازارهای نوین بلاکچین.' },
};

function OrbitRing({ radius }: { radius: number }) {
  return <div className="orbit-path" style={{ width: radius * 2, height: radius * 2 }} />;
}

export default function Page() {
  const [activeCategory, setActiveCategory] = useState('همه');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const touch =
      (typeof window !== 'undefined') &&
      (window.matchMedia?.('(hover: none)').matches || navigator.maxTouchPoints > 0);
    setIsTouch(!!touch);
  }, []);

  // Performance mode on touch devices
  const perf = isTouch;

  // Fit orbit to viewport
  const orbitWrapRef = useRef<HTMLDivElement | null>(null);
  const [orbitBox, setOrbitBox] = useState({ w: 360, h: 360 });
  const [orbitSize, setOrbitSize] = useState(360);

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const header = vw >= 1024 ? 96 : 76;
      const footer = vw >= 1024 ? 84 : 76;
      const safe = 24;

      const availableH = Math.max(260, vh - header - footer - safe);
      const maxByW = vw >= 1024 ? Math.min(880, Math.floor(vw * 0.48)) : Math.min(520, Math.floor(vw - 32));

      setOrbitSize(Math.floor(Math.min(availableH, maxByW)));
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    const el = orbitWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setOrbitBox({ w: r.width, h: r.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Rotation: MotionValue (no rerender)
  const rot = useMotionValue(0);
  const rotNeg = useTransform(rot, (v) => -v);

  const pauseRef = useRef(false);
  useEffect(() => {
    pauseRef.current = !isTouch && !!hoveredTool;
  }, [hoveredTool, isTouch]);

  // ✅ موبایل: سرعت + فیلتر delta برای حذف stutter
  const speedRef = useRef(0.02);
  useEffect(() => {
    speedRef.current = isTouch ? 0.026 : 0.02;
  }, [isTouch]);

  // Pause when tab hidden (prevents weird jumps)
  const hiddenRef = useRef(false);
  useEffect(() => {
    const onVis = () => { hiddenRef.current = document.hidden; };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useAnimationFrame((_, delta) => {
    if (hiddenRef.current) return;
    if (pauseRef.current) return;

    // clamp delta: وقتی موبایل drop frame می‌دهد، delta بزرگ می‌شود و حس "استپ" می‌دهد
    const d = Math.min(delta, 24); // max ~24ms (حدود 40fps) برای نرم‌تر شدن
    rot.set((rot.get() + d * speedRef.current) % 360);
  });

  const ORBIT_RADII = useMemo(() => {
    const base = Math.min(orbitBox.w, orbitBox.h);
    const r1 = base * 0.24;
    const r2 = base * 0.37;
    const r3 = base * 0.50;
    return [Math.round(r1), Math.round(r2), Math.round(r3)];
  }, [orbitBox]);

  const ORBIT_CAPS = [3, 6, 9] as const;

  const orbitalMapping = useMemo(() => {
    let toolIdx = 0;
    const mapping: Record<number, Tool[]> = { 0: [], 1: [], 2: [] };

    const sorted = [...TOOLS].sort((a, b) => {
      if (activeCategory === 'همه') return 0;
      const aIn = a.category === activeCategory ? 0 : 1;
      const bIn = b.category === activeCategory ? 0 : 1;
      return aIn - bIn;
    });

    ORBIT_CAPS.forEach((cap, orbitIdx) => {
      for (let i = 0; i < cap; i++) {
        if (sorted[toolIdx]) mapping[orbitIdx].push(sorted[toolIdx++]);
      }
    });

    return mapping;
  }, [activeCategory]);

  const currentTool = useMemo(() => {
    const q = searchQuery.trim();
    if (q) return TOOLS.find((t) => t.title.includes(q)) || selectedTool || hoveredTool;
    return selectedTool || hoveredTool;
  }, [searchQuery, hoveredTool, selectedTool]);

  // click outside to clear selection
  useEffect(() => {
    if (!selectedTool) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = orbitWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setSelectedTool(null);
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, [selectedTool]);

  // Transitions: ساده‌تر روی موبایل
  const textTransition = perf
    ? { duration: 0.28, ease: 'easeOut' as const }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any };

  const chipTransition = perf
    ? { duration: 0.22, ease: 'easeOut' as const }
    : { type: 'spring' as const, stiffness: 340, damping: 24 };

  return (
    <div
      className={[
        'h-[100svh] overflow-hidden transition-colors duration-700',
        isDarkMode ? 'dark bg-[#050505] text-white' : 'bg-[#F9FAFB] text-slate-900',
        perf ? 'perf' : '',
      ].join(' ')}
      dir="rtl"
    >
      <style>{STYLES}</style>

      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle at center, rgba(59,130,246,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
      />

      <header className="fixed top-0 w-full px-4 md:px-10 py-4 md:py-6 flex justify-between items-center z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 dark:bg-blue-900 flex items-center justify-center rounded-full shadow-lg border border-blue-500/20">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div className="font-logo text-lg md:text-2xl tracking-tighter" dir="ltr">
            <span className={isDarkMode ? 'text-white/30' : 'text-slate-400'}>TAKH</span>
            <span className="font-black text-blue-600 dark:text-blue-500">MINO</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2 p-1 glass rounded-full px-4">
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[11px] font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 dark:bg-blue-900 text-white'
                  : 'opacity-40 hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              type="button"
            >
              {cat}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setIsDarkMode((v) => !v)}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center glass active:scale-95"
          type="button"
          aria-label="toggle theme"
        >
          {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px] text-slate-600" />}
        </button>
      </header>

      <main className="relative h-full grid lg:grid-cols-2 px-4 md:px-10 lg:px-24 pt-20 md:pt-24 pb-20">
        <section className="order-1 lg:order-2 flex items-center justify-center">
          <div
            ref={orbitWrapRef}
            className="relative flex items-center justify-center touch-none select-none"
            style={{ width: orbitSize, height: orbitSize }}
          >
            <div className="relative z-50 floating">
              <div
                className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center relative glass ${
                  isDarkMode ? (perf ? '' : 'shadow-[0_0_28px_rgba(59,130,246,0.12)]') : (perf ? '' : 'shadow-xl shadow-blue-100')
                }`}
                onClick={() => setSelectedTool(null)}
              >
                <AnimatePresence mode="wait">
                  {currentTool ? (
                    <motion.div
                      key={currentTool.id}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={textTransition}
                      style={{ color: currentTool.color }}
                    >
                      <currentTool.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                    </motion.div>
                  ) : (
                    <motion.div key="logo" className="flex flex-col items-center" transition={textTransition}>
                      <Sparkles className="text-blue-500 mb-0.5 w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-logo font-black text-xs md:text-sm tracking-tighter">
                        T<span className="text-blue-500">M</span>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 scale-110" />
              </div>
            </div>

            {ORBIT_RADII.map((r) => (
              <OrbitRing key={r} radius={r} />
            ))}

            <motion.div className="absolute inset-0 will-gpu" style={{ rotate: rot }}>
              {/* ✅ LayoutGroup و layout حذف شدند برای موبایل نرم‌تر */}
              {[0, 1, 2].map((orbitIdx) => {
                const radius = ORBIT_RADII[orbitIdx];
                const cap = [3, 6, 9][orbitIdx];
                const tools = orbitalMapping[orbitIdx] || [];

                return tools.map((tool, idx) => {
                  const angle = (360 / cap) * idx;
                  const isFocused = currentTool?.id === tool.id;
                  const isDimmed = activeCategory !== 'همه' && tool.category !== activeCategory;

                  return (
                    <div
                      key={tool.id}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`,
                      }}
                      onMouseEnter={() => {
                        if (!isTouch) setHoveredTool(tool);
                      }}
                      onMouseLeave={() => {
                        if (!isTouch) setHoveredTool(null);
                      }}
                      onClick={() => {
                        if (!isTouch) return;
                        setSelectedTool((prev) => (prev?.id === tool.id ? null : tool));
                      }}
                    >
                      <motion.div className="will-gpu" style={{ rotate: rotNeg }}>
                        <motion.div
                          animate={{
                            scale: isFocused ? 1.28 : isDimmed ? 0.7 : 1,
                            opacity: isDimmed ? 0.16 : 1,
                          }}
                          transition={chipTransition}
                          className={`rounded-full flex items-center justify-center border transition-colors duration-300 ${
                            isFocused ? 'bg-white z-50' : 'glass'
                          } w-10 h-10 md:w-16 md:h-16 cursor-pointer will-gpu`}
                          style={{
                            borderColor: isFocused ? tool.color : 'rgba(59,130,246,0.12)',
                            // ✅ موبایل: shadow/blur حذف برای روانی
                            boxShadow: perf ? 'none' : (isFocused ? `0 0 22px ${tool.color}55` : 'none'),
                          }}
                        >
                          <div style={{ color: tool.color }}>
                            <tool.icon className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" strokeWidth={isFocused ? 2.4 : 1.5} />
                          </div>

                          {!perf && isFocused && (
                            <motion.div
                              className="absolute inset-[-10px] rounded-full blur-xl opacity-25"
                              style={{ backgroundColor: tool.color }}
                            />
                          )}
                        </motion.div>
                      </motion.div>
                    </div>
                  );
                });
              })}
            </motion.div>
          </div>
        </section>

        <section className="order-2 lg:order-1 flex items-center justify-center lg:justify-start mt-2 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={textTransition}
            className="max-w-xl text-center lg:text-right w-full"
          >
            <div className="flex items-center gap-3 p-2 md:p-3 glass rounded-full mb-5 md:mb-8 focus-within:border-blue-500/50 w-fit min-w-[150px] max-w-[220px] mx-auto lg:mx-0">
              <Search className="text-blue-500 shrink-0 w-[14px] h-[14px] md:w-4 md:h-4" />
              <input
                type="text"
                placeholder="جستجو..."
                className="bg-transparent border-none outline-none w-full font-bold text-xs md:text-sm placeholder:opacity-40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTool?.id || activeCategory}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={textTransition}
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-blue-600 dark:text-blue-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-black text-[9px] tracking-[0.3em] uppercase opacity-80">
                    {currentTool ? currentTool.category : 'دسترسی سریع'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-5 leading-tight tracking-tighter">
                  {currentTool ? currentTool.title : CATEGORIES[activeCategory]?.title}
                </h1>

                <p className={`text-sm md:text-lg lg:text-xl font-light leading-relaxed mb-5 md:mb-7 max-w-md mx-auto lg:mx-0 ${isDarkMode ? 'opacity-50' : 'opacity-70 text-slate-600'}`}>
                  {currentTool ? currentTool.desc : CATEGORIES[activeCategory]?.desc}
                </p>

                <button
                  className="mx-auto lg:mx-0 group relative px-8 py-4 md:px-10 md:py-5 bg-blue-600 dark:bg-blue-900 text-white rounded-full font-black text-[10px] md:text-xs flex items-center gap-3 overflow-hidden shadow-2xl transition-all active:scale-95"
                  type="button"
                >
                  <span className="relative">شروع محاسبات</span>
                  <ChevronLeft className="w-4 h-4 md:w-[18px] md:h-[18px] relative group-hover:-translate-x-2 transition-transform" />
                </button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      <footer className="fixed bottom-0 w-full p-4 md:p-8 flex justify-between items-end pointer-events-none z-[100]">
        <div className="glass p-3 md:p-4 rounded-[1.2rem] border-blue-500/10 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-logo font-black text-[9px] tracking-widest opacity-40 uppercase">System: Operational</span>
          </div>
          <p className="text-[8px] opacity-20 tracking-tighter uppercase font-mono">
            Build v3.2.5 // Mobile_Perf_Mode
          </p>
        </div>
      </footer>
    </div>
  );
}
