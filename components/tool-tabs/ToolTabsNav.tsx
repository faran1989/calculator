// File: calculator/components/tool-tabs/ToolTabsNav.tsx
'use client';

import React from 'react';

export type TabKey = 'tool' | 'about';

type Props = {
  activeTab: TabKey;

  toolLabel?: string;
  aboutLabel?: string;

  // ✅ برای سازگاری با Shell
  onChange?: (t: TabKey) => void;
  variant?: 'light' | 'dark';

  // (اختیاری) اگر جایی دیگه از این دو استفاده کند
  isLight?: boolean;
  className?: string;
  setActiveTab?: (t: TabKey) => void;
  onTabChange?: (t: TabKey) => void;
};

type TabButtonProps = {
  tab: TabKey;
  label: string;
  radiusClass: string;
  activeTab: TabKey;
  onSelect: (t: TabKey) => void;
  isLight: boolean;
};

function TabButton({
  tab,
  label,
  radiusClass,
  activeTab,
  onSelect,
  isLight,
}: TabButtonProps) {
  const isActive = activeTab === tab;

  const tabBase =
    'relative select-none px-4 sm:px-5 py-3 text-sm sm:text-[15px] font-semibold transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    (isLight
      ? 'focus-visible:ring-slate-400 focus-visible:ring-offset-white'
      : 'focus-visible:ring-white/40 focus-visible:ring-offset-slate-950');

  const inactiveText = isLight
    ? 'text-slate-600 hover:text-slate-800'
    : 'text-slate-300 hover:text-white';
  const activeText = isLight ? 'text-slate-900' : 'text-white';

  const activeBg = isLight
    ? 'bg-white shadow-sm'
    : 'bg-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.25)]';

  const ring = isActive
    ? isLight
      ? 'ring-1 ring-slate-200'
      : 'ring-1 ring-white/15'
    : 'ring-0';

  return (
    <button
      type="button"
      onClick={() => onSelect(tab)}
      className={[
        tabBase,
        radiusClass,
        'min-w-[120px] sm:min-w-[140px]',
        isActive ? [activeText, activeBg, ring].join(' ') : inactiveText,
      ].join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </button>
  );
}

export default function ToolTabsNav(props: Props) {
  // ✅ تعیین حالت light/dark از variant (اولویت با variant)
  const isLight = props.variant
    ? props.variant === 'light'
    : !!props.isLight;

  const border = isLight ? 'border-slate-200' : 'border-white/15';
  const railBg = isLight ? 'bg-slate-50/70' : 'bg-white/5';

  // ✅ اولویت callback:
  // onChange (Shell) → onTabChange → setActiveTab → noop
  const onSelect: (t: TabKey) => void =
    props.onChange ?? props.onTabChange ?? props.setActiveTab ?? (() => {});

  const toolLabel = props.toolLabel ?? 'ابزار';
  const aboutLabel = props.aboutLabel ?? 'درباره';

  return (
    <div className={['w-full', props.className ?? ''].join(' ')}>
      <div
        className={[
          'flex items-stretch gap-0 overflow-x-auto no-scrollbar border-b',
          border,
          'rounded-t-xl',
          railBg,
        ].join(' ')}
      >
        <TabButton
          tab="tool"
          label={toolLabel}
          radiusClass="rounded-tr-xl rounded-tl-none"
          activeTab={props.activeTab}
          onSelect={onSelect}
          isLight={isLight}
        />

        <TabButton
          tab="about"
          label={aboutLabel}
          radiusClass="rounded-tl-xl rounded-tr-none"
          activeTab={props.activeTab}
          onSelect={onSelect}
          isLight={isLight}
        />
      </div>
    </div>
  );
}
