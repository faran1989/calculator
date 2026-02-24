// app/(light)/academy/_data/academy.data.tsx

import type { ReactNode } from "react";
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  BarChart2,
  Brain,
  ShieldCheck,
  Percent,
  Landmark,
  Home,
} from "lucide-react";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
export type Difficulty = "مبتدی" | "متوسط" | "پیشرفته";

export interface Category {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  count: number;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  difficulty: Difficulty;
  date: string;
  author: string;
  relatedTool?: string;
  relatedHref?: string;
  accent: string;
}

export interface Tool {
  label: string;
  description: string;
  icon: ReactNode;
  href: string;
  accent: string;
}

export interface Step {
  step: number;
  title: string;
  description: string;
  category: string;
  icon: ReactNode;
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
export function normalizeFA(str: string): string {
  return str
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  مبتدی: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  متوسط: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  پیشرفته: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

/* ─────────────────────────────────────────
   DATA (Single Source of Truth)
───────────────────────────────────────── */
export const CATEGORIES: Category[] = [
  { id: "inflation", label: "تورم", description: "اثر تورم بر قدرت خرید و دارایی", icon: <TrendingUp size={22} />, count: 14 },
  { id: "budget", label: "بودجه‌بندی", description: "مدیریت هوشمند درآمد و هزینه", icon: <PiggyBank size={22} />, count: 11 },
  { id: "loan", label: "وام", description: "محاسبه قسط، سود و هزینه واقعی بدهی", icon: <CreditCard size={22} />, count: 9 },
  { id: "invest", label: "سرمایه‌گذاری", description: "بورس، صندوق، طلا و انتخاب دارایی", icon: <BarChart2 size={22} />, count: 18 },
  { id: "behavior", label: "رفتار مالی", description: "تله‌های ذهنی و تصمیم‌گیری بهتر", icon: <Brain size={22} />, count: 8 },
  { id: "emergency", label: "صندوق اضطراری", description: "چگونه یک بالشتک مالی بسازیم", icon: <ShieldCheck size={22} />, count: 6 },
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "P/E چیست و چطور ازش استفاده کنیم؟",
    excerpt: "نسبت قیمت به درآمد یکی از پرکاربردترین معیارهای ارزیابی سهام است. یاد بگیرید چطور از آن در تصمیم‌گیری استفاده کنید.",
    category: "invest",
    readTime: "۸ دقیقه",
    difficulty: "متوسط",
    date: "۲۵ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "ابزارها",
    relatedHref: "/tools",
    accent: "#3B82F6",
  },
  {
    id: 2,
    title: "بودجه‌بندی با روش ۵۰/۳۰/۲۰",
    excerpt: "یک روش ساده و کاربردی برای مدیریت درآمد ماهانه‌تان که میلیون‌ها نفر در دنیا از آن استفاده می‌کنند.",
    category: "budget",
    readTime: "۶ دقیقه",
    difficulty: "مبتدی",
    date: "۲۲ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "برنامه‌ریز بودجه",
    relatedHref: "/tools/budget-planner",
    accent: "#10B981",
  },
  {
    id: 3,
    title: "تورم چگونه ارزش پول شما را می‌خورد؟",
    excerpt: "درک تورم و تأثیر آن بر قدرت خرید، اولین قدم برای حفظ ارزش دارایی‌هاست. اینجا ساده توضیح می‌دهیم.",
    category: "inflation",
    readTime: "۷ دقیقه",
    difficulty: "مبتدی",
    date: "۱۵ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "قدرت خرید",
    relatedHref: "/tools/purchasing-power",
    accent: "#F59E0B",
  },
  {
    id: 4,
    title: "صندوق‌های سرمایه‌گذاری مشترک: انواع و انتخاب",
    excerpt: "صندوق درآمد ثابت، سهامی یا مختلط؟ راهنمای انتخاب صندوق مناسب بر اساس هدف و ریسک‌پذیری شما.",
    category: "invest",
    readTime: "۱۲ دقیقه",
    difficulty: "متوسط",
    date: "۱۸ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#8B5CF6",
  },
  {
    id: 5,
    title: "چرا هر ماه پول‌ات تموم می‌شه؟",
    excerpt: "تله‌های ذهنی رایج که باعث می‌شوند بدون اینکه بدانیم پول را اشتباه خرج کنیم و راه‌حل‌های ساده برای خروج.",
    category: "behavior",
    readTime: "۹ دقیقه",
    difficulty: "مبتدی",
    date: "۱۲ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#EC4899",
  },
  {
    id: 6,
    title: "صندوق اضطراری: چقدر، کجا، چطور؟",
    excerpt: "یک بالشتک مالی چند ماهه اضطراری چیست، چرا به آن نیاز دارید و بهترین مکان برای نگهداری آن کجاست.",
    category: "emergency",
    readTime: "۸ دقیقه",
    difficulty: "مبتدی",
    date: "۱۰ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#10B981",
  },
  {
    id: 7,
    title: "هزینه واقعی وام را چطور محاسبه کنیم؟",
    excerpt: "بانک‌ها نرخ را ساده نشان می‌دهند، اما هزینه واقعی وام بسیار بیشتر از نرخ اسمی است. این مقاله روش محاسبه را یاد می‌دهد.",
    category: "loan",
    readTime: "۱۰ دقیقه",
    difficulty: "متوسط",
    date: "۸ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    relatedTool: "ماشین حساب وام",
    relatedHref: "/tools/loan-calculator",
    accent: "#F59E0B",
  },
  {
    id: 8,
    title: "سرمایه‌گذاری در طلا: فرصت یا تله؟",
    excerpt: "طلا در دوره‌های تورمی جذاب می‌شود اما آیا واقعاً بهترین گزینه برای حفظ ارزش پول شماست؟",
    category: "invest",
    readTime: "۱۱ دقیقه",
    difficulty: "متوسط",
    date: "۵ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#F59E0B",
  },
  {
    id: 9,
    title: "اثر لاته: هزینه‌های کوچک بزرگ می‌شوند",
    excerpt: "هزینه‌های جزئی روزانه در طول زمان به مبالغ بزرگی تبدیل می‌شوند. محاسبه کنید و تصمیم بگیرید.",
    category: "behavior",
    readTime: "۵ دقیقه",
    difficulty: "مبتدی",
    date: "۳ بهمن ۱۴۰۲",
    author: "تحریریه تخمینو",
    accent: "#EC4899",
  },
];

export const LEARNING_PATH: Step[] = [
  { step: 1, title: "صندوق اضطراری بساز", description: "قبل از هر سرمایه‌گذاری، ۳–۶ ماه هزینه زندگی را ذخیره کن", category: "emergency", icon: <ShieldCheck size={20} /> },
  { step: 2, title: "بودجه‌بندی را شروع کن", description: "با روش ۵۰/۳۰/۲۰ جریان پول ماهانه‌ات را کنترل کن", category: "budget", icon: <PiggyBank size={20} /> },
  { step: 3, title: "تورم را بشناس", description: "بفهم چرا نگه‌داشتن پول نقد ریسک دارد", category: "inflation", icon: <TrendingUp size={20} /> },
  { step: 4, title: "اولین سرمایه‌گذاری‌ات", description: "صندوق‌های درآمد ثابت، نقطه شروع مطمئن برای مبتدیان", category: "invest", icon: <BarChart2 size={20} /> },
  { step: 5, title: "رفتار مالی‌ات را بهبود بده", description: "تله‌های ذهنی را بشناس و تصمیمات آگاهانه‌تری بگیر", category: "behavior", icon: <Brain size={20} /> },
];

export const RELATED_TOOLS: Tool[] = [
  { label: "قدرت خرید / تورم", description: "اثر تورم روی ارزش پول", icon: <Percent size={20} />, href: "/tools/purchasing-power", accent: "#F59E0B" },
  { label: "ماشین حساب وام", description: "قسط واقعی بدهی را محاسبه کن", icon: <Landmark size={20} />, href: "/tools/loan-calculator", accent: "#3B82F6" },
  { label: "برنامه‌ریز بودجه", description: "درآمد و هزینه را مدیریت کن", icon: <Home size={20} />, href: "/tools/budget-planner", accent: "#10B981" },
];