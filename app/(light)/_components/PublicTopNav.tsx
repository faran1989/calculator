"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BookOpen, Home, Info, Wrench } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const PUBLIC_NAV: NavItem[] = [
  { href: "/", label: "خانه", icon: <Home size={14} className="text-[#9CA3AF]" /> },
  { href: "/tools", label: "ابزارها", icon: <Wrench size={14} className="text-[#9CA3AF]" /> },
  { href: "/academy", label: "آکادمی", icon: <BookOpen size={14} className="text-emerald-400" /> },
  { href: "/about", label: "درباره", icon: <Info size={14} className="text-[#9CA3AF]" /> },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function PublicTopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {PUBLIC_NAV.map((it) => {
        const active = isNavActive(pathname, it.href);

        // ✅ آکادمی: دقیقاً همان استایل CTA سبز
        if (active && it.href === "/academy") {
          return (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/15"
            >
              آکادمی
            </Link>
          );
        }

        return (
          <Link
            key={it.href}
            href={it.href}
            className={[
              "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
              active
                ? "border-white/[0.14] bg-white/[0.07] text-white"
                : "border-white/[0.08] bg-white/[0.04] text-[#D1D5DB] hover:bg-white/[0.07]",
            ].join(" ")}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}