'use client';

import React, { ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import ToolTabsShell from './ToolTabsShell';
import type { ToolTabKey } from './useToolTabs';

type ToolTabsProps = {
  tool:
    | ReactNode
    | ((api: {
        goToAboutAndScroll: (targetId: string) => void;
        setTab: (tab: ToolTabKey) => void;
      }) => ReactNode);

  about: ReactNode;

  toolLabel?: string;
  aboutLabel?: string;
  aboutHash?: string;

  variant?: 'light' | 'dark';
};

export default function ToolTabs({
  tool,
  about,
  toolLabel = 'ابزار',
  aboutLabel = 'درباره این تخمین',
  aboutHash = 'about',
  variant = 'light',
}: ToolTabsProps) {
  const pathname = usePathname();

  // pathname همیشه بدون hash است و دقیقاً همون چیزیه که برای basePath می‌خوایم
  const basePath = useMemo(() => pathname || '/tools', [pathname]);

  return (
    <ToolTabsShell
      basePath={basePath}
      tool={tool}
      about={about}
      toolLabel={toolLabel}
      aboutLabel={aboutLabel}
      aboutHash={aboutHash}
      variant={variant}
    />
  );
}
