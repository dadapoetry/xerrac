'use client'

import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'
import { RedRule } from '@/components/RedRule'

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4 relative overflow-hidden">
      {/* Saw blade watermark */}
      <svg
        viewBox="0 0 100 100"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] md:w-[420px] opacity-[0.04] pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50,8 L54,18 L64,14 L62,26 L74,24 L70,36 L82,36 L76,48 L86,50 L76,52 L82,64 L70,62 L74,74 L62,70 L64,82 L54,76 L50,86 L46,76 L36,82 L38,70 L26,74 L30,62 L18,64 L24,52 L14,50 L24,48 L18,36 L30,38 L26,26 L38,30 L36,18 L46,26 Z"
          fill="#ef4444"
        />
        <circle cx="50" cy="50" r="14" fill="#000000" />
        <circle cx="50" cy="50" r="5" fill="#ef4444" />
      </svg>

      <div className="max-w-lg w-full relative">
        <Logo className="mb-8" />

        <RedRule className="mb-6 w-16 mx-auto" />

        {content.subtitle && (
          <p className="text-sm text-gray-400 tracking-[0.3em] uppercase mb-8 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {content.subtitle}
          </p>
        )}

        {content.topic && (
          <p className="text-sm text-gray-300 italic leading-relaxed max-w-sm mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {content.topic}
          </p>
        )}
      </div>
    </div>
  )
}
