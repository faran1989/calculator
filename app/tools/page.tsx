'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import type { Transition } from 'framer-motion';
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
  ShoppingCart,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Umbrella,
  User,
  Flame,
  Zap,
  RotateCcw,
  X,
  Banknote,
  BriefcaseBusiness,
  Menu,
  ChevronDown,
} from 'lucide-react';

// --- Global Styles (page-local) ---
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;800;900&family=Noto+Sans+Arabic:wght@300;400;600;700;800;900&family=Outfit:wght@400;700;900&display=swap');

  :root{
    --accent:#2563eb;

    /* ترکیب فونت: Vazirmatn + Yekan (لوکال) + Noto Sans Arabic */
    --font-body: "IRANYekan","Yekan","Vazirmatn","Noto Sans Arabic","Segoe UI",Tahoma,Arial,sans-serif;
    --font-head: "Vazirmatn","IRANYekan","Yekan","Noto Sans Arabic","Segoe UI",Tahoma,Arial,sans-serif;
    --font-logo: "Outfit","Segoe UI",Tahoma,Arial,sans-serif;
  }

  html, body { font-family: var(--font-body); }
  h1,h2,h3 { font-family: var(--font-head); letter-spacing: -0.02em; }
  .font-logo { font-family: var(--font-logo); }

  /* Desktop glass (lux) */
  .glass{
    background: rgba(255,255,255,0.42);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.32);
    transition: all .35s cubic-bezier(.4,0,.2,1);
  }
  .dark .glass{
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.10);
  }

  /* Mobile performance glass (no backdrop-filter) */
  .perf .glass{
    backdrop-filter:none !important;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(15,23,42,0.06);
  }
  .perf.dark .glass{
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
  }

  /* Orbit lines */
  .orbit-path{
    border: 1px solid rgba(37,99,235,0.12);
    pointer-events:none;
    position:absolute;
    border-radius:9999px;
  }
  .dark .orbit-path{ border: 1px solid rgba(37,99,235,0.06); }

  @keyframes float{
    0%,100%{ transform: translateY(0px); }
    50%{ transform: translateY(-6px); }
  }
  .floating{ animation: float 6s infinite ease-in-out; }

  html,body{ overscroll-behavior-y:none; }
  .will-gpu{ transform: translateZ(0); will-change: transform; }

  /* Cards */
  .tool-card{
    border-radius: 24px;
    overflow:hidden;
    transition: transform .2s ease;
  }
  .tool-card:hover{ transform: translateY(-2px); }

  /* Glass Menu (Header + Filters) */
  .glass-menu{
    background: rgba(255,255,255,0.60);
    border: 1px solid rgba(15,23,42,0.06);
    backdrop-filter: blur(18px);
    box-shadow:
      0 20px 60px rgba(15,23,42,0.08),
      0 2px 10px rgba(15,23,42,0.04);
  }
  .dark .glass-menu{
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow:
      0 18px 55px rgba(0,0,0,0.55),
      0 2px 10px rgba(0,0,0,0.35);
  }
  .perf .glass-menu{ backdrop-filter:none !important; }

  .menu-item{
    border-radius: 9999px;
    transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease, opacity .18s ease;
    will-change: transform;
  }
  .menu-item:hover{
    transform: translateY(-1px);
    opacity:1;
    background: rgba(37,99,235,0.08);
    box-shadow: 0 10px 24px rgba(37,99,235,0.12);
  }
  .dark .menu-item:hover{
    background: rgba(255,255,255,0.06);
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }
  .menu-item--active{
    background: var(--accent);
    color:#fff;
    box-shadow: 0 16px 40px rgba(37,99,235,0.26);
  }

  /* Chips (categories) */
  .chip{
    border-radius: 9999px;
    transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease, opacity .18s ease;
    will-change: transform;
    display:inline-flex;
    align-items:center;
    gap:10px;

    min-width: 86px;
    justify-content: center;
  }
  .chip:hover{ transform: translateY(-1px); opacity:1; }
  .chip--inactive{ color: rgba(15,23,42,0.62); }
  .dark .chip--inactive{ color: rgba(255,255,255,0.62); }
  .chip--inactive:hover{
    background: rgba(37,99,235,0.08);
    box-shadow: 0 10px 24px rgba(37,99,235,0.12);
  }
  .dark .chip--inactive:hover{
    background: rgba(255,255,255,0.06);
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }
  .chip--active{
    background: var(--accent);
    color:#fff;
    box-shadow: 0 16px 40px rgba(37,99,235,0.26);
  }

  /* Icon bubble inside chips */
  .chip-ico{
    width: 28px;
    height: 28px;
    border-radius: 9999px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex: 0 0 auto;
    box-shadow: 0 10px 24px rgba(15,23,42,0.06);
  }
  .dark .chip-ico{
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }

  /* Quick filters (right side) + Plate */
  .plate{
    background: rgba(15,23,42,0.03);
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 9999px;
    padding: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
  }
  .dark .plate{
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
  }

  .qchip{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding: 10px 14px;
    border-radius: 9999px;
    transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease, opacity .18s ease;
    will-change: transform;
    font-weight: 900;
    white-space: nowrap;
  }
  .qchip:hover{
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(15,23,42,0.08);
  }
  .dark .qchip:hover{
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }

  .qchip--inactive{
    color: rgba(15,23,42,0.70);
    background: transparent;
    opacity: .95;
  }
  .dark .qchip--inactive{ color: rgba(255,255,255,0.70); }

  .qchip--active{
    background: rgba(37,99,235,0.12);
    color: rgba(37,99,235,1);
    box-shadow: 0 16px 40px rgba(37,99,235,0.16);
  }
  .dark .qchip--active{
    background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.92);
    box-shadow: 0 16px 40px rgba(0,0,0,0.30);
  }

  /* Tiny colored icon bubble in quick chips */
  .qico{
    width: 26px;
    height: 26px;
    border-radius: 9999px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex: 0 0 auto;
  }

  /* Clear filters button */
  .clearbtn{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding: 10px 12px;
    border-radius: 9999px;
    font-weight: 900;
    transition: transform .18s ease, background .18s ease, box-shadow .18s ease, opacity .18s ease;
    white-space: nowrap;
  }
  .clearbtn:hover{
    transform: translateY(-1px);
    background: rgba(15,23,42,0.04);
    box-shadow: 0 10px 24px rgba(15,23,42,0.06);
  }
  .dark .clearbtn:hover{
    background: rgba(255,255,255,0.06);
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }

  /* Divider between plate and categories */
  .divider{
    width: 1px;
    height: 34px;
    background: rgba(15,23,42,0.10);
    margin: 0 6px;
    border-radius: 9999px;
    flex: 0 0 auto;
  }
  .dark .divider{ background: rgba(255,255,255,0.14); }

  .no-scrollbar::-webkit-scrollbar{ display:none; }
  .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }

  /* Cards container */
  .cards-wrap{ width: min(80vw, 1600px); }
  @media (max-width: 1024px){
    .cards-wrap{ width: 100%; }
  }
`;

type Tool = {
  id: number;
  title: string;
  icon: LucideIcon;
  category: string;
  color: string;
  desc: string;
  popular?: boolean;
  useful?: boolean;
  createdAt: string; // YYYY-MM-DD
};

const TOOLS: Tool[] = [
  { id: 1, title: 'خرید خانه', icon: Home, category: 'مالی', color: '#10b981', desc: 'تخمین زمان مالکیت ملک بر اساس قدرت خرید.', popular: true, useful: true, createdAt: '2026-02-01' },
  { id: 2, title: 'مالیات درآمد', icon: Percent, category: 'مالی', color: '#f59e0b', desc: 'محاسبه سهم مالیات از درآمدهای جاری.', useful: true, createdAt: '2025-12-10' },
  { id: 3, title: 'سبد دارایی', icon: PieChart, category: 'مالی', color: '#3b82f6', desc: 'تحلیل توزیع ریسک در دارایی‌های شما.', popular: true, createdAt: '2025-11-05' },
  { id: 4, title: 'هدف‌گذاری', icon: Target, category: 'شخصی', color: '#ef4444', desc: 'برنامه‌ریزی برای اهداف کوتاه و بلند مدت.', useful: true, createdAt: '2026-01-20' },
  { id: 5, title: 'توسعه فردی', icon: User, category: 'شخصی', color: '#a855f7', desc: 'تخمین زمان مورد نیاز برای یادگیری مهارت جدید.', createdAt: '2025-10-01' },
  { id: 6, title: 'تورم‌سنج', icon: TrendingUp, category: 'اقتصاد', color: '#f97316', desc: 'ارزیابی ارزش پول در سال‌های آینده.', popular: true, useful: true, createdAt: '2026-02-05' },
  { id: 7, title: 'شاخص بازار', icon: BarChart3, category: 'اقتصاد', color: '#06b6d4', desc: 'بررسی روندهای کلان بازارهای موازی.', createdAt: '2025-09-15' },
  { id: 8, title: 'وام و اقساط', icon: Landmark, category: 'بانکی', color: '#8b5cf6', desc: 'محاسبه شفاف سود و اقساط ماهانه وام.', popular: true, useful: true, createdAt: '2025-12-25' },
  { id: 9, title: 'کارت اعتباری', icon: CreditCard, category: 'بانکی', color: '#ec4899', desc: 'مدیریت هزینه‌ها و تسویه اعتبارات.', createdAt: '2025-08-20' },
  { id: 10, title: 'فریلنسری', icon: Briefcase, category: 'کار', color: '#f43f5e', desc: 'محاسبه نرخ ساعت کاری مفید و منصفانه.', useful: true, createdAt: '2026-01-10' },
  { id: 11, title: 'بازگشت سرمایه', icon: Activity, category: 'بیزنس', color: '#10b981', desc: 'آنالیز ROI برای پروژه‌های تجاری.', popular: true, createdAt: '2025-11-18' },
  { id: 12, title: 'سود بورس', icon: TrendingUp, category: 'بیزنس', color: '#22c55e', desc: 'تخمین رشد دارایی در بازار سهام.', createdAt: '2025-07-01' },
  { id: 13, title: 'پورتفوی کریپتو', icon: Coins, category: 'کریپتو', color: '#eab308', desc: 'رصد لحظه‌ای سود و ضرر ارزهای دیجیتال.', popular: true, createdAt: '2026-02-08' },
  { id: 14, title: 'استخراج', icon: Cpu, category: 'کریپتو', color: '#64748b', desc: 'محاسبه به صرفه بودن استخراج ارز.', createdAt: '2025-06-15' },
  { id: 15, title: 'حباب طلا', icon: Gem, category: 'سرمایه', color: '#fbbf24', desc: 'تحلیل قیمت واقعی در برابر قیمت بازار.', popular: true, useful: true, createdAt: '2026-01-28' },
  { id: 16, title: 'بیمه عمر', icon: Umbrella, category: 'شخصی', color: '#0ea5e9', desc: 'برآورد پوشش‌های بیمه‌ای و سرمایه‌گذاری.', createdAt: '2025-05-20' },
  { id: 17, title: 'هزینه سفر', icon: Globe, category: 'شخصی', color: '#2dd4bf', desc: 'بودجه‌بندی هوشمند برای سفرهای خارجی.', useful: true, createdAt: '2026-02-03' },
  { id: 18, title: 'قدرت خرید', icon: ShoppingCart, category: 'اقتصاد', color: '#84cc16', desc: 'مقایسه قدرت خرید شما در دهه‌های مختلف.', popular: true, createdAt: '2025-04-02' },
];

const TOP_MENU = [
  { key: 'home', label: 'صفحه اصلی', href: '/' },
  { key: 'tools', label: 'ابزارها', href: '/tools' },
  { key: 'pricing', label: 'تعرفه‌ها', href: '/pricing' },
  { key: 'blog', label: 'بلاگ', href: '/blog' },
  { key: 'about', label: 'درباره ما', href: '/about' },
] as const;

const CATEGORY_ORDER = ['همه', 'مالی', 'شخصی', 'اقتصاد', 'کریپتو', 'سرمایه', 'بانکی', 'کار', 'بیزنس'] as const;

const ORBIT_CAPS = [3, 6, 9] as const;
const ORBIT_IDX = [0, 1, 2] as const;

function OrbitRing({ radius }: { radius: number }) {
  return <div className="orbit-path" style={{ width: radius * 2, height: radius * 2 }} />;
}

type QuickFilter = 'none' | 'popular' | 'useful' | 'newest';

function matchFilter(tool: Tool, category: string, quick: QuickFilter) {
  const byCat = category === 'همه' ? true : tool.category === category;

  let byQuick = true;
  if (quick === 'popular') byQuick = !!tool.popular;
  if (quick === 'useful') byQuick = !!tool.useful;
  if (quick === 'newest') byQuick = true;
  return byCat && byQuick;
}

function toTime(s: string) {
  const t = Date.parse(s + 'T00:00:00Z');
  return Number.isFinite(t) ? t : 0;
}

const categoryMeta: Record<string, { icon: LucideIcon; fg: string; bg: string }> = {
  همه: { icon: Sparkles, fg: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  مالی: { icon: Banknote, fg: '#10b981', bg: 'rgba(16,185,129,0.14)' },
  شخصی: { icon: User, fg: '#a855f7', bg: 'rgba(168,85,247,0.14)' },
  اقتصاد: { icon: TrendingUp, fg: '#f97316', bg: 'rgba(249,115,22,0.14)' },
  کریپتو: { icon: Coins, fg: '#eab308', bg: 'rgba(234,179,8,0.16)' },
  سرمایه: { icon: Gem, fg: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  بانکی: { icon: Landmark, fg: '#8b5cf6', bg: 'rgba(139,92,246,0.14)' },
  کار: { icon: Briefcase, fg: '#f43f5e', bg: 'rgba(244,63,94,0.14)' },
  بیزنس: { icon: BriefcaseBusiness, fg: '#22c55e', bg: 'rgba(34,197,94,0.14)' },
};

function QuickButton({
  label,
  icon: Icon,
  active,
  onClick,
  fg,
  bg,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  fg: string;
  bg: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['qchip text-[12px] md:text-xs', active ? 'qchip--active' : 'qchip--inactive'].join(' ')}
      style={active ? undefined : { background: 'transparent' }}
    >
      <span className="qico" style={{ background: bg, color: fg }}>
        <Icon className="w-[16px] h-[16px]" strokeWidth={2.2} />
      </span>
      <span>{label}</span>
    </button>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="clearbtn text-[12px] md:text-xs opacity-90">
      <span className="qico" style={{ background: 'rgba(15,23,42,0.06)', color: 'rgba(15,23,42,0.70)' }}>
        <RotateCcw className="w-[15px] h-[15px]" strokeWidth={2.2} />
      </span>
      <span>پاکسازی</span>
      <X className="w-[14px] h-[14px] opacity-60" strokeWidth={2.4} />
    </button>
  );
}

function CategoryDropdown({
  category,
  setCategory,
  isDarkMode,
}: {
  category: string;
  setCategory: (v: string) => void;
  isDarkMode: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const meta = categoryMeta[category] || categoryMeta['همه'];
  const Icon = meta.icon;

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass-menu w-full rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: meta.bg, color: meta.fg }}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </span>
          <div className="text-[12px] font-black">{category}</div>
        </div>
        <ChevronDown className={['w-4 h-4 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-[80] mt-2 w-full glass-menu rounded-2xl p-2"
            style={{
              // ✅ کمی رنگ ملایم‌تر برای جلوگیری از قاطی شدن با کارت زیرش
              background: isDarkMode ? 'rgba(10,10,10,0.72)' : 'rgba(255,255,255,0.92)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.07)',
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_ORDER.map((it) => {
                const active = it === category;
                const m = categoryMeta[it] || categoryMeta['همه'];
                const Ico = m.icon;
                return (
                  <button
                    key={it}
                    type="button"
                    onClick={() => {
                      setCategory(it);
                      setOpen(false);
                    }}
                    className={[
                      'rounded-2xl px-3 py-3 flex items-center gap-2 font-black text-[12px] transition active:scale-[0.99]',
                      active
                        ? 'text-white'
                        : isDarkMode
                          ? 'text-white/85 hover:text-white'
                          : 'text-slate-700 hover:text-slate-900',
                    ].join(' ')}
                    style={{
                      background: active ? 'var(--accent)' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.03)',
                      border: active ? '1px solid rgba(255,255,255,0.22)' : isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.06)',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: active ? 'rgba(255,255,255,0.22)' : m.bg, color: active ? '#fff' : m.fg }}
                    >
                      <Ico className="w-[16px] h-[16px]" strokeWidth={2.2} />
                    </span>
                    <span>{it}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ✅ CardFilterBar:
 * - دسکتاپ: Plate + پاکسازی + چیپ‌ها
 * - موبایل: بک‌گراند مشترک حذف شده → Plate و Dropdown هرکدام مستقل
 */
function CardFilterBar({
  category,
  setCategory,
  quick,
  setQuick,
  onClear,
  showClear,
  isMobile,
  isDarkMode,
}: {
  category: string;
  setCategory: (v: string) => void;
  quick: QuickFilter;
  setQuick: (v: QuickFilter) => void;
  onClear: () => void;
  showClear: boolean;
  isMobile: boolean;
  isDarkMode: boolean;
}) {
  const catRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className={
        isMobile
          ? 'w-full' // ✅ بک‌گراند مستطیلی حذف شد
          : 'glass-menu rounded-full px-2 py-2 inline-flex items-center'
      }
      style={{ maxWidth: '100%' }}
    >
      {isMobile ? (
        <div className="flex flex-col gap-3">
          {/* Plate وسط‌چین */}
          <div className="w-full flex items-center justify-center gap-2 flex-wrap">
            <div className="plate">
              <QuickButton
                label="محبوب‌ترین"
                icon={Flame}
                active={quick === 'popular'}
                onClick={() => setQuick(quick === 'popular' ? 'none' : 'popular')}
                fg="#0ea5e9"
                bg="rgba(14,165,233,0.16)"
              />
              <QuickButton
                label="پرکاربرد"
                icon={Zap}
                active={quick === 'useful'}
                onClick={() => setQuick(quick === 'useful' ? 'none' : 'useful')}
                fg="#10b981"
                bg="rgba(16,185,129,0.16)"
              />
              <QuickButton
                label="جدیدترین"
                icon={Sparkles}
                active={quick === 'newest'}
                onClick={() => setQuick(quick === 'newest' ? 'none' : 'newest')}
                fg="#a855f7"
                bg="rgba(168,85,247,0.16)"
              />
            </div>

            {showClear && <ClearButton onClick={onClear} />}
          </div>

          {/* Dropdown دسته‌ها */}
          <CategoryDropdown category={category} setCategory={setCategory} isDarkMode={isDarkMode} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Plate */}
          <div className="plate">
            <QuickButton
              label="محبوب‌ترین"
              icon={Flame}
              active={quick === 'popular'}
              onClick={() => setQuick(quick === 'popular' ? 'none' : 'popular')}
              fg="#0ea5e9"
              bg="rgba(14,165,233,0.16)"
            />
            <QuickButton
              label="پرکاربرد"
              icon={Zap}
              active={quick === 'useful'}
              onClick={() => setQuick(quick === 'useful' ? 'none' : 'useful')}
              fg="#10b981"
              bg="rgba(16,185,129,0.16)"
            />
            <QuickButton
              label="جدیدترین"
              icon={Sparkles}
              active={quick === 'newest'}
              onClick={() => setQuick(quick === 'newest' ? 'none' : 'newest')}
              fg="#a855f7"
              bg="rgba(168,85,247,0.16)"
            />
          </div>

          {/* پاکسازی */}
          {showClear && (
            <>
              <div className="divider" />
              <ClearButton onClick={onClear} />
            </>
          )}

          <div className="divider" />

          {/* دسته‌ها: padding برای جلوگیری از clip شدن چیپ آخر */}
          <div style={{ maxWidth: 'min(62vw, 820px)' }}>
            <div
              ref={catRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-1"
              style={{ maxWidth: '100%' }}
            >
              {CATEGORY_ORDER.map((it) => {
                const active = category === it;
                const meta = categoryMeta[it] || categoryMeta['همه'];
                const Icon = meta.icon;

                return (
                  <button
                    key={it}
                    type="button"
                    onClick={() => setCategory(it)}
                    className={[
                      'chip px-4 py-2 text-[12px] md:text-xs font-black whitespace-nowrap',
                      active ? 'chip--active' : 'chip--inactive opacity-90',
                    ].join(' ')}
                  >
                    <span
                      className="chip-ico"
                      style={{
                        background: active ? 'rgba(255,255,255,0.22)' : meta.bg,
                        color: active ? '#fff' : meta.fg,
                      }}
                    >
                      <Icon className="w-[16px] h-[16px]" strokeWidth={2.2} />
                    </span>
                    <span>{it}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [activeTop, setActiveTop] = useState<(typeof TOP_MENU)[number]['key']>('tools');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [cardCategory, setCardCategory] = useState<string>('همه');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');

  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const touch =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(hover: none)').matches || navigator.maxTouchPoints > 0);
    setIsTouch(!!touch);
  }, []);

  const perf = isTouch;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const compute = () => setIsMobile(window.innerWidth < 640);
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // ✅ تعداد کارت‌ها طبق خواسته
  const MIN_MOBILE = 3;
  const STEP_MOBILE = 2;
  const MIN_DESKTOP = 8;
  const STEP_DESKTOP = 4;

  const [visibleCount, setVisibleCount] = useState<number>(MIN_DESKTOP);
  useEffect(() => {
    setVisibleCount(isMobile ? MIN_MOBILE : MIN_DESKTOP);
  }, [isMobile]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

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

  const rot = useMotionValue(0);
  const rotNeg = useTransform(rot, (v) => -v);

  const pauseRef = useRef(false);
  useEffect(() => {
    pauseRef.current = !isTouch && !!hoveredTool;
  }, [hoveredTool, isTouch]);

  const speedRef = useRef(0.02);
  useEffect(() => {
    speedRef.current = isTouch ? 0.026 : 0.02;
  }, [isTouch]);

  const hiddenRef = useRef(false);
  useEffect(() => {
    const onVis = () => {
      hiddenRef.current = document.hidden;
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useAnimationFrame((_, delta) => {
    if (hiddenRef.current) return;
    if (pauseRef.current) return;
    const d = Math.min(delta, 24);
    rot.set((rot.get() + d * speedRef.current) % 360);
  });

  const ORBIT_RADII = useMemo(() => {
    const base = Math.min(orbitBox.w, orbitBox.h);
    return [Math.round(base * 0.24), Math.round(base * 0.37), Math.round(base * 0.5)];
  }, [orbitBox]);

  const orbitalMapping = useMemo(() => {
    let toolIdx = 0;
    const mapping: Record<number, Tool[]> = { 0: [], 1: [], 2: [] };
    const sorted = [...TOOLS];

    ORBIT_CAPS.forEach((cap, orbitIdx) => {
      for (let i = 0; i < cap; i++) {
        if (sorted[toolIdx]) mapping[orbitIdx].push(sorted[toolIdx++]);
      }
    });

    return mapping;
  }, []);

  const currentTool = useMemo(() => selectedTool || hoveredTool, [hoveredTool, selectedTool]);

  const cardsFiltered = useMemo(() => {
    const base = TOOLS.filter((t) => matchFilter(t, cardCategory, quickFilter));
    if (quickFilter === 'newest') {
      return [...base].sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
    }
    return base;
  }, [cardCategory, quickFilter]);

  const cardsVisible = useMemo(() => {
    const count = Math.max(0, Math.min(cardsFiltered.length, visibleCount));
    return cardsFiltered.slice(0, count);
  }, [cardsFiltered, visibleCount]);

  useEffect(() => {
    setVisibleCount(isMobile ? MIN_MOBILE : MIN_DESKTOP);
  }, [cardCategory, quickFilter, isMobile]);

  const showClear = cardCategory !== 'همه' || quickFilter !== 'none';
  const clearFilters = () => {
    setCardCategory('همه');
    setQuickFilter('none');
  };

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

  const textTransition: Transition = perf
    ? { duration: 0.28, ease: 'easeOut' }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  const chipTransition: Transition = perf
    ? { duration: 0.22, ease: 'easeOut' }
    : { type: 'spring', stiffness: 340, damping: 24 };

  // ✅ warning رفع شد: canMore / canLess حذف شدند
  const minCount = isMobile ? MIN_MOBILE : MIN_DESKTOP;
  const step = isMobile ? STEP_MOBILE : STEP_DESKTOP;

  const onMore = () => setVisibleCount((v) => Math.min(cardsFiltered.length, v + step));
  const onLess = () => setVisibleCount((v) => Math.max(minCount, v - step));

  return (
    <div
      className={[
        'min-h-[100svh] overflow-x-hidden transition-colors duration-700',
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
            ? 'radial-gradient(circle at center, rgba(37,99,235,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(37,99,235,0.06) 0%, transparent 70%)',
        }}
      />

      {/* ---------------- Header (Sticky) ---------------- */}
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

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center">
          <div className="glass-menu rounded-full px-3 py-2">
            <div className="flex items-center gap-2">
              {TOP_MENU.map((item) => {
                const active = activeTop === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTop(item.key);
                    }}
                    className={[
                      'menu-item px-5 py-2 text-[12px] font-black',
                      active ? 'menu-item--active' : 'opacity-80',
                    ].join(' ')}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center glass active:scale-95"
            aria-label="open menu"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setIsDarkMode((v) => !v)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center glass active:scale-95"
            type="button"
            aria-label="toggle theme"
          >
            {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px] text-slate-600" />}
          </button>
        </div>
      </header>

      {/* ---------------- Mobile Menu (Centered modal) ---------------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[150] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              className="fixed z-[160] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,420px)]"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-menu rounded-[28px] p-3">
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="text-sm font-black">منو</div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-full glass flex items-center justify-center active:scale-95"
                    aria-label="close menu"
                  >
                    <X className="w-4 h-4" strokeWidth={2.4} />
                  </button>
                </div>

                <div className="flex flex-col gap-2 p-2">
                  {TOP_MENU.map((item) => {
                    const active = activeTop === item.key;
                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTop(item.key);
                          setMobileMenuOpen(false);
                        }}
                        className={[
                          'menu-item px-4 py-3 text-[12px] font-black',
                          active ? 'menu-item--active' : 'opacity-85',
                        ].join(' ')}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------------- Hero / Constellation ---------------- */}
      <main className="relative h-[100svh] overflow-hidden grid lg:grid-cols-2 px-4 md:px-10 lg:px-24 pt-20 md:pt-24 pb-24">
        <section className="order-1 lg:order-2 flex items-center justify-center">
          <div
            ref={orbitWrapRef}
            className="relative flex items-center justify-center touch-none select-none"
            style={{ width: orbitSize, height: orbitSize }}
          >
            <div className="relative z-50 floating">
              <div
                className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center relative glass ${
                  isDarkMode
                    ? perf
                      ? ''
                      : 'shadow-[0_0_28px_rgba(37,99,235,0.12)]'
                    : perf
                      ? ''
                      : 'shadow-xl shadow-blue-100'
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
              {ORBIT_IDX.map((orbitIdx) => {
                const radius = ORBIT_RADII[orbitIdx];
                const cap = ORBIT_CAPS[orbitIdx];
                const tools = orbitalMapping[orbitIdx] || [];

                return tools.map((tool, idx) => {
                  const angle = (360 / cap) * idx;
                  const isFocused = currentTool?.id === tool.id;

                  return (
                    <div
                      key={tool.id}
                      className="absolute left-1/2 top-1/2"
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)` }}
                      onMouseEnter={() => !isTouch && setHoveredTool(tool)}
                      onMouseLeave={() => !isTouch && setHoveredTool(null)}
                      onClick={() => {
                        if (!isTouch) return;
                        setSelectedTool((prev) => (prev?.id === tool.id ? null : tool));
                      }}
                    >
                      <motion.div className="will-gpu" style={{ rotate: rotNeg }}>
                        <motion.div
                          animate={{ scale: isFocused ? 1.28 : 1, opacity: 1 }}
                          transition={chipTransition}
                          className={`rounded-full flex items-center justify-center border transition-colors duration-300 ${
                            isFocused ? 'bg-white z-50' : 'glass'
                          } w-10 h-10 md:w-16 md:h-16 cursor-pointer will-gpu`}
                          style={{
                            borderColor: isFocused ? tool.color : 'rgba(37,99,235,0.12)',
                            boxShadow: perf ? 'none' : isFocused ? `0 0 22px ${tool.color}55` : 'none',
                          }}
                        >
                          <div style={{ color: tool.color }}>
                            <tool.icon className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" strokeWidth={isFocused ? 2.4 : 1.5} />
                          </div>
                          {!perf && isFocused && (
                            <motion.div className="absolute inset-[-10px] rounded-full blur-xl opacity-25" style={{ backgroundColor: tool.color }} />
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
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTool?.id || 'hero'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={textTransition}
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-blue-600 dark:text-blue-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-black text-[9px] tracking-[0.3em] uppercase opacity-80">
                    {currentTool ? currentTool.category : 'TOOLS'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-5 leading-tight tracking-tighter">
                  {currentTool ? currentTool.title : 'ابزارهای محاسباتی'}
                </h1>

                <p
                  className={`text-sm md:text-lg lg:text-xl font-light leading-relaxed mb-5 md:mb-7 max-w-md mx-auto lg:mx-0 ${
                    isDarkMode ? 'opacity-50' : 'opacity-70 text-slate-600'
                  }`}
                >
                  {currentTool ? currentTool.desc : 'فیلتر شیشه‌ای: دسته‌ها + محبوب‌ترین/پرکاربرد/جدیدترین + پاکسازی سریع.'}
                </p>

                <button
                  className="mx-auto lg:mx-0 group relative px-8 py-4 md:px-10 md:py-5 bg-blue-600 dark:bg-blue-900 text-white rounded-full font-black text-[10px] md:text-xs flex items-center gap-3 overflow-hidden shadow-2xl transition-all active:scale-95"
                  type="button"
                >
                  <span className="relative">شروع</span>
                  <ChevronLeft className="w-4 h-4 md:w-[18px] md:h-[18px] relative group-hover:-translate-x-2 transition-transform" />
                </button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      {/* ---------------- Cards list ---------------- */}
      <section className="relative px-4 md:px-8 lg:px-12 xl:px-14 2xl:px-16 pb-24">
        <div className="cards-wrap mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-2xl font-black tracking-tighter">ابزارهای محاسباتی</h2>
              <p className={isDarkMode ? 'text-xs md:text-sm opacity-40 mt-1' : 'text-xs md:text-sm text-slate-600 mt-1'}>
                از Plate سمت راست یا دسته‌بندی‌ها استفاده کن.
              </p>
            </div>

            <div className="text-[11px] md:text-xs font-bold px-3 py-2 rounded-full glass-menu whitespace-nowrap">
              نمایش {Math.min(cardsVisible.length, cardsFiltered.length)} از {cardsFiltered.length}
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <CardFilterBar
              category={cardCategory}
              setCategory={setCardCategory}
              quick={quickFilter}
              setQuick={setQuickFilter}
              onClear={clearFilters}
              showClear={showClear}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cardsVisible.map((tool) => (
              <div
                key={tool.id}
                className="tool-card glass p-6 md:p-7"
                style={{ minHeight: 'clamp(260px, 18vw, 330px)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: `${tool.color}22`, color: tool.color }}
                    >
                      <tool.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-4 font-black text-base md:text-lg tracking-tighter">{tool.title}</h3>
                    <p className={isDarkMode ? 'text-xs opacity-45 mt-1' : 'text-xs text-slate-600 mt-1'}>
                      {tool.category}
                      {tool.popular ? ' • محبوب' : ''}
                      {tool.useful ? ' • پرکاربرد' : ''}
                    </p>
                  </div>
                </div>

                <p className={isDarkMode ? 'text-xs md:text-sm opacity-55 mt-4 leading-relaxed' : 'text-xs md:text-sm text-slate-600 mt-4 leading-relaxed'}>
                  {tool.desc}
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-[11px] md:text-xs active:scale-[0.99] transition"
                  >
                    استفاده از ابزار
                  </button>
                  <button
                    type="button"
                    className={isDarkMode ? 'w-full text-[11px] md:text-xs font-bold opacity-50 hover:opacity-80 transition' : 'w-full text-[11px] md:text-xs font-bold text-slate-600 hover:text-slate-900 transition'}
                  >
                    راهنمایی کامل ابزار
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ More / Less buttons (both mobile & desktop) */}
          {(visibleCount < cardsFiltered.length || visibleCount > (isMobile ? MIN_MOBILE : MIN_DESKTOP)) && (
            <div className="flex justify-center mt-6 md:mt-8">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {visibleCount > (isMobile ? MIN_MOBILE : MIN_DESKTOP) && (
                  <button
                    type="button"
                    onClick={onLess}
                    className="rounded-full px-6 py-3 font-black text-[11px] md:text-xs active:scale-95 transition whitespace-nowrap"
                    style={{
                      background: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(15,23,42,0.10)',
                      color: isDarkMode ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.85)',
                      boxShadow: isDarkMode ? '0 14px 40px rgba(0,0,0,0.30)' : '0 14px 40px rgba(15,23,42,0.08)',
                    }}
                  >
                    ابزارهای کمتر
                  </button>
                )}

                {visibleCount < cardsFiltered.length && (
                  <button
                    type="button"
                    onClick={onMore}
                    className="rounded-full px-6 py-3 font-black text-[11px] md:text-xs active:scale-95 transition whitespace-nowrap"
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.14)',
                      boxShadow: '0 16px 44px rgba(37,99,235,0.28)',
                    }}
                  >
                    ابزارهای بیشتر
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
