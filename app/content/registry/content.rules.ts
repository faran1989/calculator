// app/content/registry/content.rules.ts

import type { ContentId, ContentNode, ContentType, PathNode } from './content.types';
import { CONTENT_REGISTRY, mustGetNode } from './content.registry';

/**
 * ✅ Validation Rules (Enterprise Guard)
 * این فایل «قانون» است.
 * اگر محتوا رشد کرد، اینجا تضمین می‌کنیم هیچ نودِ یتیم یا بی‌اتصال نماند.
 */

type Issue = {
  level: 'error' | 'warn';
  code: string;
  nodeId: ContentId;
  message: string;
};

function exists(id: ContentId): boolean {
  return Boolean(CONTENT_REGISTRY[id]);
}

function rel(node: ContentNode, t: ContentType): ContentId[] {
  return (node.relations?.[t] ?? []) as ContentId[];
}

function addIssue(issues: Issue[], level: Issue['level'], code: string, nodeId: ContentId, message: string) {
  issues.push({ level, code, nodeId, message });
}

/** شمارش روابط */
function count(node: ContentNode, type: ContentType): number {
  return rel(node, type).length;
}

/** بررسی یکتایی ID */
function validateUniqueIds(issues: Issue[]) {
  const ids = Object.keys(CONTENT_REGISTRY);
  const set = new Set(ids);
  if (set.size !== ids.length) {
    // در عمل چون map است، تکراری‌ها overwrite می‌شوند؛ اما اینجا هشدار می‌دیم
    addIssue(
      issues,
      'error',
      'REGISTRY_DUPLICATE_ID',
      'tool:purchasing-power',
      'Duplicate IDs detected in registry (some nodes may have been overwritten).',
    );
  }
}

/** بررسی اینکه همه relation ها به نود معتبر اشاره می‌کنند */
function validateRelationsExist(issues: Issue[]) {
  for (const node of Object.values(CONTENT_REGISTRY)) {
    for (const [t, ids] of Object.entries(node.relations ?? {})) {
      for (const id of ids as ContentId[]) {
        if (!exists(id)) {
          addIssue(
            issues,
            'error',
            'RELATION_TARGET_NOT_FOUND',
            node.id,
            `Relation points to missing node: ${String(t)} -> ${id}`,
          );
        }
      }
    }
  }
}

/** قوانین نوعی */
function validateTypeRules(issues: Issue[]) {
  for (const node of Object.values(CONTENT_REGISTRY)) {
    if (node.isPublished === false) continue;

    switch (node.type) {
      case 'glossary': {
        if (count(node, 'article') < 1)
          addIssue(issues, 'error', 'GLOSSARY_NEEDS_ARTICLE', node.id, 'Glossary must link to at least 1 article.');
        if (count(node, 'tool') < 1)
          addIssue(issues, 'error', 'GLOSSARY_NEEDS_TOOL', node.id, 'Glossary must link to at least 1 tool.');
        if (count(node, 'path') < 1)
          addIssue(issues, 'warn', 'GLOSSARY_RECOMMEND_PATH', node.id, 'Glossary should belong to at least 1 path.');
        break;
      }

      case 'article': {
        const g = count(node, 'glossary');
        if (g < 2)
          addIssue(issues, 'error', 'ARTICLE_NEEDS_GLOSSARY_MIN', node.id, 'Article must link to at least 2 glossary terms.');
        if (g > 4)
          addIssue(issues, 'warn', 'ARTICLE_GLOSSARY_MAX', node.id, 'Article usually should not exceed 4 glossary links.');
        if (count(node, 'tool') < 1)
          addIssue(issues, 'warn', 'ARTICLE_RECOMMEND_TOOL', node.id, 'Article should link to at least 1 related tool.');
        break;
      }

      case 'tool': {
        if (count(node, 'glossary') < 2)
          addIssue(issues, 'error', 'TOOL_NEEDS_GLOSSARY', node.id, 'Tool must link to at least 2 glossary terms.');
        if (count(node, 'article') < 1)
          addIssue(issues, 'error', 'TOOL_NEEDS_ARTICLE', node.id, 'Tool must link to at least 1 article.');
        break;
      }

      case 'scenario': {
        if (count(node, 'tool') < 1)
          addIssue(issues, 'error', 'SCENARIO_NEEDS_TOOL', node.id, 'Scenario must link to at least 1 tool.');
        if (count(node, 'article') < 1)
          addIssue(issues, 'error', 'SCENARIO_NEEDS_ARTICLE', node.id, 'Scenario must link to at least 1 article.');
        if (count(node, 'glossary') < 1)
          addIssue(issues, 'error', 'SCENARIO_NEEDS_GLOSSARY', node.id, 'Scenario must link to at least 1 glossary term.');
        break;
      }

      case 'path': {
        const p = node as PathNode;
        const len = p.items?.length ?? 0;
        if (len < 3 || len > 6)
          addIssue(issues, 'error', 'PATH_ITEMS_RANGE', node.id, 'Path must have 3 to 6 items.');
        const hasTool = (p.items ?? []).some((id) => id.startsWith('tool:'));
        if (!hasTool)
          addIssue(issues, 'error', 'PATH_NEEDS_TOOL', node.id, 'Path must include at least 1 tool item.');
        // items must exist
        for (const id of p.items ?? []) {
          if (!exists(id)) addIssue(issues, 'error', 'PATH_ITEM_NOT_FOUND', node.id, `Path item missing: ${id}`);
        }
        break;
      }

      case 'checklist': {
        // Checklist آزادتر است، ولی بهتر است حداقل یک اتصال داشته باشد
        const totalLinks =
          count(node, 'tool') +
          count(node, 'article') +
          count(node, 'glossary') +
          count(node, 'path') +
          count(node, 'scenario');
        if (totalLinks < 1)
          addIssue(issues, 'warn', 'CHECKLIST_RECOMMEND_LINKS', node.id, 'Checklist should link to at least 1 related node.');
        break;
      }
    }
  }
}

/** بررسی تقارن ساده (اختیاری اما مفید): اگر A به B لینک داد، B هم بهتر است به A لینک بدهد */
function validateSoftReciprocity(issues: Issue[]) {
  for (const node of Object.values(CONTENT_REGISTRY)) {
    if (node.isPublished === false) continue;

    const outgoing = node.relations ?? {};
    for (const [t, ids] of Object.entries(outgoing)) {
      for (const targetId of (ids ?? []) as ContentId[]) {
        const target = CONTENT_REGISTRY[targetId];
        if (!target || target.isPublished === false) continue;

        // اگر node به target لینک داد، انتظار داریم target هم حداقل در یکی از دسته‌ها به node اشاره کند
        const backRefs = Object.values(target.relations ?? {}).flat() as ContentId[];
        const hasBack = backRefs.includes(node.id);

        if (!hasBack) {
          addIssue(
            issues,
            'warn',
            'SOFT_RECIPROCITY',
            node.id,
            `Consider adding back-reference: ${node.id} -> ${targetId} (but no backlink from target).`,
          );
        }
      }
    }
  }
}

/**
 * ✅ تابع اصلی برای اجرا در dev (مثلاً داخل page های dev یا یک script)
 * - errors: باید جدی گرفته شود
 * - warns: پیشنهاد برای کیفیت بهتر
 */
export function validateRegistry() {
  const issues: Issue[] = [];

  validateUniqueIds(issues);
  validateRelationsExist(issues);
  validateTypeRules(issues);
  validateSoftReciprocity(issues);

  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');

  return {
    ok: errors.length === 0,
    errors,
    warns,
  };
}

/** ابزار کمکی: چاپ سریع نتیجه در کنسول */
export function logRegistryValidation() {
  const res = validateRegistry();
  // eslint-disable-next-line no-console
  console.log(`[ContentRegistry] ok=${res.ok} errors=${res.errors.length} warns=${res.warns.length}`);

  if (res.errors.length) {
    // eslint-disable-next-line no-console
    console.error('Errors:', res.errors);
  }
  if (res.warns.length) {
    // eslint-disable-next-line no-console
    console.warn('Warns:', res.warns);
  }
}

/** Quick helper: اگر خواستی جایی سخت‌گیرانه نود را بگیری */
export function mustNode(id: ContentId) {
  return mustGetNode(id);
}