import React from "react";

export type HeaderVariant = "global" | "tools" | "tool";

type HeaderBaseProps = {
  variant: HeaderVariant;

  /** سمت راست (RTL) — لوگو / دکمه برگشت */
  right?: React.ReactNode;

  /** وسط — عنوان */
  center?: React.ReactNode;

  /** سمت چپ — لینک‌ها / اکشن‌ها */
  left?: React.ReactNode;

  /** کلاس اضافه */
  className?: string;

  /** چسبان بالا */
  sticky?: boolean;
};

const HEIGHT_BY_VARIANT: Record<HeaderVariant, string> = {
  global: "h-16", // 64px
  tools: "h-14",  // 56px
  tool: "h-12",   // 48px
};

export default function HeaderBase({
  variant,
  right,
  center,
  left,
  className = "",
  sticky = true,
}: HeaderBaseProps) {
  const heightClass = HEIGHT_BY_VARIANT[variant];

  return (
    <header
      dir="rtl"
      className={[
        sticky ? "sticky top-0 z-50" : "",
        "w-full border-b border-white/10",
        "bg-[#111827]/95 backdrop-blur",
        heightClass,
        className,
      ].join(" ")}
    >
      <div className="mx-auto h-full w-full max-w-6xl px-4">
        <div className="grid h-full grid-cols-3 items-center">
          {/* Right (RTL) */}
          <div className="flex items-center justify-start gap-2">
            {right ?? <BrandMark />}
          </div>

          {/* Center */}
          <div className="flex items-center justify-center">
            {center ?? null}
          </div>

          {/* Left */}
          <div className="flex items-center justify-end gap-2">
            {left ?? null}
          </div>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="text-lg font-semibold text-white">Takhmino</span>
      <span className="text-xs text-white/60">Tools</span>
    </div>
  );
}
