"use client";

import { useEffect } from "react";

export default function NoBfcache() {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      // اگر از bfcache برگشته، یکبار ریلود کن تا auth دوباره از سرور چک بشه
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
