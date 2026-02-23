'use client';

export type LogToolRunPayload = {
  toolSlug: string;
  toolName: string;
  version: string;
  summary: string;
  rawData: unknown; // object recommended
};

export type LogToolRunResult =
  | { ok: true; status: number }
  | {
      ok: false;
      status: number;
      reason: 'unauthorized' | 'network' | 'server' | 'invalid';
      message?: string;
    };

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ _error: 'rawData_not_serializable', _type: typeof value });
  }
}

/**
 * Lightweight debug sink (no DevTools needed):
 * - If window.__TAKHMINO_TOOLRUN_DEBUG__ === true
 *   we persist last attempts into sessionStorage under:
 *   "takhmino:debug:toolrun:last"
 *   "takhmino:debug:toolrun:history"
 */
function debugWrite(entry: any) {
  try {
    const w = window as any;
    if (!w || w.__TAKHMINO_TOOLRUN_DEBUG__ !== true) return;

    const now = new Date().toISOString();
    const payload = { at: now, ...entry };

    sessionStorage.setItem('takhmino:debug:toolrun:last', safeJsonStringify(payload));

    const prevRaw = sessionStorage.getItem('takhmino:debug:toolrun:history');
    const prev = prevRaw ? (JSON.parse(prevRaw) as any[]) : [];
    prev.unshift(payload);
    sessionStorage.setItem('takhmino:debug:toolrun:history', safeJsonStringify(prev.slice(0, 20)));
  } catch {
    // ignore
  }
}

/**
 * logToolRun
 * - UI را نمی‌شکند (هیچ‌وقت throw نمی‌کند)
 * - با cookie-based auth کار می‌کند (credentials: 'include')
 * - Unauthorized را واضح برمی‌گرداند
 */
export async function logToolRun(payload: LogToolRunPayload): Promise<LogToolRunResult> {
  // اعتبارسنجی سبک سمت کلاینت
  if (!payload?.toolSlug || !payload?.toolName || !payload?.version || !payload?.summary) {
    debugWrite({
      stage: 'client-validate',
      ok: false,
      reason: 'invalid',
      message: 'Missing mandatory fields',
      received: {
        toolSlug: payload?.toolSlug,
        toolName: payload?.toolName,
        version: payload?.version,
        summary: payload?.summary ? '[present]' : '[missing]',
      },
    });
    return { ok: false, status: 0, reason: 'invalid', message: 'Missing mandatory fields' };
  }

  debugWrite({
    stage: 'before-fetch',
    toolSlug: payload.toolSlug,
    toolName: payload.toolName,
    version: payload.version,
    summaryPreview: payload.summary.slice(0, 80),
  });

  try {
    const res = await fetch('/api/tool-runs', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolSlug: payload.toolSlug,
        toolName: payload.toolName,
        version: payload.version,
        summary: payload.summary,
        rawData: payload.rawData,
      }),
    });

    if (res.status === 401 || res.status === 403) {
      debugWrite({ stage: 'after-fetch', ok: false, status: res.status, reason: 'unauthorized' });
      return { ok: false, status: res.status, reason: 'unauthorized', message: 'User not authenticated' };
    }

    if (!res.ok) {
      let msg: string | undefined;
      try {
        const data = await res.json();
        msg = typeof data?.error === 'string' ? data.error : undefined;
      } catch {
        // ignore
      }
      debugWrite({ stage: 'after-fetch', ok: false, status: res.status, reason: 'server', message: msg ?? 'Server error' });
      return { ok: false, status: res.status, reason: 'server', message: msg ?? 'Server error' };
    }

    debugWrite({ stage: 'after-fetch', ok: true, status: res.status });
    return { ok: true, status: res.status };
  } catch (e: any) {
    debugWrite({
      stage: 'after-fetch',
      ok: false,
      status: 0,
      reason: 'network',
      message: typeof e?.message === 'string' ? e.message : 'Network error',
    });
    return {
      ok: false,
      status: 0,
      reason: 'network',
      message: typeof e?.message === 'string' ? e.message : 'Network error',
    };
  }
}

/**
 * ابزار جلوگیری از لاگ تکراری (Idempotency) روی کلاینت با sessionStorage
 * - key را خودت می‌سازی (ترجیحاً بر اساس خروجی نهایی)
 */
export function hasLoggedInSession(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function markLoggedInSession(key: string): void {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // ignore
  }
}

/**
 * یک hash سبک برای ساخت key یکتا از خروجی نهایی
 * (cryptographic نیست؛ فقط برای جلوگیری از دوباره‌لاگ شدن)
 */
export function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

export function makeToolRunIdempotencyKey(args: {
  toolSlug: string;
  version: string;
  stableSignature: unknown; // بخشی از نتیجه که یکتا بودن را تعیین می‌کند
}): string {
  const base = safeJsonStringify({
    toolSlug: args.toolSlug,
    version: args.version,
    stableSignature: args.stableSignature,
  });
  return `takhmino:toolrun:logged:${args.toolSlug}:${args.version}:${simpleHash(base)}`;
}

/**
 * Helper to read debug without DevTools:
 * - Go to any tool page and run this in the URL bar as a bookmarklet or via console if you want:
 *   sessionStorage.getItem('takhmino:debug:toolrun:last')
 *
 * But you can also just open:
 *   about:blank
 * and paste:
 *   sessionStorage.getItem('takhmino:debug:toolrun:last')
 * in console.
 *
 * (We keep this comment only; no runtime impact.)
 */