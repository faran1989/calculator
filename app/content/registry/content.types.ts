// app/content/registry/content.types.ts

export type ContentType =
  | 'tool'
  | 'article'
  | 'glossary'
  | 'path'
  | 'scenario'
  | 'checklist';

export type ContentId = `${ContentType}:${string}`;

/** روابط استاندارد بین نودها (همه‌چیز data-driven) */
export type ContentRelations = Partial<Record<ContentType, ContentId[]>>;

export type SeoMeta = {
  title?: string;
  description?: string;
  canonicalPath?: string; // e.g. "/academy/..."
  ogImage?: string; // e.g. "/og/..."
};

export type UiMeta = {
  badge?: string; // e.g. "مبتدی"
  cover?: string; // e.g. "/images/..."
  icon?: string; // name token, optional (UI decides how to render)
};

export type ContentNodeBase = {
  id: ContentId; // ✅ type:slug
  type: ContentType;
  slug: string;
  title: string;
  summary: string;

  /** روابط مرکزی */
  relations: ContentRelations;

  /** UI + SEO */
  seo?: SeoMeta;
  ui?: UiMeta;

  /** کنترل‌های مدیریتی */
  isPublished?: boolean; // default true
  tags?: string[]; // optional taxonomy
};

export type ToolNode = ContentNodeBase & {
  type: 'tool';
  toolRoute: string; // e.g. "/tools/purchasing-power"
};

export type ArticleNode = ContentNodeBase & {
  type: 'article';
  articleRoute: string; // e.g. "/academy/articles/inflation-basics"
  readingTimeMin?: number;
};

export type GlossaryNode = ContentNodeBase & {
  type: 'glossary';
  term: string; // نمایش واژه
  glossaryRoute: string; // e.g. "/academy/glossary/inflation"
};

export type PathNode = ContentNodeBase & {
  type: 'path';
  pathRoute: string; // e.g. "/academy/paths/inflation"
  /** ترتیب آیتم‌های مسیر (IDها) */
  items: ContentId[];
};

export type ScenarioNode = ContentNodeBase & {
  type: 'scenario';
  scenarioRoute: string; // e.g. "/lab/scenarios/wage-vs-inflation"
};

export type ChecklistNode = ContentNodeBase & {
  type: 'checklist';
  checklistRoute: string; // e.g. "/academy/checklists/loan"
  items: { text: string }[];
};

export type ContentNode =
  | ToolNode
  | ArticleNode
  | GlossaryNode
  | PathNode
  | ScenarioNode
  | ChecklistNode;

/** Helper: ساخت ID استاندارد */
export function makeId(type: ContentType, slug: string): ContentId {
  return `${type}:${slug}` as ContentId;
}