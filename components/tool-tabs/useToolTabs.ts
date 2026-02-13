// File: calculator/components/tool-tabs/useToolTabs.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type TabKey = 'tool' | 'about';
export type ToolTabKey = TabKey;

type Options = {
  basePath?: string;        // e.g. '/tools/loan'
  defaultTab?: TabKey;      // default: 'tool'
  toolHash?: string;        // default: '#tool'
  aboutHash?: string;       // default: '#about'
};

function normalizeHash(h: string) {
  const x = (h || '').trim();
  if (!x) return '';
  return x.startsWith('#') ? x.toLowerCase() : `#${x.toLowerCase()}`;
}

function getTabFromLocation(opts: Required<Options>): TabKey {
  if (typeof window === 'undefined') return opts.defaultTab;

  const hash = normalizeHash(window.location.hash || '');
  if (hash === normalizeHash(opts.aboutHash)) return 'about';
  if (hash === normalizeHash(opts.toolHash)) return 'tool';
  return opts.defaultTab;
}

export function useToolTabs(options?: Options) {
  const opts = useMemo<Required<Options>>(
    () => ({
      basePath: options?.basePath ?? '',
      defaultTab: options?.defaultTab ?? 'tool',
      toolHash: options?.toolHash ?? '#tool',
      aboutHash: options?.aboutHash ?? '#about',
    }),
    [options?.basePath, options?.defaultTab, options?.toolHash, options?.aboutHash]
  );

  // ✅ init بدون useEffect (برای جلوگیری از setState در effect)
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromLocation(opts));

  const setTab = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);

      if (typeof window === 'undefined') return;

      const nextHash = tab === 'about' ? normalizeHash(opts.aboutHash) : normalizeHash(opts.toolHash);

      // اگر همین الان همان hash است، دوباره push نکن
      if (normalizeHash(window.location.hash || '') === nextHash) return;

      // اگر basePath داده شد، همان را نگه دار (برای پروژه‌هایی که route ثابت دارند)
      const url = opts.basePath ? `${opts.basePath}${nextHash}` : `${nextHash}`;
      window.history.pushState(null, '', url);
    },
    [opts.aboutHash, opts.basePath, opts.toolHash]
  );

  const goToAboutAndScroll = useCallback(() => {
    setTab('about');

    // اسکرول نرم به سکشن about (اگر وجود داشته باشد)
    if (typeof window === 'undefined') return;

    // اول تلاش برای پیدا کردن id=about
    const el =
      document.getElementById('about') ||
      document.querySelector('[data-about]') ||
      document.querySelector('#tool-about') ||
      null;

    if (el && 'scrollIntoView' in el) {
      // یک tick بعد از تغییر تب، تا DOM آماده شود
      window.requestAnimationFrame(() => {
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [setTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromLocation = () => {
      const next = getTabFromLocation(opts);
      setActiveTab((prev) => (prev === next ? prev : next));
    };

    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);

    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [opts]);

  return {
    activeTab,
    setActiveTab: setTab, // سازگاری با جاهایی که setActiveTab می‌خوان
    setTab,               // سازگاری با ToolTabsShell
    goToAboutAndScroll,   // سازگاری با ToolTabsShell
  };
}
