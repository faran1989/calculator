'use client';

import React, { ReactNode } from 'react';
import ToolTabs from '@/components/tool-tabs/ToolTabs';

type ToolPageTemplateProps = {
  title: string;
  subtitle?: string;

  tool: ReactNode;
  about: ReactNode;

  variant?: 'light' | 'dark';
};

export default function ToolPageTemplate({
  title,
  subtitle,
  tool,
  about,
  variant = 'light',
}: ToolPageTemplateProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8 text-right">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              {subtitle}
            </p>
          ) : null}
        </header>

        <ToolTabs
          toolLabel="ابزار"
          aboutLabel="درباره این تخمین"
          variant={variant}
          tool={tool}
          about={about}
        />
      </div>
    </div>
  );
}
