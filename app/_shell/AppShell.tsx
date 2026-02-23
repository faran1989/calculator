// app/_shell/AppShell.tsx
import type { ReactNode } from 'react';
import PublicHeader from '@/app/_shell/public/PublicHeader';
import PublicFooter from '@/app/_shell/public/PublicFooter';

export type AppShellSurface = 'light' | 'dark';
export type AppShellChrome = 'none' | 'public';

type AppShellProps = {
  surface: AppShellSurface;
  children: ReactNode;
  className?: string;

  /**
   * ✅ پیش‌فرض "none" است تا هیچ صفحه‌ای دوبار هدر/فوتر نگیرد.
   * فقط layout ها chrome را روشن می‌کنند.
   */
  chrome?: AppShellChrome;
};

export default function AppShell({
  surface,
  children,
  className,
  chrome = 'none',
}: AppShellProps) {
  const base =
    surface === 'dark'
      ? 'min-h-dvh bg-gray-950 text-gray-100'
      : 'min-h-dvh bg-[#F5F7F6] text-gray-900';

  // ارتفاع هدر عمومی فعلی (تقریبی و قابل اصلاح)
  // اگر بعداً هدر را تغییر دادی، فقط همین توکن را عوض می‌کنی.
  const publicHeaderOffset = 'pt-16 md:pt-20';

  return (
    <div
      data-app-shell="1"
      data-surface={surface}
      data-chrome={chrome}
      className={[base, className].filter(Boolean).join(' ')}
    >
      {chrome === 'public' && <PublicHeader />}

      <main className={chrome === 'public' ? publicHeaderOffset : undefined}>
        {children}
      </main>

      {chrome === 'public' && <PublicFooter />}
    </div>
  );
}