// app/tools/registry/tools.registry.ts

export type ToolRegistryItem = {
  slug: string;
  path: string;
  title: string;
  shortDesc?: string;
  status?: 'live' | 'draft';
};

export const TOOLS_REGISTRY: ToolRegistryItem[] = [
  {
    slug: 'home-buy',
    path: '/tools/home-buy',
    title: 'چند سال دیگه می‌تونم خونه بخرم؟',
    shortDesc: 'تخمین زمان رسیدن به خرید خانه',
    status: 'live',
  },
  {
    slug: 'loan',
    path: '/tools/loan',
    title: 'محاسبه قسط وام',
    shortDesc: 'اقساط، جدول، هزینه نهایی',
    status: 'live',
  },
  {
    slug: 'gold-goal',
    path: '/tools/gold-goal',
    title: 'هدف طلا',
    shortDesc: 'تخمین رشد و مسیر رسیدن به هدف',
    status: 'live',
  },

  // ─────────────────────────────────────────────────────────────
  // ابزار جدید: ذائقه مالی
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'financial-taste',
    path: '/tools/financial-taste',
    title: 'ذائقه مالی',
    shortDesc: 'تحلیل شخصیت مالی، ریسک، خرج‌کردن و باورهای پولی',
    status: 'draft',
  },

  // روت واقعی وجود دارد، ولی ماهیتش تستی است (می‌تونی draft نگهش داری)
  {
    slug: 'test',
    path: '/tools/test',
    title: 'تست ابزار',
    shortDesc: 'صفحه تست',
    status: 'draft',
  },

  // تمپلیت نهایی تیره (همان صفحه‌ای که داریم استاندارد می‌کنیم)
  {
    slug: 'ui-test',
    path: '/tools/ui-test',
    title: 'تخمین هوشمند هزینه‌ها',
    shortDesc: 'تمپلیت نهایی تیره',
    status: 'draft',
  },
];

export function getToolPathBySlug(slug: string): string | null {
  const tool = TOOLS_REGISTRY.find((t) => t.slug === slug);
  return tool?.path || null;
}