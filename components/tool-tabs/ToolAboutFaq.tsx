'use client';

import React from 'react';

export type FAQItem = {
  /** id یکتا برای اسکرول/لینک (مثلاً assumptions, how-calculated) */
  id: string;
  question: string;
  answer: React.ReactNode;
};

type ToolAboutFaqProps = {
  /** عنوان بخش (اختیاری) */
  title?: string;

  /** توضیح کوتاه بالای FAQ (اختیاری) */
  intro?: React.ReactNode;

  /** لیست سوالات */
  items: FAQItem[];

  /**
   * اگر header شما sticky است، با scroll-mt-* کمک می‌کنیم سوال زیر هدر نره.
   * پیش‌فرض: 24 (تقریباً مناسب اکثر هدرهای sticky)
   */
  scrollMtClassName?: string; // default: 'scroll-mt-24'
};

export default function ToolAboutFaq({
  title = 'درباره این تخمین',
  intro,
  items,
  scrollMtClassName = 'scroll-mt-24',
}: ToolAboutFaqProps) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="text-white text-lg font-extrabold">{title}</div>
        {intro ? <div className="mt-2 text-white/70 text-sm leading-7">{intro}</div> : null}
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <section
            key={it.id}
            id={it.id}
            className={[
              scrollMtClassName,
              'rounded-2xl border border-white/10 bg-white/5',
              'p-4 md:p-5',
            ].join(' ')}
          >
            <div className="text-white font-bold text-sm md:text-base">
              {it.question}
            </div>
            <div className="mt-2 text-white/70 text-sm leading-7">
              {it.answer}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
