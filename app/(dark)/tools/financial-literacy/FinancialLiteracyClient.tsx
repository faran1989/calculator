'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  BookOpen,
  Info,
  Facebook,
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toolConfig } from './tool.config';
import { saveToolRun } from '@/lib/toolRun/client';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

type TabKey = 'tool' | 'about';

type MenuItem = {
  slug: 'home' | 'tools' | 'learn' | 'about';
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type FaqItem = { q: string; a: string };

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"
            key={i}
            data-faq-item
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-3 sm:py-4 text-right"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-[13px] sm:text-sm text-slate-200">{item.q}</span>
              {isOpen ? (
                <ChevronUp size={18} className="text-slate-400" />
              ) : (
                <ChevronDown size={18} className="text-slate-500" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 sm:px-5 pb-4"
                >
                  <div className="text-slate-400 text-[13px] sm:text-sm leading-7">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   Financial Literacy Engine
   ========================= */

type Category = 'budgeting' | 'crisis' | 'inflation' | 'investing' | 'behavior';
type Difficulty = 1 | 2 | 3;

type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanationShort: string;
  explanationMore?: string;
};

type CategoryConfig = {
  key: Category;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  weight: number;
  targetDifficulty: Difficulty;
  questionsToAsk: number; // 4..6
};

type Answered = {
  qid: string;
  category: Category;
  difficulty: Difficulty;
  isCorrect: boolean;
  correctIndex: number;
  chosenIndex: number;
  weight: number;
};

const STORAGE_KEY = 'takhmino_finlit_assessment_v1';
// ✅ جلوگیری از ذخیره تکراری در حالت results (مثلاً بعد از refresh)
const STORAGE_SAVED_KEY = `${STORAGE_KEY}__saved_run_startedAt`;

const difficultyWeight: Record<Difficulty, number> = { 1: 1.0, 2: 1.4, 3: 1.8 };

function clampDifficulty(n: number): Difficulty {
  if (n <= 1) return 1;
  if (n >= 3) return 3;
  return n as Difficulty;
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] ?? null;
}

function formatMinutes(min: number): string {
  if (min <= 1) return 'حدود ۱ دقیقه';
  return `حدود ${min} دقیقه`;
}

function levelLabel(score: number) {
  if (score < 20) return { en: 'Starter', fa: 'شروع‌کننده', tone: 'آرام' };
  if (score < 40) return { en: 'In Progress', fa: 'در مسیر', tone: 'رو به رشد' };
  if (score < 65) return { en: 'Solid', fa: 'قابل اتکا', tone: 'پایه خوب' };
  if (score < 85) return { en: 'Advanced', fa: 'پیشرفته', tone: 'قوی' };
  return { en: 'Potential Specialist', fa: 'در آستانه تخصص', tone: 'خیلی قوی' };
}

function calcConfidence(totalAnswered: number, difficultyCoverage: number) {
  // ساده و قابل توضیح: هم تعداد سوال‌ها مهم است هم تنوع سختی‌ها
  const countFactor = Math.min(1, totalAnswered / 25); // MVP
  const coverageFactor = Math.min(1, difficultyCoverage / 3);
  const conf = Math.round((countFactor * 0.65 + coverageFactor * 0.35) * 100);
  return Math.max(10, Math.min(100, conf));
}

function getEncouragement(stepIndex: number): string | null {
  // بدون چاپلوسی؛ کوتاه؛ هر چند سوال
  const map: Record<number, string> = {
    4: 'ریتم خوبه. همین‌طور دقیق ادامه بده.',
    9: 'تا اینجا تصویر خوبی از پایه‌ها داریم.',
    14: 'نیمه راهه—فقط چند قدم دیگه.',
    19: 'عالیه. کم‌کم وارد بخش‌های ترکیبی می‌شیم.',
    24: 'تقریباً تمومه. چند سؤال آخر برای جمع‌بندی.',
  };
  return map[stepIndex] || null;
}

function categoryMiniInsight(title: string, score: number): string {
  if (score >= 80)
    return `در «${title}» عملکردت خیلی خوبه—احتمالاً تصمیم‌هات در این بخش قابل اتکاست.`;
  if (score >= 55)
    return `در «${title}» پایه خوبی داری، ولی چند نقطه هست که با کمی تمرین خیلی بهتر می‌شه.`;
  if (score >= 35)
    return `در «${title}» نیاز به تثبیت مفاهیم داری. چند نکته‌ی کلیدی رو با تمرین می‌تونیم سریع بالا بیاریم.`;
  return `در «${title}» بهتره از پایه شروع کنیم. نگران نباش—با چند تمرین ساده سریع پیشرفت می‌کنی.`;
}

function computeInsightEngine(scores: Record<Category, number>) {
  const b = scores.budgeting;
  const c = scores.crisis;
  const i = scores.inflation;
  const inv = scores.investing;
  const beh = scores.behavior;

  const lines: string[] = [];

  if (b < 45 && c < 45) {
    lines.push(
      'ترکیب «بودجه» و «بحران» پایین است؛ این یعنی در شوک درآمدی یا هزینه‌های ناگهانی، فشار روی جریان نقد می‌تواند زیاد شود.'
    );
  } else if (b >= 65 && c < 45) {
    lines.push(
      'بودجه‌ات خوب است، اما بخش «بحران» ضعیف‌تر است؛ با یک صندوق اضطراری کوچک می‌توانی ریسک شوک‌ها را کم کنی.'
    );
  }

  if (inv >= 65 && i < 45) {
    lines.push(
      'رشد سرمایه را می‌فهمی، ولی «تورم/بازده واقعی» نیاز به توجه دارد؛ بعضی سودها روی کاغذ خوب‌اند اما ارزش واقعی را حفظ نمی‌کنند.'
    );
  } else if (i >= 65 && inv < 45) {
    lines.push(
      'درک تورم و ارزش واقعی خوب است؛ اگر مبانی سرمایه‌گذاری را تقویت کنی، تصمیم‌هایت عملی‌تر و ساختارمندتر می‌شود.'
    );
  }

  if (beh < 45) {
    lines.push(
      'در بخش رفتار مالی، احتمال خطاهای رایج (مثل FOMO یا تأییدطلبی) بالاتر است؛ چند تکنیک ساده می‌تواند کیفیت تصمیم را بالا ببرد.'
    );
  } else if (beh >= 70) {
    lines.push('در رفتار مالی قوی هستی؛ این معمولاً باعث می‌شود حتی با اطلاعات ناقص، تصمیم‌های پایدارتر بگیری.');
  }

  if (lines.length === 0) {
    lines.push('نتیجه‌ها متعادل‌اند؛ با چند تمرین هدفمند می‌توانی نقاط قابل رشد را سریع‌تر تقویت کنی.');
  }

  return lines.slice(0, 3);
}

function buildActionPlan(finalScore: number) {
  if (finalScore < 40) {
    return [
      { title: 'گام ۱: تثبیت پایه‌ها', text: 'بودجه ساده + شناخت تورم و «ارزش واقعی» را هدف بگیر.' },
      { title: 'گام ۲: ساخت سپر بحران', text: 'یک صندوق اضطراری کوچک طراحی کن و قواعد خرج را مشخص کن.' },
      { title: 'گام ۳: تمرین با ابزارها', text: 'با ابزار «قدرت خرید/تورم» و «قسط وام» چند سناریو واقعی تست کن.' },
    ];
  }
  if (finalScore < 70) {
    return [
      { title: 'گام ۱: پر کردن شکاف‌ها', text: 'دسته‌های ضعیف‌تر را با ۲-۳ مفهوم کلیدی تقویت کن.' },
      { title: 'گام ۲: تصمیم‌سازی واقع‌گرایانه', text: 'اثر تورم، هزینه فرصت و ریسک را در تصمیم‌ها وارد کن.' },
      { title: 'گام ۳: بهینه‌سازی', text: 'با سناریوهای مختلف در ابزارها، تصمیم‌ها را مقایسه و اصلاح کن.' },
    ];
  }
  return [
    { title: 'گام ۱: استانداردسازی تصمیم', text: 'برای تصمیم‌ها چک‌لیست بساز: ریسک، بازده واقعی، رفتارهای خطادار.' },
    { title: 'گام ۲: تعمیق مفاهیم', text: 'چند مفهوم پیشرفته سبک (مثلاً بازده واقعی و اثر زمان) را دقیق‌تر کن.' },
    { title: 'گام ۳: تمرین سناریویی', text: 'سناریوهای پیچیده‌تر را با ابزارهای تخمینو مدل کن و خروجی‌ها را بسنج.' },
  ];
}

function scoreCategory(answers: Answered[], category: Category) {
  const rows = answers.filter((a) => a.category === category);
  const denom = rows.reduce((s, r) => s + r.weight, 0);
  const num = rows.reduce((s, r) => s + (r.isCorrect ? r.weight : 0), 0);
  const pct = denom === 0 ? 0 : Math.round((num / denom) * 100);
  return pct;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type PersistedState = {
  version: 1;
  startedAt: number;
  currentCategoryIndex: number;
  perCategoryDifficulty: Record<Category, Difficulty>;
  usedQuestionIds: string[];
  answered: Answered[];
  phase: 'intro' | 'question' | 'feedback' | 'categorySummary' | 'results';
  currentQuestionId: string | null;
  lastChosenIndex: number | null;
  selfLevel: 'starter' | 'learning' | 'familiar' | 'pro' | null;
};

const questionPool: Question[] = [
  // Budgeting (بودجه/جریان نقد)
  {
    id: 'b1',
    category: 'budgeting',
    difficulty: 1,
    text: 'کدام گزینه «جریان نقد» را بهتر توضیح می‌دهد؟',
    options: ['فقط میزان درآمد ماهانه', 'ورود و خروج پول در یک بازه', 'ارزش کل دارایی‌ها', 'فقط مقدار پس‌انداز'],
    correctIndex: 1,
    explanationShort: 'جریان نقد یعنی پولی که در یک بازه وارد و خارج می‌شود، نه فقط درآمد یا پس‌انداز.',
    explanationMore:
      'ممکن است درآمد بالا باشد اما خروجی‌ها بیشتر باشند و جریان نقد منفی شود. تصمیم‌های مالی خوب معمولاً روی جریان نقد کنترل دارند.',
  },
  {
    id: 'b2',
    category: 'budgeting',
    difficulty: 1,
    text: 'اگر آخر ماه همیشه «غافلگیر» می‌شوی، اولین قدم منطقی‌تر چیست؟',
    options: ['افزایش وام', 'ثبت هزینه‌ها برای ۲ هفته', 'خرید یک سرمایه‌گذاری پرریسک', 'نادیده گرفتن مخارج ریز'],
    correctIndex: 1,
    explanationShort: 'بدون داده‌ی ساده از خرج‌ها، اصلاح بودجه بیشتر شبیه حدس است.',
    explanationMore:
      'ثبت کوتاه‌مدت (حتی ۱۴ روز) معمولاً الگوهای واقعی خرج را نشان می‌دهد و جلوی تصمیم‌های احساسی را می‌گیرد.',
  },
  {
    id: 'b3',
    category: 'budgeting',
    difficulty: 2,
    text: 'دو نفر درآمد برابر دارند. نفر اول ۳۰٪ درآمدش را پس‌انداز می‌کند، نفر دوم ۰٪. محتمل‌ترین علت چیست؟',
    options: ['شانس', 'مدیریت هزینه و اولویت‌بندی', 'فقط تفاوت در مالیات', 'همیشه سرمایه‌گذاری نفر اول'],
    correctIndex: 1,
    explanationShort: 'پس‌انداز معمولاً بیشتر به کنترل هزینه و اولویت‌بندی ربط دارد تا صرفاً درآمد.',
    explanationMore:
      'رفتار خرج و قواعد شخصی (سقف هزینه، پرداخت به خود اول) تفاوت اصلی را می‌سازد—even با درآمد یکسان.',
  },
  {
    id: 'b4',
    category: 'budgeting',
    difficulty: 2,
    text: 'کدام روش «کاهش اصطکاک تصمیم» در بودجه مؤثرتر است؟',
    options: ['تصمیم روزانه بدون قاعده', 'سقف هزینه برای دسته‌ها + اتومات پس‌انداز', 'فقط یادداشت ذهنی', 'جریمه کردن خود بعد از خرج'],
    correctIndex: 1,
    explanationShort: 'قاعده + اتومات‌سازی کمک می‌کند تصمیم‌های تکراری ساده شوند.',
    explanationMore:
      'وقتی بخشی از پول از قبل کنار گذاشته می‌شود، فشار تصمیم‌گیری روزانه کمتر می‌شود و احتمال خطای رفتاری پایین می‌آید.',
  },
  {
    id: 'b5',
    category: 'budgeting',
    difficulty: 3,
    text: 'اگر هزینه‌های ثابتت ۸۰٪ درآمد باشد، کدام گزینه منطقی‌تر است؟',
    options: ['افزایش هزینه‌های متغیر', 'کاهش هزینه ثابت یا افزایش درآمد قبل از سرمایه‌گذاری پرریسک', 'فقط امید به ماه بعد', 'قرض کوتاه‌مدت برای سرمایه‌گذاری'],
    correctIndex: 1,
    explanationShort: 'وقتی هزینه ثابت زیاد است، «حاشیه امن» کوچک می‌شود؛ اول باید ظرفیت آزاد ایجاد کرد.',
    explanationMore:
      'در این وضعیت، هر شوک کوچک می‌تواند کسری ایجاد کند. اصلاح ساختار هزینه/درآمد قبل از ریسک‌پذیری مهم‌تر است.',
  },

  // Crisis / Emergency fund
  {
    id: 'c1',
    category: 'crisis',
    difficulty: 1,
    text: 'صندوق اضطراری بیشتر برای چیست؟',
    options: ['سودگیری سریع', 'پوشش هزینه‌های غیرمنتظره و شوک درآمدی', 'خریدهای لوکس', 'پرداخت مالیات سالانه'],
    correctIndex: 1,
    explanationShort: 'کار صندوق اضطراری کاهش ضربه شوک‌هاست، نه کسب سود.',
    explanationMore:
      'هدف اصلی این صندوق «امنیت» است. معمولاً نقدشوندگی و دسترسی مهم‌تر از بازده بالاست.',
  },
  {
    id: 'c2',
    category: 'crisis',
    difficulty: 2,
    text: 'اگر فردا درآمدت قطع شود، کدام «هزینه» معمولاً اولویت بالاتری برای پوشش دارد؟',
    options: ['تفریح', 'مسکن/خوراک/درمان ضروری', 'خریدهای هیجانی', 'هدیه‌های غیرضروری'],
    correctIndex: 1,
    explanationShort: 'در بحران، اولویت با هزینه‌های حیاتی است.',
    explanationMore:
      'یک برنامه بحران ساده یعنی دانستن «چه چیزهایی باید بماند» و «چه چیزهایی باید سریع قطع شود».',
  },
  {
    id: 'c3',
    category: 'crisis',
    difficulty: 2,
    text: 'حداقل منطقیِ شروع صندوق اضطراری برای بسیاری از افراد چیست؟',
    options: ['۰', 'یک مبلغ کوچک اما پایدار (مثلاً ۲ تا ۴ هفته هزینه ضروری)', 'حتماً ۱۲ ماه هزینه', 'فقط بعد از سرمایه‌گذاری'],
    correctIndex: 1,
    explanationShort: 'شروع کوچک ولی پایدار معمولاً بهتر از هدف بزرگِ شروع‌نشدنی است.',
    explanationMore:
      'مقدار ایده‌آل بسته به شرایط فرق دارد، اما مهم این است که «از صفر» جدا شوی و عادت ذخیره را بسازی.',
  },
  {
    id: 'c4',
    category: 'crisis',
    difficulty: 3,
    text: 'کدام گزینه «ریسک نقدشوندگی» را بهتر توصیف می‌کند؟',
    options: ['ریسک کم شدن قیمت', 'سختی تبدیل دارایی به پول نقد در زمان نیاز', 'ریسک تورم', 'ریسک اشتباه محاسباتی'],
    correctIndex: 1,
    explanationShort: 'ممکن است دارایی ارزشمند باشد اما در لحظه نیاز نقد نشود.',
    explanationMore:
      'صندوق اضطراری معمولاً باید نقدشونده باشد چون زمان بحران، زمان مذاکره یا انتظار طولانی نیست.',
  },
  {
    id: 'c5',
    category: 'crisis',
    difficulty: 3,
    text: 'اگر «بودجه خوب» داری ولی صندوق اضطراری نداری، محتمل‌ترین پیامد چیست؟',
    options: ['هیچ', 'در شوک‌ها مجبور به قرض/فروش بدهنگام دارایی می‌شوی', 'حتماً سودت بیشتر می‌شود', 'رفتار مالی بی‌ربط است'],
    correctIndex: 1,
    explanationShort: 'نبود صندوق اضطراری می‌تواند تصمیم‌ها را در بحران مجبور و پرهزینه کند.',
    explanationMore:
      'حتی افراد منظم هم بدون سپر بحران ممکن است در زمان بد مجبور به انتخاب‌های بد شوند.',
  },

  // Inflation / real vs nominal
  {
    id: 'i1',
    category: 'inflation',
    difficulty: 1,
    text: '«بازده واقعی» یعنی چه؟',
    options: ['بازده قبل از مالیات', 'بازده بعد از کسر تورم', 'بازده اسمی روی کاغذ', 'هر سودی که حس خوب بدهد'],
    correctIndex: 1,
    explanationShort: 'بازده واقعی یعنی اثر تورم را از بازده کم کنیم.',
    explanationMore:
      'اگر تورم ۳۰٪ و بازده ۳۵٪ باشد، بازده واقعی تقریباً ۵٪ است (تقریبی).',
  },
  {
    id: 'i2',
    category: 'inflation',
    difficulty: 2,
    text: 'اگر تورم سالانه ۳۰٪ باشد، قدرت خرید پول نقدِ ثابت معمولاً چه می‌شود؟',
    options: ['زیاد می‌شود', 'کم می‌شود', 'هیچ تغییری نمی‌کند', 'حتماً دو برابر می‌شود'],
    correctIndex: 1,
    explanationShort: 'تورم یعنی کاهش قدرت خرید پول در زمان.',
    explanationMore:
      'حتی اگر مقدار پول ثابت باشد، قیمت‌ها بالا می‌روند و با همان پول کمتر می‌توان خرید.',
  },
  {
    id: 'i3',
    category: 'inflation',
    difficulty: 2,
    text: 'کدام جمله دقیق‌تر است؟',
    options: [
      'سود اسمی همیشه کافی است',
      'بدون نگاه به تورم، قضاوت درباره سود ناقص است',
      'تورم فقط روی مواد غذایی اثر دارد',
      'تورم به تصمیم‌های وام ربطی ندارد',
    ],
    correctIndex: 1,
    explanationShort: 'تورم معیارِ «واقعی بودن» نتیجه‌هاست.',
    explanationMore:
      'در بسیاری تصمیم‌ها (پس‌انداز، وام، سرمایه‌گذاری)، مقایسه بدون تورم ممکن است گمراه‌کننده باشد.',
  },
  {
    id: 'i4',
    category: 'inflation',
    difficulty: 3,
    text: 'تقریب سریع: اگر سود اسمی ۴۰٪ و تورم ۳۰٪ باشد، بازده واقعی حدوداً چند درصد است؟',
    options: ['حدود ۱۰٪', 'حدود ۷۰٪', 'حدود ۳۰٪', 'منفی ۱۰٪'],
    correctIndex: 0,
    explanationShort: 'تقریب ساده: ۴۰ - ۳۰ ≈ ۱۰٪ (برای ذهنی‌سازی).',
    explanationMore:
      'فرمول دقیق‌تر: (1+r)/(1+π)-1 است، اما برای تصمیم‌های سریع، تقریب تفاضل کمک‌کننده است.',
  },
  {
    id: 'i5',
    category: 'inflation',
    difficulty: 3,
    text: 'کدام گزینه می‌تواند «توهم سود» ایجاد کند؟',
    options: [
      'نگاه به بازده واقعی',
      'نگاه به رشد عددی پول بدون مقایسه با تورم',
      'مقایسه چند گزینه با یک معیار ثابت',
      'ثبت هزینه‌ها',
    ],
    correctIndex: 1,
    explanationShort: 'وقتی فقط عدد رشد می‌کند، ممکن است احساس سود کاذب بگیریم.',
    explanationMore:
      'اگر قیمت‌ها سریع‌تر رشد کنند، رشد اسمی پول لزوماً به معنی بهتر شدن وضعیت نیست.',
  },

  // Investing
  {
    id: 'inv1',
    category: 'investing',
    difficulty: 1,
    text: 'تنوع‌بخشی (Diversification) بیشتر برای چیست؟',
    options: ['افزایش قطعیت سود', 'کاهش ریسک تمرکز روی یک دارایی', 'حذف کامل ریسک', 'صرفاً افزایش هیجان'],
    correctIndex: 1,
    explanationShort: 'تنوع‌بخشی ریسک تمرکز را کم می‌کند، نه اینکه ریسک را صفر کند.',
    explanationMore:
      'تنوعِ منطقی یعنی دارایی‌هایی با رفتار متفاوت داشته باشی تا یک شوک همه چیز را با هم پایین نکشد.',
  },
  {
    id: 'inv2',
    category: 'investing',
    difficulty: 2,
    text: 'کدام جمله درباره «ریسک/بازده» معمولاً درست‌تر است؟',
    options: ['بازده بالاتر همیشه بدون ریسک است', 'ریسک بالاتر معمولاً با احتمال بازده بالاتر همراه است', 'ریسک یعنی حتماً ضرر', 'ریسک فقط مربوط به بورس است'],
    correctIndex: 1,
    explanationShort: 'ریسک یعنی عدم قطعیت؛ گاهی هم نتیجه مثبت می‌شود.',
    explanationMore:
      'پذیرفتن ریسک باید آگاهانه باشد: افق زمانی، ظرفیت تحمل و برنامه خروج مهم‌اند.',
  },
  {
    id: 'inv3',
    category: 'investing',
    difficulty: 2,
    text: 'بهره مرکب بیشتر به چه عامل حساسی وابسته است؟',
    options: ['زمان', 'شانس', 'تعداد خریدهای هیجانی', 'خبرهای روزانه'],
    correctIndex: 0,
    explanationShort: 'زمان یکی از موتورهای اصلی بهره مرکب است.',
    explanationMore:
      'حتی بازده متوسط، اگر زمان کافی داشته باشد، اثر تجمعی بزرگ می‌سازد. قطع و وصل‌های احساسی اثر را کم می‌کند.',
  },
  {
    id: 'inv4',
    category: 'investing',
    difficulty: 3,
    text: 'تقریب مرکب: اگر سالی ۲۰٪ رشد کند، حدوداً در چند سال دو برابر می‌شود؟ (تقریبی)',
    options: ['حدود ۳ تا ۴ سال', 'حدود ۱۰ سال', 'حدود ۱ سال', 'حدود ۲۰ سال'],
    correctIndex: 0,
    explanationShort: 'قاعده ۷۲: 72/20 ≈ 3.6 سال.',
    explanationMore:
      'این یک تقریب ذهنی است. برای تصمیم‌های سریع مفید است اما جای محاسبه دقیق را همیشه نمی‌گیرد.',
  },
  {
    id: 'inv5',
    category: 'investing',
    difficulty: 3,
    text: 'کدام رفتار معمولاً کیفیت تصمیم سرمایه‌گذاری را پایین می‌آورد؟',
    options: ['داشتن برنامه و افق', 'توجه به ریسک', 'تعقیب قیمت/خبر لحظه‌ای بدون استراتژی', 'تنوع‌بخشی'],
    correctIndex: 2,
    explanationShort: 'بدون استراتژی، تصمیم‌ها بیشتر واکنشی و احساسی می‌شوند.',
    explanationMore:
      'حتی ابزارهای خوب هم اگر بدون قواعد تصمیم‌گیری استفاده شوند، خروجی خوبی نمی‌دهند.',
  },

  // Behavioral finance
  {
    id: 'beh1',
    category: 'behavior',
    difficulty: 1,
    text: 'FOMO بیشتر به چه معنی است؟',
    options: ['ترس از دست دادن فرصت', 'اطمینان کامل', 'بی‌تفاوتی', 'برنامه‌ریزی دقیق'],
    correctIndex: 0,
    explanationShort: 'FOMO یعنی «ترس از دست دادن فرصت» که تصمیم‌های عجولانه می‌سازد.',
    explanationMore:
      'در FOMO معمولاً سرعت تصمیم بالا می‌رود و کیفیت تحلیل پایین می‌آید. داشتن قواعد ورود/خروج کمک می‌کند.',
  },
  {
    id: 'beh2',
    category: 'behavior',
    difficulty: 2,
    text: 'Sunk Cost Fallacy یعنی چه؟',
    options: ['پذیرفتن اشتباه و توقف', 'اصرار روی ادامه فقط چون قبلاً هزینه داده‌ای', 'تنوع‌بخشی', 'کاهش ریسک نقدشوندگی'],
    correctIndex: 1,
    explanationShort: 'هزینه‌های گذشته نباید تنها دلیل ادامه دادن باشد.',
    explanationMore:
      'سؤال درست: از این نقطه به بعد، بهترین انتخاب چیست؟ نه اینکه «تا حالا چقدر خرج کرده‌ام».',
  },
  {
    id: 'beh3',
    category: 'behavior',
    difficulty: 2,
    text: 'Confirmation Bias بیشتر چگونه دیده می‌شود؟',
    options: ['دنبال کردن اطلاعات مخالف', 'انتخاب اطلاعاتی که نظر ما را تأیید کند', 'ثبت هزینه‌ها', 'توجه به تورم'],
    correctIndex: 1,
    explanationShort: 'ذهن ما دوست دارد شواهد موافق را بیشتر ببیند.',
    explanationMore:
      'یک تکنیک ساده: قبل از تصمیم، چند دلیل جدیِ «چرا ممکن است اشتباه کنم؟» را بنویس.',
  },
  {
    id: 'beh4',
    category: 'behavior',
    difficulty: 3,
    text: 'Overconfidence در تصمیم مالی معمولاً چه علامتی دارد؟',
    options: ['در نظر گرفتن ریسک', 'پذیرفتن عدم قطعیت', 'قطعیت بالا با داده کم', 'چک‌لیست تصمیم'],
    correctIndex: 2,
    explanationShort: 'قطعیت زیاد بدون داده کافی، نشانه رایج اعتمادبه‌نفس کاذب است.',
    explanationMore:
      'اعتمادبه‌نفس خوب است، اما باید با «قواعد کنترل ریسک» همراه باشد تا هزینه خطا کم شود.',
  },
  {
    id: 'beh5',
    category: 'behavior',
    difficulty: 3,
    text: 'سناریو: دو بار پشت سر هم سود کردی. کدام واکنش منطقی‌تر است؟',
    options: ['افزایش ریسک چون «دستت خوب است»', 'ثبت دلیل موفقیت و حفظ اندازه ریسک', 'نادیده گرفتن داده‌ها', 'دو برابر کردن حجم بدون برنامه'],
    correctIndex: 1,
    explanationShort: 'موفقیت کوتاه‌مدت لزوماً مهارت پایدار نیست؛ ثبت و حفظ قواعد کمک می‌کند.',
    explanationMore:
      'به جای هیجان، بررسی کن چرا نتیجه خوب شد و آیا همان شرایط تکرارپذیر است یا نه.',
  },
];

const categoryConfigs: CategoryConfig[] = [
  { key: 'budgeting', title: 'بودجه و جریان نقد', icon: Target, weight: 1.0, targetDifficulty: 2, questionsToAsk: 5 },
  { key: 'crisis', title: 'بحران و صندوق اضطراری', icon: ShieldCheck, weight: 1.0, targetDifficulty: 2, questionsToAsk: 5 },
  { key: 'inflation', title: 'تورم و بازده واقعی', icon: TrendingUp, weight: 1.0, targetDifficulty: 2, questionsToAsk: 5 },
  { key: 'investing', title: 'سرمایه‌گذاری (سبک)', icon: BarChart3, weight: 1.0, targetDifficulty: 2, questionsToAsk: 5 },
  { key: 'behavior', title: 'رفتار مالی و سوگیری‌ها', icon: Sparkles, weight: 1.0, targetDifficulty: 2, questionsToAsk: 5 },
];

function buildDefaultState(): PersistedState {
  const perCategoryDifficulty = categoryConfigs.reduce((acc, c) => {
    acc[c.key] = c.targetDifficulty;
    return acc;
  }, {} as Record<Category, Difficulty>);

  return {
    version: 1,
    startedAt: Date.now(),
    currentCategoryIndex: 0,
    perCategoryDifficulty,
    usedQuestionIds: [],
    answered: [],
    phase: 'intro',
    currentQuestionId: null,
    lastChosenIndex: null,
    selfLevel: null,
  };
}

function getCategoryQuestionCount(answered: Answered[], category: Category) {
  return answered.filter((a) => a.category === category).length;
}

function pickNextQuestionId(category: Category, desiredDifficulty: Difficulty, usedIds: Set<string>): string | null {
  const pool = questionPool.filter((q) => q.category === category && !usedIds.has(q.id));

  const exact = pool.filter((q) => q.difficulty === desiredDifficulty);
  if (exact.length) return pickRandom(exact)!.id;

  const d1 = pool.filter((q) => q.difficulty === clampDifficulty(desiredDifficulty - 1));
  const d2 = pool.filter((q) => q.difficulty === clampDifficulty(desiredDifficulty + 1));
  const near = [...d1, ...d2];
  if (near.length) return pickRandom(near)!.id;

  if (pool.length) return pickRandom(pool)!.id;
  return null;
}

function estimateRemainingMinutes(totalRemainingQuestions: number) {
  // متوسط 20-35 ثانیه برای هر سوال با توضیح کوتاه + بعضی “بیشتر بدانم”
  const seconds = totalRemainingQuestions * 28;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes;
}

function buildExplainScoringText() {
  return [
    'وزن هر سؤال بر اساس سختی:',
    '• سختی ۱: ۱.۰',
    '• سختی ۲: ۱.۴',
    '• سختی ۳: ۱.۸',
    'امتیاز هر دسته:',
    '• مجموع وزن پاسخ‌های درست ÷ مجموع وزن سؤال‌های پرسیده‌شده همان دسته × ۱۰۰',
    'امتیاز نهایی:',
    '• مجموع (امتیاز هر دسته × وزن همان دسته) ÷ مجموع وزن دسته‌ها',
    'این یک تخمین آموزشی است و توصیه مالی یا تشخیص حرفه‌ای محسوب نمی‌شود.',
  ];
}

export default function FinancialLiteracyClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('tool');

  // --- Hash Routing / History ---
  const skipNextHashWriteRef = useRef(false);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const readHash = (): TabKey | null => {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (hash === 'about') return 'about';
    if (hash === 'tool') return 'tool';
    return null;
  };

  const writeHash = (next: TabKey, mode: 'replace' | 'push') => {
    const nextHash = next === 'about' ? '#about' : '#tool';
    if (window.location.hash === nextHash) return;

    if (mode === 'push') history.pushState(null, '', nextHash);
    else history.replaceState(null, '', nextHash);
  };

  const applyTabFromHash = (shouldScroll: boolean) => {
    const tab = readHash();
    if (!tab) return;

    skipNextHashWriteRef.current = true;
    setActiveTab(tab);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        if (tab === 'about') scrollToId('about');
        else scrollToId('tool-main');
      });
    }
  };

  useEffect(() => {
    if (!readHash()) writeHash('tool', 'replace');

    applyTabFromHash(true);

    const onHashChange = () => applyTabFromHash(true);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (skipNextHashWriteRef.current) {
      skipNextHashWriteRef.current = false;
      return;
    }
    writeHash(activeTab, 'replace');
  }, [activeTab]);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { slug: 'home', href: toolConfig.navRoutes.home, label: 'تخمینو', icon: Home },
      { slug: 'tools', href: toolConfig.navRoutes.tools, label: 'ابزارها', icon: Grid },
      { slug: 'learn', href: toolConfig.navRoutes.learn, label: 'یاد بگیر', icon: BookOpen },
      { slug: 'about', href: '#about', label: 'درباره', icon: Info },
    ],
    []
  );

  const onNavClick = (item: MenuItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = item.href;

    if (href.startsWith('#')) {
      e.preventDefault();

      if (href === '#about') {
        history.pushState(null, '', '#about');
        skipNextHashWriteRef.current = true;
        setActiveTab('about');
        requestAnimationFrame(() => scrollToId('about'));
        return;
      }

      if (href === '#tool') {
        history.pushState(null, '', '#tool');
        skipNextHashWriteRef.current = true;
        setActiveTab('tool');
        requestAnimationFrame(() => scrollToId('tool-main'));
        return;
      }

      history.pushState(null, '', href);
      return;
    }

    if (href.startsWith('/')) {
      e.preventDefault();
      router.push(href);
      return;
    }
  };

  const resolveRelatedHref = (slug: string, fallbackHref: string) => {
    return toolConfig.relatedRouteMap[slug] || fallbackHref || '/tools';
  };

  const faqItems = useMemo<FaqItem[]>(() => {
    const sec = toolConfig.aboutSections.find((s) => s.key === 'faq');
    if (!sec || sec.type !== 'faq') return [];
    return sec.items;
  }, []);

  const aboutCards = useMemo(() => {
    return toolConfig.aboutSections.map((sec) => {
      let body: React.ReactNode = null;

      if (sec.type === 'text') {
        body = <p className="text-slate-400 leading-7 text-[13px] sm:text-sm">{sec.text}</p>;
      } else if (sec.type === 'faq') {
        body = <FaqAccordion items={sec.items} />;
      }

      return {
        id: `about-${sec.key}`,
        key: sec.key,
        title: sec.title,
        body,
      };
    });
  }, []);

  /* =========================
     Tool State (sessionStorage)
     ========================= */

  const [toolState, setToolState] = useState<PersistedState>(() => buildDefaultState());
  const [hydrated, setHydrated] = useState(false);

  const [showMore, setShowMore] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const usedIdsSet = useMemo(() => new Set(toolState.usedQuestionIds), [toolState.usedQuestionIds]);

  const currentCategory = categoryConfigs[toolState.currentCategoryIndex] || categoryConfigs[0];
  const currentQuestion = useMemo(() => {
    if (!toolState.currentQuestionId) return null;
    return questionPool.find((q) => q.id === toolState.currentQuestionId) || null;
  }, [toolState.currentQuestionId]);

  // hydrate from sessionStorage
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    const parsed = safeJsonParse<PersistedState>(raw);
    if (parsed && parsed.version === 1) {
      setToolState(parsed);
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toolState));
  }, [toolState, hydrated]);

  const totalQuestionsPlanned = useMemo(() => categoryConfigs.reduce((s, c) => s + c.questionsToAsk, 0), []);

  const totalAnswered = toolState.answered.length;
  const remainingQuestions = Math.max(0, totalQuestionsPlanned - totalAnswered);
  const remainingMin = estimateRemainingMinutes(remainingQuestions);

  const difficultyCoverage = useMemo(() => {
    const diffs = new Set<number>();
    toolState.answered.forEach((a) => diffs.add(a.difficulty));
    return diffs.size;
  }, [toolState.answered]);

  const confidence = calcConfidence(totalAnswered, difficultyCoverage);

  const applySelfLevel = useCallback((lvl: PersistedState['selfLevel']) => {
    setToolState((p) => ({
      ...p,
      selfLevel: lvl,
      perCategoryDifficulty: {
        budgeting: lvl === 'starter' ? 1 : lvl === 'learning' ? 2 : lvl === 'familiar' ? 2 : 3,
        crisis: lvl === 'starter' ? 1 : lvl === 'learning' ? 2 : lvl === 'familiar' ? 2 : 3,
        inflation: lvl === 'starter' ? 1 : lvl === 'learning' ? 2 : lvl === 'familiar' ? 2 : 3,
        investing: lvl === 'starter' ? 1 : lvl === 'learning' ? 2 : lvl === 'familiar' ? 2 : 3,
        behavior: lvl === 'starter' ? 1 : lvl === 'learning' ? 2 : lvl === 'familiar' ? 2 : 3,
      },
    }));
  }, []);

  const startOrResume = useCallback(() => {
    setShowMore(false);
    setToolState((prev) => {
      // اگر از قبل وسط کاره، دست نزن
      if (prev.phase !== 'intro' && prev.currentQuestionId) return prev;

      const used = new Set(prev.usedQuestionIds);
      const cat = categoryConfigs[prev.currentCategoryIndex] || categoryConfigs[0];
      const desired = prev.perCategoryDifficulty[cat.key];

      const nextId = pickNextQuestionId(cat.key, desired, used);
      return {
        ...prev,
        phase: 'question',
        currentQuestionId: nextId,
        lastChosenIndex: null,
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setShowMore(false);
    setShowExplainModal(false);
    setAutoSaveStatus('idle');
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_SAVED_KEY);
    setToolState(buildDefaultState());
  }, []);

  // تغییر سطح قبل از پاسخ‌دادن (بدون نیاز به ریست/پاسخ)
  const backToLevelSelectIfNoAnswerYet = useCallback(() => {
    setShowMore(false);
    setToolState((prev) => {
      if (prev.answered.length > 0) return prev;
      return {
        ...prev,
        phase: 'intro',
        currentQuestionId: null,
        lastChosenIndex: null,
      };
    });
  }, []);

  const answerQuestion = useCallback(
    (choiceIndex: number) => {
      if (!currentQuestion) return;

      setShowMore(false);

      setToolState((prev) => {
        const q = currentQuestion;
        const isCorrect = choiceIndex === q.correctIndex;

        const w = difficultyWeight[q.difficulty];
        const answeredRow: Answered = {
          qid: q.id,
          category: q.category,
          difficulty: q.difficulty,
          isCorrect,
          correctIndex: q.correctIndex,
          chosenIndex: choiceIndex,
          weight: w,
        };

        const nextDifficulty = clampDifficulty((prev.perCategoryDifficulty[q.category] || 2) + (isCorrect ? 1 : -1));
        const nextPerCat = { ...prev.perCategoryDifficulty, [q.category]: nextDifficulty };

        const nextUsed = prev.usedQuestionIds.includes(q.id) ? prev.usedQuestionIds : [...prev.usedQuestionIds, q.id];

        return {
          ...prev,
          answered: [...prev.answered, answeredRow],
          perCategoryDifficulty: nextPerCat,
          usedQuestionIds: nextUsed,
          phase: 'feedback',
          lastChosenIndex: choiceIndex,
        };
      });
    },
    [currentQuestion]
  );

  const goNext = useCallback(() => {
    setShowMore(false);

    setToolState((prev) => {
      // اگر سؤال نداریم، برگرد به intro
      const cat = categoryConfigs[prev.currentCategoryIndex] || categoryConfigs[0];
      const answeredCountInCat = getCategoryQuestionCount(prev.answered, cat.key);

      // اگر دسته تمام شد -> summary
      if (answeredCountInCat >= cat.questionsToAsk) {
        return {
          ...prev,
          phase: 'categorySummary',
          currentQuestionId: null,
          lastChosenIndex: null,
        };
      }

      // در همان دسته سؤال بعدی را بر اساس difficulty فعلی انتخاب کن
      const used = new Set(prev.usedQuestionIds);
      const desired = prev.perCategoryDifficulty[cat.key];
      const nextId = pickNextQuestionId(cat.key, desired, used);

      return {
        ...prev,
        phase: 'question',
        currentQuestionId: nextId,
        lastChosenIndex: null,
      };
    });
  }, []);

  const continueAfterCategory = useCallback(() => {
    setShowMore(false);

    setToolState((prev) => {
      const nextIndex = prev.currentCategoryIndex + 1;

      // اگر همه دسته‌ها تمام شد -> results
      if (nextIndex >= categoryConfigs.length) {
        return {
          ...prev,
          phase: 'results',
          currentCategoryIndex: prev.currentCategoryIndex,
          currentQuestionId: null,
          lastChosenIndex: null,
        };
      }

      // دسته بعدی: سؤال اول
      const nextCat = categoryConfigs[nextIndex];
      const used = new Set(prev.usedQuestionIds);
      const desired = prev.perCategoryDifficulty[nextCat.key];
      const nextId = pickNextQuestionId(nextCat.key, desired, used);

      return {
        ...prev,
        currentCategoryIndex: nextIndex,
        phase: 'question',
        currentQuestionId: nextId,
        lastChosenIndex: null,
      };
    });
  }, []);

  const scoresByCategory = useMemo(() => {
    const scores = {
      budgeting: scoreCategory(toolState.answered, 'budgeting'),
      crisis: scoreCategory(toolState.answered, 'crisis'),
      inflation: scoreCategory(toolState.answered, 'inflation'),
      investing: scoreCategory(toolState.answered, 'investing'),
      behavior: scoreCategory(toolState.answered, 'behavior'),
    } satisfies Record<Category, number>;
    return scores;
  }, [toolState.answered]);

  const finalScore = useMemo(() => {
    const totalWeight = categoryConfigs.reduce((s, c) => s + c.weight, 0);
    const sum = categoryConfigs.reduce((s, c) => s + scoresByCategory[c.key] * c.weight, 0);
    const res = totalWeight === 0 ? 0 : Math.round(sum / totalWeight);
    return Math.max(0, Math.min(100, res));
  }, [scoresByCategory]);

  const level = useMemo(() => levelLabel(finalScore), [finalScore]);

  const strengths = useMemo(() => {
    const entries = categoryConfigs.map((c) => ({ key: c.key, title: c.title, score: scoresByCategory[c.key] }));
    entries.sort((a, b) => b.score - a.score);
    return entries.filter((e) => e.score >= 60).slice(0, 3);
  }, [scoresByCategory]);

  const growth = useMemo(() => {
    const entries = categoryConfigs.map((c) => ({ key: c.key, title: c.title, score: scoresByCategory[c.key] }));
    entries.sort((a, b) => a.score - b.score);
    return entries.filter((e) => e.score < 70).slice(0, 3);
  }, [scoresByCategory]);

  const insights = useMemo(() => computeInsightEngine(scoresByCategory), [scoresByCategory]);
  const actionPlan = useMemo(() => buildActionPlan(finalScore), [finalScore]);

  const radarData = useMemo(() => {
    return categoryConfigs.map((c) => ({
      name: c.title,
      score: scoresByCategory[c.key],
      fullMark: 100,
    }));
  }, [scoresByCategory]);

  const barData = useMemo(() => {
    return categoryConfigs.map((c) => ({
      name: c.title,
      score: scoresByCategory[c.key],
    }));
  }, [scoresByCategory]);

  const currentCategoryScore = useMemo(() => {
    if (!currentCategory) return 0;
    return scoresByCategory[currentCategory.key];
  }, [scoresByCategory, currentCategory]);

  const encouragement = useMemo(() => getEncouragement(totalAnswered), [totalAnswered]);

  const canResume = useMemo(() => {
    return hydrated && toolState.phase !== 'intro' && (toolState.answered.length > 0 || toolState.currentQuestionId);
  }, [hydrated, toolState.phase, toolState.answered.length, toolState.currentQuestionId]);

  const explainLines = useMemo(() => buildExplainScoringText(), []);

  // ✅ Auto-save وقتی وارد results شد
  useEffect(() => {
    if (!hydrated) return;
    if (toolState.phase !== 'results') return;

    // جلوگیری از ثبت تکراری برای همین اجرای آزمون
    const alreadySavedFor = sessionStorage.getItem(STORAGE_SAVED_KEY);
    if (alreadySavedFor === String(toolState.startedAt)) return;

    (async () => {
      setAutoSaveStatus('saving');

      const strengthsText = strengths.length ? strengths.map((s) => s.title).join(' و ') : '—';
      const growthText = growth.length ? growth.map((g) => g.title).join(' و ') : '—';

      const summary = `امتیاز کل ${finalScore}. نقاط قوت: ${strengthsText}. قابل رشد: ${growthText}.`;

      // ✅ version استاندارد (اگر toolConfig.version داری استفاده می‌کنیم)
      const version = (toolConfig as any).version ?? '1.0.0';

      // ✅ rawData استانداردتر + timestamp
      const rawData = {
        timestamp: new Date().toISOString(),
        inputs: {
          selfLevel: toolState.selfLevel,
        },
        result: {
          totalScore: finalScore,
          categoryScores: {
            budgeting: scoresByCategory.budgeting,
            crisis: scoresByCategory.crisis,
            inflation: scoresByCategory.inflation,
            investing: scoresByCategory.investing,
            behavior: scoresByCategory.behavior,
          },
          type: level.fa,
          confidence,
          answeredCount: totalAnswered,
          startedAt: toolState.startedAt,
        },
        meta: {
          schema: 'tool-run@1',
          toolSlug: toolConfig.slug,
          toolVersion: String(version),
        },
      };

      const res = await saveToolRun({
        toolSlug: toolConfig.slug,
        toolName: toolConfig.toolName,
        version: String(version),
        rawData,
        summary,
      });

      if (res.ok) {
        sessionStorage.setItem(STORAGE_SAVED_KEY, String(toolState.startedAt));
        setAutoSaveStatus('saved');
      } else {
        // اگر لاگین نباشه معمولاً Unauthorized می‌گیریم—پس fail می‌مونه
        setAutoSaveStatus('failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, toolState.phase]);

  /* =========================
     UI (Tool panel content)
     ========================= */

  const ToolPanel = () => {
    // Loading guard for SSR hydration
    if (!hydrated) {
      return (
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <Grid className="text-blue-500" size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">در حال آماده‌سازی...</h2>
          <p className="text-slate-400 leading-7 text-[13px] sm:text-sm">یک لحظه صبر کن.</p>
        </div>
      );
    }

    // Intro
    if (toolState.phase === 'intro') {
      return (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <Target className="text-blue-500" size={28} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">سنجش آگاهی مالی (تطبیقی)</h2>

          <p className="text-slate-400 leading-7 text-[13px] sm:text-sm max-w-2xl mx-auto">
            ۵ تا ۱۵ دقیقه وقت می‌گیرد. سؤال‌ها دسته‌بندی شده‌اند و سختی داخل هر دسته بر اساس پاسخ‌های خودت تطبیق می‌شود.
            بعد از هر سؤال، توضیح کوتاه می‌بینی و اگر خواستی «بیشتر بدانم» را باز می‌کنی.
          </p>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-4 sm:px-5 py-5 text-right max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle size={18} className="text-slate-500" />
              <div className="font-bold text-[13px] sm:text-sm text-slate-200">
                اختیاری: سطح خودت رو چطور می‌بینی؟
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: 'starter', t: 'تازه‌کار' },
                { k: 'learning', t: 'در حال یادگیری' },
                { k: 'familiar', t: 'نسبتاً آشنا' },
                { k: 'pro', t: 'حرفه‌ای' },
              ].map((it) => {
                const active = toolState.selfLevel === (it.k as PersistedState['selfLevel']);
                return (
                  <button
                    key={it.k}
                    type="button"
                    onClick={() => applySelfLevel(it.k as PersistedState['selfLevel'])}
                    className={`rounded-2xl border px-4 py-4 text-right transition-all active:scale-95 ${
                      active
                        ? 'border-blue-500/40 bg-blue-500/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-blue-500/20'
                    }`}
                  >
                    <div className="font-black text-sm sm:text-base">{it.t}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-6">
                      فقط برای شروع سختی. هر دسته بعداً تطبیق می‌شود.
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {canResume ? (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-4 sm:px-5 py-5 text-right max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div className="text-[13px] sm:text-sm text-slate-300 leading-7">
                  یک سنجش نیمه‌تمام پیدا شد. می‌خواهی ادامه بدهی یا از نو شروع کنیم؟
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="button"
                  onClick={startOrResume}
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  ادامه از آخرین مرحله
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex-1 px-6 py-4 bg-white/[0.02] hover:bg-white/[0.04] text-white rounded-2xl font-bold transition-all border border-white/5 active:scale-95"
                >
                  شروع از نو
                </button>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={startOrResume}
            className="mt-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            شروع سنجش
          </button>

          <div className="text-[11px] text-slate-500 leading-6 max-w-2xl mx-auto">
            این ابزار یک تخمین آموزشی است و هیچ توصیه مالی یا پیش‌بینی قطعی ارائه نمی‌کند. هیچ داده حساس از شما گرفته نمی‌شود.
          </div>
        </div>
      );
    }

    // Category summary
    if (toolState.phase === 'categorySummary') {
      const Icon = currentCategory.icon;
      const msg = categoryMiniInsight(currentCategory.title, currentCategoryScore);

      return (
        <div className="space-y-6 text-right w-full max-w-4xl mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <Icon className="text-blue-500" size={28} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-center">
            جمع‌بندی دسته: {currentCategory.title}
          </h2>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="font-bold text-slate-200 text-sm sm:text-base">امتیاز این دسته</div>
              <div className="text-white font-black text-xl sm:text-2xl">{currentCategoryScore}٪</div>
            </div>
            <div className="mt-4 text-slate-400 leading-7 text-[13px] sm:text-sm">{msg}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={continueAfterCategory}
              className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              ادامه دسته بعدی
            </button>

            <button
              type="button"
              onClick={resetAll}
              className="flex-1 px-8 py-4 bg-white/[0.02] hover:bg-white/[0.04] text-white rounded-2xl font-bold transition-all border border-white/5 active:scale-95"
            >
              ریست
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center">زمان تقریبی باقی‌مانده: {formatMinutes(remainingMin)}</div>
        </div>
      );
    }

    // Results
    if (toolState.phase === 'results') {
      return (
        <div className="space-y-6 text-right w-full max-w-5xl mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <BarChart3 className="text-blue-500" size={28} />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-white">نتیجه سنجش آگاهی مالی</h2>
            <div className="text-slate-400 text-[13px] sm:text-sm">
              این نتیجه یک تخمین آموزشی است، نه توصیه مالی و نه تشخیص حرفه‌ای.
            </div>
          </div>

          {/* وضعیت ذخیره خودکار */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-[13px] sm:text-sm text-slate-300 leading-7">
            {autoSaveStatus === 'saving' && 'در حال ثبت نتیجه در داشبورد...'}
            {autoSaveStatus === 'saved' && '✅ نتیجه با موفقیت در داشبورد ذخیره شد.'}
            {autoSaveStatus === 'failed' &&
              '⚠️ نتیجه ذخیره نشد (احتمالاً وارد حساب نشده‌ای). بعد از ورود، دوباره یک بار آزمون را تمام کن.'}
            {autoSaveStatus === 'idle' && '—'}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-200 text-sm sm:text-base">امتیاز نهایی</div>
                <div className="text-white font-black text-2xl sm:text-3xl">{finalScore}٪</div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-slate-400">سطح</div>
                <div className="text-white font-black text-lg mt-1">{level.fa}</div>
                <div className="text-[11px] text-slate-500 mt-1">{level.en}</div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-200">اطمینان ارزیابی</div>
                  <div className="text-sm font-black text-white">{confidence}٪</div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 leading-6">
                  بر اساس تعداد سؤال‌ها + تنوع سختی‌ها (ساده و قابل توضیح).
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowExplainModal(true)}
                  className="flex-1 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] text-white rounded-2xl font-bold transition-all border border-white/5 active:scale-95 text-[13px] sm:text-sm"
                >
                  امتیاز چطور محاسبه شد؟
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] text-white rounded-2xl font-bold transition-all border border-white/5 active:scale-95"
                  aria-label="reset"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="font-bold text-slate-200">نقشه دسته‌ها</div>
                <div className="text-[11px] text-slate-500">نمودارها در موبایل اسکرول افقی دارند.</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-4">
                  <div className="text-xs font-bold text-slate-300 mb-3">Radar</div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[520px] md:min-w-0" style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                          <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500 leading-6">
                    هر ضلع یک دسته است و فاصله از مرکز یعنی امتیاز بالاتر.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-4">
                  <div className="text-xs font-bold text-slate-300 mb-3">Bar</div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[560px] md:min-w-0" style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ left: 8, right: 8, top: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            interval={0}
                            height={70}
                          />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(2,6,23,0.9)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            labelStyle={{ color: '#e2e8f0' }}
                            itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500 leading-6">
                    ستون‌ها مقایسه سریع امتیاز هر دسته را نشان می‌دهند.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* باقی نتایج مثل قبل */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
              <div className="font-black text-white mb-4">نقاط قوت</div>
              {strengths.length ? (
                <ul className="space-y-3">
                  {strengths.map((s) => (
                    <li key={s.key} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-200">{s.title}</div>
                        <div className="text-xs text-slate-500 mt-1">امتیاز: {s.score}٪</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-500 text-[13px] sm:text-sm leading-7">
                  هنوز نقطه قوت برجسته‌ای ثبت نشده. این طبیعی است—با چند تمرین هدفمند می‌توانیم سریع بهترش کنیم.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
              <div className="font-black text-white mb-4">حوزه‌های قابل رشد</div>
              {growth.length ? (
                <ul className="space-y-3">
                  {growth.map((g) => (
                    <li key={g.key} className="flex items-start gap-3">
                      <XCircle size={18} className="text-amber-400 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-200">{g.title}</div>
                        <div className="text-xs text-slate-500 mt-1">امتیاز: {g.score}٪</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-500 text-[13px] sm:text-sm leading-7">همه دسته‌ها در وضعیت خوبی هستند. ادامه بده.</div>
              )}
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
              <div className="font-black text-white mb-4">تحلیل ترکیبی</div>
              <div className="space-y-3 text-slate-400 text-[13px] sm:text-sm leading-7">
                {insights.map((t, idx) => (
                  <p key={idx}>{t}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
            <div className="font-black text-white mb-4">برنامه اقدام ۳ مرحله‌ای</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actionPlan.map((s, idx) => (
                <div key={idx} className="rounded-2xl border border-white/5 bg-slate-950/30 p-5">
                  <div className="font-black text-slate-200">{s.title}</div>
                  <div className="text-slate-400 text-[13px] sm:text-sm leading-7 mt-2">{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
            <div className="font-black text-white mb-4">تمرین پیشنهادی (CTA)</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/learn/inflation"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/learn/inflation');
                }}
                className="rounded-2xl border border-white/5 bg-slate-950/30 p-5 hover:border-blue-500/30 transition-all"
              >
                <div className="font-bold text-slate-200">Learn</div>
                <div className="text-[13px] sm:text-sm text-slate-400 mt-2">تورم چیست؟ (placeholder)</div>
                <div className="text-[11px] text-slate-500 mt-2">برای تقویت «تورم/بازده واقعی»</div>
              </a>

              <a
                href="/tools/purchasing-power"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/tools/purchasing-power');
                }}
                className="rounded-2xl border border-white/5 bg-slate-950/30 p-5 hover:border-blue-500/30 transition-all"
              >
                <div className="font-bold text-slate-200">Practice</div>
                <div className="text-[13px] sm:text-sm text-slate-400 mt-2">قدرت خرید / تورم</div>
                <div className="text-[11px] text-slate-500 mt-2">تست سناریوهای واقعی تورم</div>
              </a>

              <a
                href="/tools/loan"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/tools/loan');
                }}
                className="rounded-2xl border border-white/5 bg-slate-950/30 p-5 hover:border-blue-500/30 transition-all"
              >
                <div className="font-bold text-slate-200">Practice</div>
                <div className="text-[13px] sm:text-sm text-slate-400 mt-2">قسط وام</div>
                <div className="text-[11px] text-slate-500 mt-2">درک هزینه واقعی بدهی</div>
              </a>
            </div>

            <div className="mt-5 text-[11px] text-slate-500 leading-6">
              دیسکلایمر: این نتیجه یک تخمین تقریبی از سطح آگاهی مالی بر اساس پاسخ‌هاست؛ تشخیص حرفه‌ای یا توصیه مالی نیست.
            </div>
          </div>

          {/* Explain Modal */}
          <AnimatePresence>
            {showExplainModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center px-4"
                role="dialog"
                aria-modal="true"
              >
                <div className="absolute inset-0 bg-black/60" onClick={() => setShowExplainModal(false)} aria-hidden="true" />
                <motion.div
                  initial={{ y: 16, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: 16, opacity: 0, filter: 'blur(8px)' }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 text-right"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-black text-white">امتیاز چطور محاسبه شد؟</div>
                    <button
                      type="button"
                      onClick={() => setShowExplainModal(false)}
                      className="w-10 h-10 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-center transition-all"
                      aria-label="close"
                    >
                      <ChevronDown className="rotate-90 text-slate-300" size={18} />
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <ul className="space-y-2 text-[13px] sm:text-sm text-slate-300 leading-7">
                      {explainLines.map((l, idx) => (
                        <li key={idx} className="text-slate-300">
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowExplainModal(false)}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all active:scale-95"
                    >
                      متوجه شدم
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Question / Feedback flow
    const catIcon = currentCategory.icon;
    const q = currentQuestion;

    if (!q) {
      return (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <Grid className="text-blue-500" size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">یک لحظه...</h2>
          <p className="text-slate-400 leading-7 text-[13px] sm:text-sm">در حال آماده‌سازی سؤال بعدی.</p>
          <button
            type="button"
            onClick={goNext}
            className="mt-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            ادامه
          </button>
        </div>
      );
    }

    const isFeedback = toolState.phase === 'feedback';
    const chosen = toolState.lastChosenIndex;
    const correct = q.correctIndex;

    const answeredCountInCat = getCategoryQuestionCount(toolState.answered, currentCategory.key);
    const catTotal = currentCategory.questionsToAsk;

    const progressPct = Math.round((totalAnswered / totalQuestionsPlanned) * 100);

    const canChangeLevelNow = totalAnswered === 0; // دقیقاً همان مشکلی که گفتی

    return (
      <div className="space-y-6 text-right w-full max-w-4xl mx-auto">
        {/* top meta */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              {React.createElement(catIcon, { size: 21, className: 'text-blue-500' })}
            </div>
            <div>
              <div className="font-black text-white">{currentCategory.title}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-6">
                سؤال {answeredCountInCat + (isFeedback ? 0 : 1)} از {catTotal} • زمان باقی‌مانده: {formatMinutes(remainingMin)}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-slate-500">پیشرفت کل</div>
                <div className="text-xs font-black text-slate-200">{progressPct}٪</div>
              </div>
              <div className="h-2 rounded-full bg-white/5 mt-2 overflow-hidden">
                <div className="h-full bg-blue-500/60" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {canChangeLevelNow ? (
              <button
                type="button"
                onClick={backToLevelSelectIfNoAnswerYet}
                className="px-4 py-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-white font-bold transition-all active:scale-95"
              >
                تغییر سطح
              </button>
            ) : null}
          </div>
        </div>

        {encouragement ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-slate-300 text-[13px] sm:text-sm leading-7">
            {encouragement}
          </div>
        ) : null}

        {/* question card */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="font-black text-white leading-8 text-[15px] sm:text-base">{q.text}</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap">
              سختی: {q.difficulty} • وزن: {difficultyWeight[q.difficulty].toFixed(1)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {q.options.map((opt, idx) => {
              const isChosen = chosen === idx;
              const isCorrectOpt = correct === idx;

              const base = 'rounded-2xl border px-4 py-3 sm:py-4 text-right transition-all active:scale-95';
              let cls = 'border-white/5 bg-slate-950/30 text-slate-200 hover:border-blue-500/20';

              if (isFeedback) {
                if (isCorrectOpt) cls = 'border-emerald-500/30 bg-emerald-500/10 text-white';
                else if (isChosen && !isCorrectOpt) cls = 'border-rose-500/30 bg-rose-500/10 text-white';
                else cls = 'border-white/5 bg-white/[0.02] text-slate-400';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isFeedback}
                  onClick={() => answerQuestion(idx)}
                  className={`${base} ${cls}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isFeedback ? (
                        isCorrectOpt ? (
                          <CheckCircle2 size={18} className="text-emerald-300" />
                        ) : isChosen ? (
                          <XCircle size={18} className="text-rose-300" />
                        ) : (
                          <div className="w-[18px] h-[18px]" />
                        )
                      ) : (
                        <div className="w-6 h-6 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="text-[13px] sm:text-sm font-bold leading-7">{opt}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* feedback */}
          {isFeedback ? (
            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/30 p-5">
              <div className="flex items-center gap-3">
                {chosen === correct ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <div className="font-black text-white">درست</div>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-rose-400" />
                    <div className="font-black text-white">اشتباه</div>
                  </>
                )}
              </div>

              <div className="mt-3 text-slate-300 text-[13px] sm:text-sm leading-7">{q.explanationShort}</div>

              {q.explanationMore ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowMore((s) => !s)}
                    className="text-[13px] sm:text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showMore ? 'بستن توضیح بیشتر' : 'بیشتر بدانم'}
                  </button>

                  <AnimatePresence initial={false}>
                    {showMore && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 text-slate-400 text-[13px] sm:text-sm leading-7">{q.explanationMore}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  سؤال بعدی
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-6 py-4 bg-white/[0.02] hover:bg-white/[0.04] text-white rounded-2xl font-bold transition-all border border-white/5 active:scale-95"
                >
                  ریست
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 text-[11px] text-slate-500 leading-6">
              نکته: این سنجش داخل هر دسته سختی را تطبیق می‌دهد. با پاسخ درست، سؤال‌های بعدی همان دسته چالشی‌تر می‌شوند.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${vazirmatn.className} relative min-h-screen overflow-x-hidden bg-[#020617] text-slate-200 select-none`}
      dir="rtl"
      data-page="tool"
      data-tool-slug={toolConfig.slug}
    >
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col items-center mb-12 sm:mb-16" id="tool-header" data-section="header">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 sm:gap-10 px-5 sm:px-10 py-3 sm:py-4 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl"
          >
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  onClick={onNavClick(item)}
                  className="flex items-center gap-2 text-[11px] sm:text-sm font-medium text-slate-400 hover:text-white transition-all group"
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform text-blue-500" />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-7 text-center">
            <h1 className="text-xs sm:text-sm font-bold tracking-widest text-blue-400/80 uppercase mb-2">
              {toolConfig.toolName}
            </h1>
            <div className="h-[2px] w-12 mx-auto bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </motion.div>
        </header>

        {/* Main Tool Card */}
        <main className="relative group" id="tool-main" data-section="main">
          <motion.div
            layout
            className="rounded-[32px] sm:rounded-[40px] border border-white/10 bg-slate-900/20 backdrop-blur-3xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            id="tool-hero"
            data-section="hero"
          >
            {/* Tabs */}
            <div className="flex justify-center border-b border-white/5 bg-white/[0.02]" data-section="tabs">
              <div className="flex gap-2 p-2" role="tablist" aria-label="tabs">
                {[
                  { id: 'tool' as const, label: 'ابزار محاسبه', icon: Grid },
                  { id: 'about' as const, label: 'راهنمای استفاده', icon: Info },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      writeHash(tab.id, 'push');
                      skipNextHashWriteRef.current = true;
                      setActiveTab(tab.id);
                      requestAnimationFrame(() => {
                        if (tab.id === 'about') scrollToId('about');
                        else scrollToId('tool-main');
                      });
                    }}
                    className={`relative flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 text-[13px] sm:text-sm font-bold transition-all z-10 ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    data-tab={tab.id}
                    id={`tab-${tab.id}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent rounded-t-xl -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabLine"
                        className="absolute bottom-0 left-4 right-4 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-10 py-10 sm:py-14 min-h-[420px] flex flex-col items-stretch justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                  id={activeTab === 'tool' ? 'tool-panel' : 'about-panel'}
                  data-panel={activeTab}
                  role="tabpanel"
                  aria-labelledby={activeTab === 'tool' ? 'tab-tool' : 'tab-about'}
                >
                  {activeTab === 'tool' ? (
                    <ToolPanel />
                  ) : (
                    <div className="space-y-5 sm:space-y-6 text-right" id="about" data-section="about">
                      {aboutCards.map((sec) => (
                        <section
                          key={sec.id}
                          id={sec.id}
                          data-about-section={sec.key}
                          className="rounded-3xl border border-white/5 bg-white/[0.02] px-5 sm:px-8 py-5 sm:py-7"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-sm sm:text-lg font-black text-white whitespace-nowrap">{sec.title}</h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                          </div>

                          {sec.body}
                        </section>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* Related */}
        <section className="mt-16 sm:mt-20" id="related">
          <div className="flex items-center gap-6 mb-7 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-black text-white whitespace-nowrap">ابزارهای مرتبط</h2>
            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {toolConfig.relatedTools.map((tool, idx) => {
              const Icon = tool.icon;
              const resolvedHref = resolveRelatedHref(tool.slug, tool.hrefFallback);

              return (
                <motion.a
                  key={idx}
                  href={resolvedHref}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(resolvedHref);
                  }}
                  whileHover={{ y: -8, backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                  className="group cursor-pointer rounded-[24px] bg-slate-900/40 border border-white/5 p-6 transition-all duration-300 hover:border-blue-500/30 block"
                  aria-label={tool.title}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Icon size={24} className={tool.colorClass} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
                    </div>

                    <ChevronLeft
                      size={16}
                      className="text-slate-600 group-hover:translate-x-[-4px] group-hover:text-blue-400 transition-all"
                    />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-20 sm:mt-24 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="text-lg font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              تخمینو
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest">ساده • شفاف • صادقانه</p>
          </div>

          <div className="flex gap-4">
            {[Twitter, Instagram, Facebook].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                aria-label="social"
              >
                <Icon size={20} />
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-600">تمامی حقوق برای تخمینو محفوظ است © ۲۰۲۴</div>
        </div>
      </footer>
    </div>
  );
}
