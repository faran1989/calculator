// app/content/registry/content.registry.ts

import type {
  ContentId,
  ContentNode,
  ContentType,
  ToolNode,
  ArticleNode,
  GlossaryNode,
  PathNode,
  ScenarioNode,
  ChecklistNode,
} from './content.types';
import { makeId } from './content.types';

/**
 * ✅ Content Registry — Single Source of Truth
 * UI اجازه ندارد لینک‌ها را دستی بسازد.
 * هر چیزی که لازم داریم (Home + صفحات داخلی) از اینجا می‌آید.
 */

/* ─────────────────────────────────────────────
   نمونه نودهای واقعی (قابل گسترش)
───────────────────────────────────────────── */

// Tools
const toolPurchasingPower: ToolNode = {
  id: makeId('tool', 'purchasing-power'),
  type: 'tool',
  slug: 'purchasing-power',
  title: 'قدرت خرید در آینده',
  summary: 'اثر تورم روی قدرت خرید را با ورودی‌های ساده شفاف کن.',
  toolRoute: '/tools/purchasing-power',
  relations: {
    glossary: [makeId('glossary', 'inflation'), makeId('glossary', 'purchasing-power')],
    article: [makeId('article', 'inflation-basics')],
    path: [makeId('path', 'inflation')],
    scenario: [makeId('scenario', 'wage-growth-vs-inflation')],
  },
  ui: { badge: 'پایه', icon: 'BarChart3' },
  seo: {
    title: 'ابزار قدرت خرید | تخمینو',
    description: 'قدرت خریدت در سال‌های آینده را با سناریوهای تورم شفاف کن.',
    canonicalPath: '/tools/purchasing-power',
  },
  isPublished: true,
};

const toolLoan: ToolNode = {
  id: makeId('tool', 'loan'),
  type: 'tool',
  slug: 'loan',
  title: 'محاسبه‌گر وام',
  summary: 'قسط، سود، و تصویر واقعی بدهی را شفاف کن.',
  toolRoute: '/tools/loan',
  relations: {
    glossary: [makeId('glossary', 'compound-interest'), makeId('glossary', 'inflation')],
    article: [makeId('article', 'loan-basics')],
    checklist: [makeId('checklist', 'before-taking-loan')],
  },
  ui: { badge: 'کاربردی', icon: 'Landmark' },
  seo: {
    title: 'ابزار وام | تخمینو',
    description: 'محاسبه قسط و سناریوی بازپرداخت وام، بدون تحلیل بازار.',
    canonicalPath: '/tools/loan',
  },
  isPublished: true,
};

// Articles
const articleInflationBasics: ArticleNode = {
  id: makeId('article', 'inflation-basics'),
  type: 'article',
  slug: 'inflation-basics',
  title: 'تورم چیست و چرا قدرت خرید را تغییر می‌دهد؟',
  summary:
    'تورم را با مثال عددی و ساده بفهم؛ بدون شعار، بدون پیش‌بینی. فقط شفاف‌سازی داده.',
  articleRoute: '/academy/articles/inflation-basics',
  readingTimeMin: 8,
  relations: {
    glossary: [
      makeId('glossary', 'inflation'),
      makeId('glossary', 'purchasing-power'),
      makeId('glossary', 'real-income'),
    ],
    tool: [makeId('tool', 'purchasing-power')],
    path: [makeId('path', 'inflation')],
    scenario: [makeId('scenario', 'wage-growth-vs-inflation')],
  },
  ui: { badge: 'آموزشی', icon: 'BookOpen' },
  seo: {
    title: 'تورم چیست؟ | آکادمی تخمینو',
    description: 'تعریف تورم با مثال‌های واقعی و ارتباط مستقیم با قدرت خرید.',
    canonicalPath: '/academy/articles/inflation-basics',
  },
  isPublished: true,
};

const articleLoanBasics: ArticleNode = {
  id: makeId('article', 'loan-basics'),
  type: 'article',
  slug: 'loan-basics',
  title: 'وام را چطور درست بفهمیم؟',
  summary: 'وام فقط «قسط» نیست؛ بدهی، زمان، و تورم را با هم ببین.',
  articleRoute: '/academy/articles/loan-basics',
  readingTimeMin: 7,
  relations: {
    glossary: [makeId('glossary', 'compound-interest'), makeId('glossary', 'inflation')],
    tool: [makeId('tool', 'loan')],
    checklist: [makeId('checklist', 'before-taking-loan')],
  },
  ui: { badge: 'پایه', icon: 'BookOpen' },
  seo: {
    title: 'آموزش وام | آکادمی تخمینو',
    description: 'مدل ذهنی درست برای وام: سود، زمان، تورم، و ریسک.',
    canonicalPath: '/academy/articles/loan-basics',
  },
  isPublished: true,
};

// Glossary
const glossaryInflation: GlossaryNode = {
  id: makeId('glossary', 'inflation'),
  type: 'glossary',
  slug: 'inflation',
  term: 'تورم',
  title: 'تورم',
  summary: 'افزایش عمومی سطح قیمت‌ها که باعث کاهش قدرت خرید می‌شود.',
  glossaryRoute: '/academy/glossary/inflation',
  relations: {
    article: [makeId('article', 'inflation-basics')],
    tool: [makeId('tool', 'purchasing-power')],
    path: [makeId('path', 'inflation')],
    scenario: [makeId('scenario', 'wage-growth-vs-inflation')],
  },
  ui: { badge: 'واژه‌نامه', icon: 'BookOpen' },
  seo: {
    title: 'تورم چیست؟ | واژه‌نامه تخمینو',
    description: 'تعریف ساده تورم + مثال عددی + مسیر یادگیری مرتبط.',
    canonicalPath: '/academy/glossary/inflation',
  },
  isPublished: true,
};

const glossaryPurchasingPower: GlossaryNode = {
  id: makeId('glossary', 'purchasing-power'),
  type: 'glossary',
  slug: 'purchasing-power',
  term: 'قدرت خرید',
  title: 'قدرت خرید',
  summary: 'توان واقعی خرید کالا/خدمت؛ با تورم و رشد درآمد تغییر می‌کند.',
  glossaryRoute: '/academy/glossary/purchasing-power',
  relations: {
    article: [makeId('article', 'inflation-basics')],
    tool: [makeId('tool', 'purchasing-power')],
    path: [makeId('path', 'inflation')],
  },
  ui: { badge: 'واژه‌نامه', icon: 'BookOpen' },
  seo: {
    title: 'قدرت خرید چیست؟ | واژه‌نامه تخمینو',
    description: 'قدرت خرید یعنی چه و چطور با تورم تغییر می‌کند؟',
    canonicalPath: '/academy/glossary/purchasing-power',
  },
  isPublished: true,
};

const glossaryRealIncome: GlossaryNode = {
  id: makeId('glossary', 'real-income'),
  type: 'glossary',
  slug: 'real-income',
  term: 'درآمد واقعی',
  title: 'درآمد واقعی',
  summary: 'درآمد تعدیل‌شده با تورم؛ معیار بهتر از «عدد حقوق» برای قضاوت پیشرفت.',
  glossaryRoute: '/academy/glossary/real-income',
  relations: {
    article: [makeId('article', 'inflation-basics')],
    tool: [makeId('tool', 'purchasing-power')],
    path: [makeId('path', 'inflation')],
    scenario: [makeId('scenario', 'wage-growth-vs-inflation')],
  },
  ui: { badge: 'واژه‌نامه', icon: 'BookOpen' },
  seo: {
    title: 'درآمد واقعی چیست؟ | واژه‌نامه تخمینو',
    description: 'چرا رشد حقوق همیشه به معنی پیشرفت نیست؟ مفهوم درآمد واقعی.',
    canonicalPath: '/academy/glossary/real-income',
  },
  isPublished: true,
};

const glossaryCompoundInterest: GlossaryNode = {
  id: makeId('glossary', 'compound-interest'),
  type: 'glossary',
  slug: 'compound-interest',
  term: 'بهره مرکب',
  title: 'بهره مرکب',
  summary: 'سود روی سود؛ هم در سرمایه‌گذاری مهم است هم در بدهی/وام.',
  glossaryRoute: '/academy/glossary/compound-interest',
  relations: {
    article: [makeId('article', 'loan-basics')],
    tool: [makeId('tool', 'loan')],
    checklist: [makeId('checklist', 'before-taking-loan')],
  },
  ui: { badge: 'واژه‌نامه', icon: 'BookOpen' },
  seo: {
    title: 'بهره مرکب چیست؟ | واژه‌نامه تخمینو',
    description: 'تعریف بهره مرکب و اثرش روی بدهی و وام.',
    canonicalPath: '/academy/glossary/compound-interest',
  },
  isPublished: true,
};

// Scenario
const scenarioWageVsInflation: ScenarioNode = {
  id: makeId('scenario', 'wage-growth-vs-inflation'),
  type: 'scenario',
  slug: 'wage-growth-vs-inflation',
  title: 'اگر رشد حقوق کمتر از تورم باشد چه می‌شود؟',
  summary: 'سناریوی ساده برای فهم شکاف تورم و رشد درآمد؛ بدون پیش‌بینی.',
  scenarioRoute: '/lab/scenarios/wage-growth-vs-inflation',
  relations: {
    tool: [makeId('tool', 'purchasing-power')],
    article: [makeId('article', 'inflation-basics')],
    glossary: [
      makeId('glossary', 'inflation'),
      makeId('glossary', 'purchasing-power'),
      makeId('glossary', 'real-income'),
    ],
    path: [makeId('path', 'inflation')],
  },
  ui: { badge: 'Scenario Lab', icon: 'Sparkles' },
  seo: {
    title: 'سناریو رشد حقوق و تورم | تخمینو',
    description: 'با یک مثال عددی ببین اگر تورم جلوتر باشد چه اثری روی قدرت خرید می‌گذارد.',
    canonicalPath: '/lab/scenarios/wage-growth-vs-inflation',
  },
  isPublished: true,
};

// Checklist
const checklistBeforeLoan: ChecklistNode = {
  id: makeId('checklist', 'before-taking-loan'),
  type: 'checklist',
  slug: 'before-taking-loan',
  title: 'چک‌لیست قبل از گرفتن وام',
  summary: 'قبل از امضا کردن، این چند سؤال را از خودت بپرس.',
  checklistRoute: '/academy/checklists/before-taking-loan',
  items: [
    { text: 'جریان نقدی ماهانه‌ام چقدر است و حاشیه امن دارم؟' },
    { text: 'صندوق اضطراری دارم (حداقل ۳ تا ۶ ماه هزینه)؟' },
    { text: 'اگر درآمدم افت کند یا هزینه‌ام بالا برود چه می‌شود؟' },
    { text: 'هزینه واقعی وام (زمان + سود + فشار نقدی) را دیده‌ام؟' },
    { text: 'هدف وام (ضروری/سرمایه‌گذاری/مصرفی) مشخص است؟' },
  ],
  relations: {
    tool: [makeId('tool', 'loan')],
    article: [makeId('article', 'loan-basics')],
    glossary: [makeId('glossary', 'compound-interest'), makeId('glossary', 'inflation')],
  },
  ui: { badge: 'چک‌لیست', icon: 'ShieldCheck' },
  seo: {
    title: 'چک‌لیست قبل از وام | آکادمی تخمینو',
    description: 'چند سؤال کلیدی برای تصمیم بهتر درباره وام.',
    canonicalPath: '/academy/checklists/before-taking-loan',
  },
  isPublished: true,
};

// Learning Path
const pathInflation: PathNode = {
  id: makeId('path', 'inflation'),
  type: 'path',
  slug: 'inflation',
  title: 'مسیر یادگیری: درک تورم',
  summary: 'تورم را قدم‌به‌قدم بفهم و با ابزار و سناریو لمسش کن.',
  pathRoute: '/academy/paths/inflation',
  items: [
    makeId('glossary', 'inflation'),
    makeId('article', 'inflation-basics'),
    makeId('scenario', 'wage-growth-vs-inflation'),
    makeId('tool', 'purchasing-power'),
    makeId('glossary', 'real-income'),
  ],
  relations: {
    glossary: [makeId('glossary', 'inflation'), makeId('glossary', 'real-income')],
    article: [makeId('article', 'inflation-basics')],
    tool: [makeId('tool', 'purchasing-power')],
    scenario: [makeId('scenario', 'wage-growth-vs-inflation')],
  },
  ui: { badge: 'مسیر', icon: 'Compass' },
  seo: {
    title: 'مسیر یادگیری تورم | آکادمی تخمینو',
    description: 'یک مسیر کوتاه و عملی برای فهم تورم و اثرش روی قدرت خرید.',
    canonicalPath: '/academy/paths/inflation',
  },
  isPublished: true,
};

/* ─────────────────────────────────────────────
   Registry Map
───────────────────────────────────────────── */

const NODES: ContentNode[] = [
  toolPurchasingPower,
  toolLoan,
  articleInflationBasics,
  articleLoanBasics,
  glossaryInflation,
  glossaryPurchasingPower,
  glossaryRealIncome,
  glossaryCompoundInterest,
  scenarioWageVsInflation,
  checklistBeforeLoan,
  pathInflation,
];

/** Map اصلی */
export const CONTENT_REGISTRY: Record<ContentId, ContentNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
) as Record<ContentId, ContentNode>;

/* ─────────────────────────────────────────────
   Query Helpers (UI Consumer)
───────────────────────────────────────────── */

export function getNode(id: ContentId): ContentNode | null {
  return CONTENT_REGISTRY[id] ?? null;
}

export function mustGetNode(id: ContentId): ContentNode {
  const n = CONTENT_REGISTRY[id];
  if (!n) throw new Error(`[CONTENT_REGISTRY] Node not found: ${id}`);
  return n;
}

export function getNodesByType(type: ContentType): ContentNode[] {
  return Object.values(CONTENT_REGISTRY).filter((n) => n.type === type && n.isPublished !== false);
}

export function getRelated(nodeId: ContentId, targetType: ContentType): ContentNode[] {
  const node = mustGetNode(nodeId);
  const ids = node.relations?.[targetType] ?? [];
  return ids
    .map((id) => CONTENT_REGISTRY[id])
    .filter(Boolean)
    .filter((n) => n!.isPublished !== false) as ContentNode[];
}

/**
 * داده‌های صفحه اصلی (طبق اسکلت قفل‌شده)
 * - مسیرهای یادگیری (4 کارت بعداً)
 * - ابزارهای شاخص (4 ابزار)
 * - سناریوی شاخص
 * - مقاله هفته
 * - 4 واژه شاخص
 * - چک‌لیست شاخص
 */
export function getHomeFeatured() {
  return {
    paths: [pathInflation.id],
    tools: [toolPurchasingPower.id, toolLoan.id],
    scenario: scenarioWageVsInflation.id,
    articleOfWeek: articleInflationBasics.id,
    glossaryPicks: [
      glossaryInflation.id,
      glossaryPurchasingPower.id,
      glossaryRealIncome.id,
      glossaryCompoundInterest.id,
    ],
    checklistPick: checklistBeforeLoan.id,
  } as const;
}