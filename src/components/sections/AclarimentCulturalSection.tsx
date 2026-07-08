'use client'

import { SectionData, AclarimentCulturalContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function AclarimentCulturalSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as AclarimentCulturalContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} />
      <div className="relative pl-6 border-l border-red-500/30">
        <div
          className="text-gray-400 leading-relaxed space-y-6 text-[15px] md:text-base"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  )
}
