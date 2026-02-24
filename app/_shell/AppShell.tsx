// app/_shell/AppShell.tsx
import type { ReactNode } from 'react';
import PublicHeader from '@/app/_shell/public/PublicHeader';
import PublicFooter from '@/app/_shell/public/PublicFooter';
import { getAuthUser } from '@/lib/auth/server';
import { getGravatarUrl } from '@/lib/gravatar';

export type AppShellSurface = 'light' | 'dark';
export type AppShellChrome = 'none' | 'public';

type AppShellProps = {
  surface: AppShellSurface;
  children: ReactNode;
  className?: string;
  chrome?: AppShellChrome;
};

export default async function AppShell({
  surface,
  children,
  className,
  chrome = 'none',
}: AppShellProps) {
  const base =
    surface === 'dark'
      ? 'min-h-dvh bg-gray-950 text-gray-100'
      : 'min-h-dvh bg-[#F5F7F6] text-gray-900';

  const publicHeaderOffset = 'pt-16 md:pt-20';

  // فقط وقتی chrome="public" هست user رو می‌خونیم
  let publicUser: { email: string; gravatarUrl: string; initials: string } | null = null;
  if (chrome === 'public') {
    const auth = await getAuthUser();
    if (auth) {
      publicUser = {
        email: auth.email,
        gravatarUrl: getGravatarUrl(auth.email, 40),
        initials: auth.email[0].toUpperCase(),
      };
    }
  }

  return (
    <div
      data-app-shell="1"
      data-surface={surface}
      data-chrome={chrome}
      className={[base, className].filter(Boolean).join(' ')}
    >
      {chrome === 'public' && <PublicHeader user={publicUser} />}

      <main className={chrome === 'public' ? publicHeaderOffset : undefined}>
        {children}
      </main>

      {chrome === 'public' && <PublicFooter />}
    </div>
  );
}
