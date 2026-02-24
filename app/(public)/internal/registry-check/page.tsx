// app/(light)/_internal/registry-check/page.tsx
import React from 'react';
import { validateRegistry } from '@/app/content/registry/content.rules';
import type { ContentId } from '@/app/content/registry/content.types';
import { mustGetNode } from '@/app/content/registry/content.registry';

export const metadata = {
  title: 'Registry Check | Takhmino (Internal)',
  robots: { index: false, follow: false },
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-black/70">
      {children}
    </span>
  );
}

function Row({
  level,
  code,
  nodeId,
  message,
}: {
  level: 'error' | 'warn';
  code: string;
  nodeId: ContentId;
  message: string;
}) {
  const node = mustGetNode(nodeId);

  return (
    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{level.toUpperCase()}</Badge>
          <Badge>{code}</Badge>
          <Badge>{node.type}</Badge>
          <Badge>{node.id}</Badge>
        </div>

        <div className="text-sm text-black/70">{node.title}</div>
      </div>

      <div className="mt-3 text-sm leading-7 text-black/60">{message}</div>
    </div>
  );
}

export default function RegistryCheckPage() {
  const res = validateRegistry();

  return (
    <main className="min-h-screen bg-[#F5F5F4] px-4 py-10 text-black">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight">Content Registry Check</h1>
              <p className="mt-2 text-sm leading-7 text-black/60">
                این صفحه فقط برای توسعه است (NoIndex). خروجی قوانین اتصال ابزار ↔ مقاله ↔ واژه‌نامه را
                نشان می‌دهد.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>ok: {String(res.ok)}</Badge>
              <Badge>errors: {res.errors.length}</Badge>
              <Badge>warns: {res.warns.length}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-base font-bold">Errors</h2>
            <p className="mt-2 text-sm text-black/60">Error یعنی باید اصلاح شود.</p>

            <div className="mt-4 space-y-3">
              {res.errors.length === 0 ? (
                <div className="rounded-2xl border border-black/10 bg-black/5 p-4 text-sm text-black/60">
                  هیچ Errorی نداریم ✅
                </div>
              ) : (
                res.errors.map((e, idx) => (
                  <Row
                    key={`${e.code}-${e.nodeId}-${idx}`}
                    level={e.level}
                    code={e.code}
                    nodeId={e.nodeId}
                    message={e.message}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-base font-bold">Warnings</h2>
            <p className="mt-2 text-sm text-black/60">Warn یعنی کیفیت بهتر می‌شود، اما پروژه را نمی‌شکند.</p>

            <div className="mt-4 space-y-3">
              {res.warns.length === 0 ? (
                <div className="rounded-2xl border border-black/10 bg-black/5 p-4 text-sm text-black/60">
                  هیچ Warningی نداریم ✅
                </div>
              ) : (
                res.warns.map((w, idx) => (
                  <Row
                    key={`${w.code}-${w.nodeId}-${idx}`}
                    level={w.level}
                    code={w.code}
                    nodeId={w.nodeId}
                    message={w.message}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-base font-bold">Next Step Hint</h2>
            <p className="mt-2 text-sm leading-7 text-black/60">
              وقتی Error=0 شد، مرحله بعدی اینه که Home را data-driven کنیم و بخش‌ها را از{' '}
              <span className="mx-1 rounded bg-black/5 px-2 py-0.5 font-mono text-xs">
                getHomeFeatured()
              </span>{' '}
              تغذیه کنیم.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}