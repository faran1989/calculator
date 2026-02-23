'use client';

export type SaveToolRunPayload = {
  toolSlug: string;
  toolName: string;
  version?: number | string;
  summary?: string | null;
  rawData?: unknown; // object recommended
};

export type SaveToolRunResult =
  | { ok: true; status: number; id?: string }
  | {
      ok: false;
      status: number;
      reason: 'unauthorized' | 'network' | 'server' | 'invalid';
      message?: string;
    };

function safeJson(value: unknown) {
  try {
    // اگر قابل serialize بود همون رو برگردون
    JSON.stringify(value);
    return value;
  } catch {
    // اگر circular/BigInt/... بود، یک آبجکت امن بفرست
    return { _error: 'rawData_not_serializable', _type: typeof value };
  }
}

/**
 * saveToolRun (central / stable)
 * - برای همه ابزارها استفاده می‌شود
 * - هیچ‌وقت throw نمی‌کند (UI نشکند)
 * - cookie-based auth: credentials: 'include'
 * - خروجی استاندارد: ok/status/(id)
 */
export async function saveToolRun(payload: SaveToolRunPayload): Promise<SaveToolRunResult> {
  if (!payload?.toolSlug || !payload?.toolName) {
    return { ok: false, status: 0, reason: 'invalid', message: 'Missing toolSlug/toolName' };
  }

  try {
    const res = await fetch('/api/tool-runs', {
      method: 'POST',
      credentials: 'include', // ✅ خیلی مهم برای HttpOnly cookie
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        toolSlug: payload.toolSlug,
        toolName: payload.toolName,
        version:
          typeof payload.version === 'string'
            ? Number(payload.version) || 1
            : typeof payload.version === 'number'
              ? payload.version
              : 1,
        summary: payload.summary ?? null,
        rawData: safeJson(payload.rawData ?? {}),
      }),
    });

    // auth fail
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, reason: 'unauthorized', message: 'UNAUTHENTICATED' };
    }

    // server fail
    if (!res.ok) {
      let msg: string | undefined;
      try {
        const data = await res.json();
        msg = typeof data?.error === 'string' ? data.error : undefined;
      } catch {
        // ignore
      }
      return { ok: false, status: res.status, reason: 'server', message: msg ?? 'Server error' };
    }

    // success
    try {
      const data = await res.json();
      return { ok: true, status: res.status, id: typeof data?.id === 'string' ? data.id : undefined };
    } catch {
      // اگر body نداشت هم مشکلی نیست
      return { ok: true, status: res.status };
    }
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      reason: 'network',
      message: typeof e?.message === 'string' ? e.message : 'Network error',
    };
  }
}