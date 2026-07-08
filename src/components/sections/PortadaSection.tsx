'use client'

import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'
import { SawIcon } from '@/components/SawIcon'

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4 relative overflow-hidden">
      <SawIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] md:w-[420px] opacity-[0.04] pointer-events-none" />

      <div className="max-w-lg w-full relative">
        <Logo className="mb-8" />

        {content.topic && (
          <p className="text-3xl md:text-4xl text-gray-100 font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {content.topic}
          </p>
        )}
      </div>
    </div>
  )
}
