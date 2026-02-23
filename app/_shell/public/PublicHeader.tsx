// app/_shell/public/PublicHeader.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';
import { Activity, Menu, X } from 'lucide-react';

/* ─────────────────────────────────────────────
   ✅ Magnetic Hover (همان نسخه صفحه اصلی)
───────────────────────────────────────────── */
type MagneticWrapperProps = {
  children: React.ReactNode;
  strength?: number;
};

const MagneticWrapper = ({ children, strength = 0.18 }: MagneticWrapperProps) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    if (reduceMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

export default function PublicHeader() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const menuItems = [
    { name: 'صفحه اصلی', href: '/' },
    { name: 'ابزارها', href: '/tools' },
    { name: 'آکادمی تخمینو', href: '/academy' },
    { name: 'درباره تخمینو', href: '/about' },
    { name: 'تماس با ما', href: '/contact' },
  ] as const;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* nav کاملاً شفافه — فقط کادر pill داخلش پس‌زمینه داره */}
      <nav className="fixed top-3 left-0 right-0 z-[100] px-3 sm:px-5 flex justify-center">
        <motion.div
          layout
          className={`
            relative border transition-all duration-500 rounded-[20px]
            w-full md:w-[80%]
            flex items-center justify-between gap-5
            px-4 sm:px-6
            py-3 sm:py-3
            md:py-3.5
            ${
              scrolled
                ? 'bg-white/80 backdrop-blur-2xl border-black/10 shadow-[0_16px_45px_rgba(0,0,0,0.10)]'
                : 'bg-white/60 backdrop-blur-xl border-black/8 shadow-[0_10px_34px_rgba(0,0,0,0.06)]'
            }
          `}
        >
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-9 h-9 bg-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
            >
              <Activity className="text-white w-5 h-5" />
            </motion.div>
            <span className="text-[#111827] font-black text-lg tracking-tighter">تخمینو</span>
          </Link>

          <div className="hidden md:flex items-center gap-9">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[14px] font-black transition-colors ${
                    active ? 'text-[#059669]' : 'text-gray-700 hover:text-[#059669]'
                  }`}
                >
                  {item.name}
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 bg-[#059669] rounded-full"
                    initial={false}
                    animate={{ width: active ? '100%' : '0%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.22 }}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <MagneticWrapper strength={0.18}>
              <Link
                href="/account"
                className="hidden sm:inline-flex bg-[#111827] text-white px-5 py-2 rounded-[16px] text-[13px] font-black hover:bg-[#059669] transition-all shadow-lg active:scale-95"
              >
                ثبت نام/ ورود
              </Link>
            </MagneticWrapper>

            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منو"
              aria-haspopup="dialog"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <motion.div
            className="absolute -bottom-2 right-0 h-[2px] bg-emerald-500 rounded-full"
            style={{ width: '100%', scaleX: progressScaleX, transformOrigin: 'right' }}
          />
        </motion.div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="منوی موبایل"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[#F5F7F6] p-5 flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center mb-7">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Activity className="text-[#059669]" />
                <span className="font-black text-base">تخمینو</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-white/60 backdrop-blur rounded-full border border-black/5"
                aria-label="بستن منو"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {menuItems.map((item, idx) => {
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.045 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-black transition-colors ${
                        active ? 'text-[#059669]' : 'text-gray-900 hover:text-[#059669]'
                      }`}
                    >
                      {item.name}
                    </Link>
                    {active && <div className="mt-2 h-1 w-14 bg-emerald-500 rounded-full" />}
                  </motion.div>
                );
              })}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-6 inline-flex w-full justify-center bg-[#059669] text-white py-3 rounded-[18px] font-black text-sm shadow-2xl"
                >
                  ثبت نام/ ورود
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
