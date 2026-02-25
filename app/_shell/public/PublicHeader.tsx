// app/_shell/public/PublicHeader.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';
import { Activity, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import AuthModal from './AuthModal';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type AuthUser = {
  email: string;
  name?: string;
  gravatarUrl: string;
  initials: string;
} | null;

type Props = {
  user?: AuthUser;
};

/* ─────────────────────────────────────────────
   Magnetic Hover
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

/* ─────────────────────────────────────────────
   Avatar (Gravatar with initials fallback)
───────────────────────────────────────────── */
function Avatar({ user, size = 36 }: { user: NonNullable<AuthUser>; size?: number }) {
  const [imgError, setImgError] = useState(false);
  return imgError ? (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm select-none"
    >
      {user.initials}
    </div>
  ) : (
    <img
      src={user.gravatarUrl}
      alt={user.email}
      width={size}
      height={size}
      className="rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  );
}

/* ─────────────────────────────────────────────
   User Dropdown Menu
───────────────────────────────────────────── */
function UserMenu({ user }: { user: NonNullable<AuthUser> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-[14px] hover:bg-black/5 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar user={user} size={32} />
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-xl overflow-hidden z-50"
            dir="rtl"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-black/6">
              {user.name && (
                <p className="text-sm font-bold text-gray-800 truncate">سلام {user.name} 👋</p>
              )}
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>

            <div className="py-1.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                داشبورد
              </Link>

              <button
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main PublicHeader
───────────────────────────────────────────── */
export default function PublicHeader({ user = null }: Props) {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

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
          {/* Logo */}
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

          {/* Desktop Nav */}
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

          {/* Desktop CTA */}
          <div className="flex items-center gap-2.5">
            {user ? (
              /* ── logged-in: avatar dropdown ── */
              <div className="hidden sm:block">
                <UserMenu user={user} />
              </div>
            ) : (
              /* ── guest: login / register ── */
              <div className="hidden sm:flex items-center gap-2">
                <MagneticWrapper strength={0.18}>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="inline-flex bg-white text-[#111827] border border-black/10 px-4 py-2 rounded-[16px] text-[13px] font-black hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                  >
                    ورود
                  </button>
                </MagneticWrapper>
                <MagneticWrapper strength={0.18}>
                  <button
                    onClick={() => setAuthModal('register')}
                    className="inline-flex bg-[#111827] text-white px-4 py-2 rounded-[16px] text-[13px] font-black hover:bg-[#059669] transition-all shadow-lg active:scale-95"
                  >
                    ثبت‌نام
                  </button>
                </MagneticWrapper>
              </div>
            )}

            {/* Mobile hamburger */}
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

          {/* Scroll progress bar */}
          <motion.div
            className="absolute -bottom-2 right-0 h-[2px] bg-emerald-500 rounded-full"
            style={{ width: '100%', scaleX: progressScaleX, transformOrigin: 'right' }}
          />
        </motion.div>
      </nav>

      {/* Mobile Drawer */}
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

              {/* Mobile auth section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="mt-6"
              >
                {user ? (
                  /* ── logged-in mobile ── */
                  <div className="flex flex-col gap-2" dir="rtl">
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                      <Avatar user={user} size={40} />
                      <div className="min-w-0">
                        {user.name && (
                          <p className="text-sm font-bold text-gray-800 truncate">سلام {user.name} 👋</p>
                        )}
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-[18px] font-black text-sm bg-white border border-black/10 text-[#111827]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      داشبورد من
                    </Link>
                    <form action="/api/auth/logout" method="POST">
                      <button
                        type="submit"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-3 py-3 px-4 rounded-[18px] font-black text-sm bg-red-50 border border-red-100 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        خروج از حساب
                      </button>
                    </form>
                  </div>
                ) : (
                  /* ── guest mobile ── */
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMobileMenuOpen(false); setAuthModal('login'); }}
                      className="flex-1 py-3 rounded-[18px] font-black text-sm border border-black/10 bg-white text-[#111827]"
                    >
                      ورود
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setAuthModal('register'); }}
                      className="flex-1 py-3 rounded-[18px] font-black text-sm bg-[#059669] text-white shadow-lg"
                    >
                      ثبت‌نام
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {authModal && (
        <AuthModal
          initialTab={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
