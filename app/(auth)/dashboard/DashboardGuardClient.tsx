"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardGuardClient() {
  const router = useRouter();

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: {
          "cache-control": "no-store",
          pragma: "no-cache",
        },
      });

      if (!res.ok) {
        router.replace("/login");
        router.refresh();
        return;
      }

      const data = await res.json();
      if (!data?.ok) {
        router.replace("/login");
        router.refresh();
      }
    } catch {
      // اگر شبکه مشکل داشت، امن‌ترین کار اینه که اجازه نده داشبورد “نمایش داده شود”
      router.replace("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    // بار اول که داشبورد باز می‌شود
    checkSession();

    // وقتی با Back/Forward از BFCache برمی‌گردد
    const onPageShow = (e: PageTransitionEvent) => {
      if ((e as any).persisted) checkSession();
      else checkSession();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
