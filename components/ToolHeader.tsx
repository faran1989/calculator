'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import HeaderBase from './header/HeaderBase'

interface ToolHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string

  /** محتوای توضیح (می‌تواند string یا JSX باشد) */
  helpText?: ReactNode

  /** متن تریگر (اختیاری) */
  helpLabel?: string
}

export default function ToolHeader({
  icon,
  title,
  subtitle,
  helpText,
  helpLabel = 'محاسبات چطوری انجام میشه؟',
}: ToolHeaderProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // بستن با کلیک بیرون + ESC
  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = wrapRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setOpen(false)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <HeaderBase
      variant="tool"
      // اینجا عمداً ارتفاع ثابت Base رو override کردیم تا مثل قبل، دو-ردیفه و خوش‌خوان باشه
      className="h-auto py-4 bg-neutral-50 border-neutral-300"
      right={
        <div className="flex items-start gap-4 min-w-0 w-full">
          <div className="shrink-0">{icon}</div>

          <div className="min-w-0 w-full">
            <h1 className="text-[19px] md:text-[22px] font-bold text-neutral-900 leading-snug">
              {title}
            </h1>

            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <p className="text-[14px] text-neutral-500 leading-snug">
                {subtitle}
              </p>

              {helpText && (
                <div ref={wrapRef} className="relative">
                  {/* Overlay مخصوص موبایل برای جلوگیری از تداخل متن پشت */}
                  <div
                    onClick={() => setOpen(false)}
                    className={`
                      fixed inset-0 z-10
                      bg-black/20
                      transition-opacity
                      md:hidden
                      ${
                        open
                          ? 'opacity-100 pointer-events-auto'
                          : 'opacity-0 pointer-events-none'
                      }
                    `}
                    aria-hidden="true"
                  />

                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="
                      inline-flex items-center
                      text-[14px]
                      text-emerald-600
                      underline
                      decoration-emerald-300
                      underline-offset-[3px]
                      hover:text-emerald-700
                      hover:decoration-emerald-500
                      transition-colors
                      cursor-pointer
                      whitespace-nowrap
                    "
                  >
                    <span>{helpLabel}</span>
                  </button>

                  {/* Popover */}
                  <div
                    dir="rtl"
                    className={`
                      absolute z-20 top-full mt-2
                      w-[320px] max-w-[85vw]
                      rounded-xl
                      border border-neutral-200
                      p-4
                      text-sm
                      text-neutral-800
                      shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                      transition
                      ${
                        open
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 -translate-y-1 pointer-events-none'
                      }

                      /* موبایل: وسطِ پایین */
                      left-1/2 -translate-x-1/2

                      /* دسکتاپ: bottom-start (RTL یعنی راستِ تریگر) */
                      md:left-auto md:-translate-x-0 md:right-0

                      bg-white
                    `}
                  >
                    <div className="text-right leading-relaxed">{helpText}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    />
  )
}
