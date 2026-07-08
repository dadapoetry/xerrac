'use client'

import { SectionData, PortadaContent } from '@/types'

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4">
      <div className="border-2 border-white/90 p-8 md:p-16 mb-8 max-w-2xl w-full"
        style={{ boxShadow: '10px 10px 0px 0px rgba(220,38,38,1)' }}
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white
          drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mb-4
          [-webkit-text-stroke:1px_rgba(220,38,38,0.3)]">
          XERRAC!
        </h1>
        {content.subtitle && (
          <p className="text-base md:text-xl text-gray-300 uppercase tracking-[0.25em] font-medium mb-8
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {content.subtitle}
          </p>
        )}
        <div className="w-16 h-0.5 bg-red-500 mx-auto mb-8" />
        {content.topic && (
          <p className="text-sm md:text-base text-gray-400 italic font-light
            drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            {content.topic}
          </p>
        )}
      </div>
    </div>
  )
}
