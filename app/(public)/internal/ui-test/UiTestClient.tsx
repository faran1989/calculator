'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  BookOpen,
  Info,
  Facebook,
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toolConfig } from './tool.config';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
});

type TabKey = 'tool' | 'about';

type MenuItem = {
  slug: 'home' | 'tools' | 'learn' | 'about';
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type FaqItem = { q: string; a: string };

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden" key={i} data-faq-item>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-right"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-sm text-slate-200">{item.q}</span>
              {isOpen ? (
                <ChevronUp size={18} className="text-slate-400" />
              ) : (
                <ChevronDown size={18} className="text-slate-500" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 sm:px-5 pb-4"
                >
                  <div className="text-slate-400 text-sm leading-relaxed">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function UiTestClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('tool');

  // --- Hash Routing / History ---
  const skipNextHashWriteRef = useRef(false);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const readHash = (): TabKey | null => {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (hash === 'about') return 'about';
    if (hash === 'tool') return 'tool';
    return null;
  };

  const writeHash = (next: TabKey, mode: 'replace' | 'push') => {
    const nextHash = next === 'about' ? '#about' : '#tool';
    if (window.location.hash === nextHash) return;

    if (mode === 'push') history.pushState(null, '', nextHash);
    else history.replaceState(null, '', nextHash);
  };

  const applyTabFromHash = (shouldScroll: boolean) => {
    const tab = readHash();
    if (!tab) return;

    skipNextHashWriteRef.current = true;
    setActiveTab(tab);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        if (tab === 'about') scrollToId('about');
        else scrollToId('tool-main');
      });
    }
  };

  useEffect(() => {
    if (!readHash()) writeHash('tool', 'replace');

    applyTabFromHash(true);

    const onHashChange = () => applyTabFromHash(true);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (skipNextHashWriteRef.current) {
      skipNextHashWriteRef.current = false;
      return;
    }
    writeHash(activeTab, 'replace');
  }, [activeTab]);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { slug: 'home', href: toolConfig.navRoutes.home, label: 'تخمینو', icon: Home },
      { slug: 'tools', href: toolConfig.navRoutes.tools, label: 'ابزارها', icon: Grid },
      { slug: 'learn', href: toolConfig.navRoutes.learn, label: 'یاد بگیر', icon: BookOpen },
      { slug: 'about', href: '#about', label: 'درباره', icon: Info },
    ],
    []
  );

  const onNavClick = (item: MenuItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = item.href;

    if (href.startsWith('#')) {
      e.preventDefault();

      if (href === '#about') {
        history.pushState(null, '', '#about');
        skipNextHashWriteRef.current = true;
        setActiveTab('about');
        requestAnimationFrame(() => scrollToId('about'));
        return;
      }

      if (href === '#tool') {
        history.pushState(null, '', '#tool');
        skipNextHashWriteRef.current = true;
        setActiveTab('tool');
        requestAnimationFrame(() => scrollToId('tool-main'));
        return;
      }

      history.pushState(null, '', href);
      return;
    }

    if (href.startsWith('/')) {
      e.preventDefault();
      router.push(href);
      return;
    }
  };

  const resolveRelatedHref = (slug: string, fallbackHref: string) => {
    return toolConfig.relatedRouteMap[slug] || fallbackHref || '/tools';
  };

  const faqItems = useMemo<FaqItem[]>(() => {
    const sec = toolConfig.aboutSections.find((s) => s.key === 'faq');
    if (!sec || sec.type !== 'faq') return [];
    return sec.items;
  }, []);

  const aboutCards = useMemo(() => {
    return toolConfig.aboutSections.map((sec) => {
      let body: React.ReactNode = null;

      if (sec.type === 'text') {
        body = <p className="text-slate-400 leading-relaxed">{sec.text}</p>;
      } else if (sec.type === 'bullets') {
        body = (
          <ul className="space-y-3">
            {sec.bullets.map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t}
              </li>
            ))}
          </ul>
        );
      } else if (sec.type === 'faq') {
        body = <FaqAccordion items={sec.items} />;
      }

      return {
        id: `about-${sec.key}`,
        key: sec.key,
        title: sec.title,
        body,
      };
    });
  }, []);

  return (
    <div
      className={`${vazirmatn.className} relative min-h-screen overflow-x-hidden bg-[#020617] text-slate-200 select-none`}
      dir="rtl"
      data-page="tool"
      data-tool-slug={toolConfig.slug}
    >
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col items-center mb-16" id="tool-header" data-section="header">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-4 sm:gap-10 px-6 sm:px-10 py-4 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl"
          >
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  onClick={onNavClick(item)}
                  className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-all group"
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform text-blue-500" />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <h1 className="text-sm font-bold tracking-widest text-blue-400/80 uppercase mb-2">
              {toolConfig.toolName}
            </h1>
            <div className="h-[2px] w-12 mx-auto bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </motion.div>
        </header>

        {/* Main Tool Card */}
        <main className="relative group" id="tool-main" data-section="main">
          <motion.div
            layout
            className="rounded-[40px] border border-white/10 bg-slate-900/20 backdrop-blur-3xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            id="tool-hero"
            data-section="hero"
          >
            {/* Tabs */}
            <div className="flex justify-center border-b border-white/5 bg-white/[0.02]" data-section="tabs">
              <div className="flex gap-2 p-2" role="tablist" aria-label="tabs">
                {[
                  { id: 'tool' as const, label: 'ابزار محاسبه', icon: Grid },
                  { id: 'about' as const, label: 'راهنمای استفاده', icon: Info },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      writeHash(tab.id, 'push');
                      skipNextHashWriteRef.current = true;
                      setActiveTab(tab.id);
                      requestAnimationFrame(() => {
                        if (tab.id === 'about') scrollToId('about');
                        else scrollToId('tool-main');
                      });
                    }}
                    className={`relative flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all z-10 ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    data-tab={tab.id}
                    id={`tab-${tab.id}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent rounded-t-xl -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabLine"
                        className="absolute bottom-0 left-4 right-4 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-16 sm:px-12 min-h-[400px] flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className={activeTab === 'about' ? 'w-full max-w-5xl self-stretch' : 'max-w-2xl'}
                  id={activeTab === 'tool' ? 'tool-panel' : 'about-panel'}
                  data-panel={activeTab}
                  role="tabpanel"
                  aria-labelledby={activeTab === 'tool' ? 'tab-tool' : 'tab-about'}
                >
                  {activeTab === 'tool' ? (
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-inner">
                        <Grid className="text-blue-500" size={32} />
                      </div>

                      <h2 className="text-2xl font-black text-white">آماده شروع محاسبه هستید؟</h2>

                      <p className="text-slate-400 leading-relaxed">
                        پارامترهای مورد نظر خود را در فیلدهای مربوطه وارد کنید تا تخمینو دقیق‌ترین تحلیل را برای شما انجام دهد.
                      </p>

                      <button
                        type="button"
                        className="mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                      >
                        شروع فرآیند تخمین
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 text-right" id="about" data-section="about">
                      {aboutCards.map((sec) => (
                        <section
                          key={sec.id}
                          id={sec.id}
                          data-about-section={sec.key}
                          className="rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-6 sm:px-8 sm:py-7"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-base sm:text-lg font-black text-white whitespace-nowrap">
                              {sec.title}
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                          </div>

                          {sec.body}
                        </section>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* Related */}
        <section className="mt-20" id="related">
          <div className="flex items-center gap-6 mb-8">
            <h2 className="text-xl font-black text-white whitespace-nowrap">ابزارهای مرتبط</h2>
            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {toolConfig.relatedTools.map((tool, idx) => {
              const Icon = tool.icon;
              const resolvedHref = resolveRelatedHref(tool.slug, tool.hrefFallback);

              return (
                <motion.a
                  key={idx}
                  href={resolvedHref}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(resolvedHref);
                  }}
                  whileHover={{ y: -8, backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                  className="group cursor-pointer rounded-[24px] bg-slate-900/40 border border-white/5 p-6 transition-all duration-300 hover:border-blue-500/30 block"
                  aria-label={tool.title}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Icon size={24} className={tool.colorClass} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
                    </div>

                    <ChevronLeft
                      size={16}
                      className="text-slate-600 group-hover:translate-x-[-4px] group-hover:text-blue-400 transition-all"
                    />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="text-lg font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              تخمینو
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest">ساده • شفاف • صادقانه</p>
          </div>

          <div className="flex gap-4">
            {[Twitter, Instagram, Facebook].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                aria-label="social"
              >
                <Icon size={20} />
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-600">تمامی حقوق برای تخمینو محفوظ است © ۲۰۲۴</div>
        </div>
      </footer>
    </div>
  );
}
