'use client'

import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'
import { RedRule } from '@/components/RedRule'

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4">
      <div className="max-w-lg w-full">
        <Logo className="mb-8" />

        <RedRule className="mb-6 w-16 mx-auto" />

        {content.subtitle && (
          <p className="text-sm text-gray-500 tracking-[0.3em] uppercase mb-8">
            {content.subtitle}
          </p>
        )}

        {content.topic && (
          <p className="text-sm text-gray-600 italic leading-relaxed max-w-sm mx-auto">
            {content.topic}
          </p>
        )}
      </div>
    </div>
  )
}
