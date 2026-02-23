// app/tools/financial-taste/lib/storage.ts
export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function ssGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<T>(window.sessionStorage.getItem(key));
}

export function ssSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function ssRemove(key: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}
