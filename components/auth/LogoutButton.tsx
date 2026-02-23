'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton({
  className,
  children,
  redirectTo = '/',
}: {
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // حتی اگر خطا شد، باز هم UI را به صفحه مقصد ببریم
    } finally {
      setLoading(false);
      router.replace(redirectTo);
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={onLogout} disabled={loading} className={className} aria-label="logout">
      {children ?? (loading ? 'در حال خروج...' : 'خروج')}
    </button>
  );
}
