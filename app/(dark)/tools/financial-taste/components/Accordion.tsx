// app/tools/financial-taste/components/Accordion.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full py-4 flex items-center justify-between text-right gap-3"
      >
        <span className="font-bold text-sm text-slate-900">{title}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>
      {open ? (
        <div className="pb-4 text-sm text-slate-700 leading-7">
          {children}
        </div>
      ) : null}
    </div>
  );
}
