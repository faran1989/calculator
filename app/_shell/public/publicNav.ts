// app/_shell/public/publicNav.ts

export const PUBLIC_TOP_MENU = [
  { key: "home", label: "صفحه اصلی", href: "/" },
  { key: "tools", label: "ابزارها", href: "/tools" },
  { key: "academy", label: "آکادمی", href: "/academy" },
  { key: "pricing", label: "تعرفه‌ها", href: "/pricing" },
  { key: "blog", label: "بلاگ", href: "/blog" },
  { key: "about", label: "درباره ما", href: "/about" },
] as const;

export type PublicTopMenuItem = (typeof PUBLIC_TOP_MENU)[number];
export type PublicTopMenuKey = PublicTopMenuItem["key"];

/**
 * اکتیو کردن آیتم منو بر اساس pathname فعلی
 * - exact: فقط همان مسیر
 * - startsWith: برای زیرمسیرها (مثل /tools/loan)
 */
export function isPublicMenuActive(href: string, pathname: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}