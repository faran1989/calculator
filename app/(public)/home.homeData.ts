// app/(light)/home.homeData.ts
/**
 * Home data (Config-ish, non-breaking)
 * هدف: صفحه اصلی فقط "نمایش" بدهد و داده‌های Featured را از اینجا بگیرد.
 * این فایل هیچ وابستگی به DB/Prisma ندارد و کاملاً امن برای SSR/CSR است.
 */

export type HomeFeaturedTool = {
  key: string;
  title: string;
  toolRoute: string; // باید با "/" شروع شود
  badge?: string;
};

export type HomeFeaturedArticle = {
  key: string;
  title: string;
  articleRoute: string; // باید با "/" شروع شود
  badge?: string;
};

export type HomeFeaturedResolved = {
  tools?: HomeFeaturedTool[];
  articleOfWeek?: HomeFeaturedArticle;
};

const HOME_FEATURED: HomeFeaturedResolved = {
  tools: [
    {
      key: 'home-buy',
      title: 'ابزار «تملک مسکن»',
      toolRoute: '/tools/home-buy',
      badge: 'منتخب',
    },
    {
      key: 'loan',
      title: 'ابزار «اقساط و وام»',
      toolRoute: '/tools/loan',
    },
    {
      key: 'gold-goal',
      title: 'ابزار «هدف‌گذاری طلا»',
      toolRoute: '/tools/gold-goal',
    },
  ],
  articleOfWeek: {
    key: 'week-1',
    title: 'مقاله هفته: تورم را چطور ساده بفهمیم؟',
    // مسیر فعلی آکادمی شما این شکلی است: /academy/articles/[id]
    // پس اینجا فقط یک id ثابت می‌دهیم تا لینک کار کند.
    articleRoute: '/academy/articles/week-1',
    badge: 'هفته',
  },
};

function safeRoute(href: string, fallback: string) {
  if (typeof href !== 'string') return fallback;
  const trimmed = href.trim();
  if (!trimmed.startsWith('/')) return fallback;
  return trimmed;
}

/**
 * ✅ همین تابعی که HomeClient صدا می‌زند.
 * - خروجی را نرمال می‌کند تا هیچ‌وقت لینک خراب (بدون /) ندهیم.
 */
export function getHomeFeaturedResolved(): HomeFeaturedResolved {
  const tools = HOME_FEATURED.tools?.map((t) => ({
    ...t,
    toolRoute: safeRoute(t.toolRoute, '/tools'),
  }));

  const articleOfWeek = HOME_FEATURED.articleOfWeek
    ? {
        ...HOME_FEATURED.articleOfWeek,
        articleRoute: safeRoute(HOME_FEATURED.articleOfWeek.articleRoute, '/academy'),
      }
    : undefined;

  return { tools, articleOfWeek };
}