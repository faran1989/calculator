// app/(public)/tools/loan/page.tsx
import type { Metadata } from 'next';
import { Landmark } from 'lucide-react';
import LoanClient from './loanClient';
import ToolShell from '@/components/tools/ToolShell';
import { toolConfig } from './tool.config';

export const metadata: Metadata = {
  title: toolConfig.seo.title,
  description: toolConfig.seo.description,
  alternates: { canonical: toolConfig.seo.canonical },
  openGraph: {
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
    url: toolConfig.seo.canonical,
    type: 'website',
  },
};

/* ── About content از toolConfig ── */
function AboutContent() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {toolConfig.aboutSections.map((section) => (
        <div key={section.key}>
          <h3 className="text-base font-black text-slate-800 mb-2">{section.title}</h3>

          {section.type === 'text' && (
            <p className="text-slate-600 text-sm leading-7">{section.text}</p>
          )}

          {section.type === 'bullets' && (
            <ul className="space-y-1.5">
              {section.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {section.type === 'faq' && (
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <details key={i} className="group border border-black/6 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-bold text-slate-700 hover:bg-slate-50 list-none">
                    {item.q}
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform shrink-0 mr-2 text-lg leading-none">+</span>
                  </summary>
                  <p className="px-4 py-3 text-sm text-slate-600 leading-7 border-t border-black/5 bg-slate-50/50">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Related tools ── */
const relatedTools = toolConfig.relatedTools.map((t) => ({
  href: t.hrefFallback,
  title: t.title,
  desc: t.desc,
  icon: <t.icon className={`w-5 h-5 ${t.colorClass}`} />,
}));

export default function Page() {
  return (
    <ToolShell
      title={toolConfig.toolName}
      subtitle="قسط ماهانه، کل سود و جدول اقساط را برای انواع وام تخمین بزنید"
      icon={<Landmark className="w-6 h-6 text-emerald-600" />}
      aboutContent={<AboutContent />}
      relatedTools={relatedTools}
    >
      <LoanClient />
    </ToolShell>
  );
}
