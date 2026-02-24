// app/tools/financial-taste/lib/format.ts
export function toPersianDigits(input: string | number) {
  const s = String(input);
  const map: Record<string, string> = {
    "0": "۰","1": "۱","2": "۲","3": "۳","4": "۴",
    "5": "۵","6": "۶","7": "۷","8": "۸","9": "۹",
  };
  return s.replace(/[0-9]/g, (d) => map[d] ?? d);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
