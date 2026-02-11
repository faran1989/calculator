'use client'

import Link from 'next/link'
import HeaderBase from './header/HeaderBase'

export default function ToolsHeader() {
  return (
    <HeaderBase
      variant="tools"
      className="bg-[#111827]/95 border-white/10"
      right={
        <div className="flex items-center gap-2 select-none">
          <span className="text-lg font-semibold text-white">Takhmino</span>
          <span className="text-xs text-white/60">Tools</span>
        </div>
      }
      center={
        <div className="text-sm md:text-base font-medium text-white/90">
          ابزارهای تخمینو
        </div>
      }
      left={
        <Link
          href="https://takhmino.com"
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          بازگشت به سایت اصلی
        </Link>
      }
    />
  )
}
