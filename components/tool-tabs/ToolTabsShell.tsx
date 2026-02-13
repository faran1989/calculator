'use client';

import React, { ReactNode, useMemo } from 'react';
import ToolTabsNav from './ToolTabsNav';
import { useToolTabs, type ToolTabKey } from './useToolTabs';

export type ToolTabsShellProps = {
  basePath: string;

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

export default function ToolTabsShell({
  basePath,
  tool,
  about,
  toolLabel,
  aboutLabel,
  aboutHash = 'about',
  variant = 'light',
}: ToolTabsShellProps) {
  const { activeTab, setTab, goToAboutAndScroll } = useToolTabs({
    basePath,
    aboutHash,
    defaultTab: 'tool',
  });

  const toolContent = useMemo(() => {
    if (typeof tool === 'function') return tool({ goToAboutAndScroll, setTab });
    return tool;
  }, [tool, goToAboutAndScroll, setTab]);

  const content = useMemo(() => {
    return activeTab === 'about' ? about : toolContent;
  }, [activeTab, about, toolContent]);

  const isLight = variant === 'light';

  const panelClass = isLight
    ? 'bg-white border border-slate-200 shadow-sm'
    : 'bg-white/5 border border-white/10';

  const tabBarBg = isLight ? 'bg-slate-50' : 'bg-transparent';

  return (
    <div className="w-full">
      {/* ✅ پنل واحد */}
      <div className={`rounded-2xl ${panelClass}`}>
        {/* ✅ Tab Bar: مثل کروم، بدون خط جداکننده مستقل */}
        <div className={`rounded-t-2xl ${tabBarBg} px-3 pt-3`}>
          <ToolTabsNav
            activeTab={activeTab}
            onChange={(t: ToolTabKey) => setTab(t)}
            toolLabel={toolLabel}
            aboutLabel={aboutLabel}
            variant={variant}
          />
        </div>

        {/* ✅ بدنه: یک پیکسل میاد بالا تا تب فعال با بدنه یکی بشه */}
        <div className="p-4 md:p-6 -mt-px">{content}</div>
      </div>
    </div>
  );
}
