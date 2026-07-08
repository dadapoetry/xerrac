'use client'

import { SectionData, PortadaContent } from '@/types'
import { SawDivider } from '@/components/SawDivider'

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4 relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand decorative top saw */}
      <SawDivider className="max-w-md mb-8" />

      <div className="saw-border p-8 md:p-16 mb-8 max-w-2xl w-full bg-black/40 backdrop-blur-sm relative">
        {/* Red glow overlay */}
        <div className="absolute inset-0 bg-red-500/[0.02] pointer-events-none" />

        <div className="flex items-center justify-center gap-4 mb-6">
          <svg
            viewBox="0 0 100 100"
            className="w-12 h-12 md:w-16 md:h-16 shrink-0"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50,8 L54,18 L64,14 L62,26 L74,24 L70,36 L82,36 L76,48 L86,50 L76,52 L82,64 L70,62 L74,74 L62,70 L64,82 L54,76 L50,86 L46,76 L36,82 L38,70 L26,74 L30,62 L18,64 L24,52 L14,50 L24,48 L18,36 L30,38 L26,26 L38,30 L36,18 L46,26 Z"
              fill="#dc2626"
            />
            <circle cx="50" cy="50" r="12" fill="#0a0a0a" />
            <circle cx="50" cy="50" r="5" fill="#dc2626" />
          </svg>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white
            drop-shadow-[0_2px_12px_rgba(220,38,38,0.3)]">
            XERRAC<span className="text-red-500">!</span>
          </h1>
        </div>

        {content.subtitle && (
          <p className="text-sm md:text-base text-gray-400 uppercase tracking-[0.3em] font-medium mb-6">
            {content.subtitle}
          </p>
        )}

        <div className="w-12 h-0.5 bg-red-500/60 mx-auto mb-6" />

        {content.topic && (
          <p className="text-sm md:text-base text-gray-500 italic font-light">
            {content.topic}
          </p>
        )}
      </div>

      {/* Brand decorative bottom saw */}
      <SawDivider className="max-w-md" />

      <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em] mt-6">
        Número 1
      </p>
    </div>
  )
}
