'use client'

import { SectionData, PortadaContent } from '@/types'

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center">
      <div className="border-2 border-white p-8 md:p-16 mb-8 max-w-2xl w-full"
        style={{ boxShadow: '8px 8px 0px 0px rgba(220,38,38,1)' }}
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white
          [text-shadow:4px_4px_0px_rgba(220,38,38,1)] mb-4">
          XERRAC!
        </h1>
        <p className="text-lg md:text-xl text-gray-400 uppercase tracking-[0.3em] mb-8">
          {content.subtitle}
        </p>
        <div className="w-16 h-0.5 bg-red-600 mx-auto mb-8" />
        {content.topic && (
          <p className="text-sm md:text-base text-gray-500 italic">
            {content.topic}
          </p>
        )}
      </div>
      <div className="text-xs text-gray-600 tracking-[0.5em] mt-8">
        SERRA • NO • MARTELL
      </div>
    </div>
  )
}
