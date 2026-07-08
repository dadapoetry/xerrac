'use client'

import { SectionData, VisitaContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function VisitaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as VisitaContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} />

      {content.source && (
        <p className="text-xs text-gray-600 mb-6 italic tracking-wider">
          {content.source}
        </p>
      )}

      <div>
        <span className="text-5xl text-red-500/20 font-serif leading-none block -mb-4">&ldquo;</span>
        <div className="pl-8 pr-4">
          <div
            className="text-gray-400 leading-relaxed text-[15px] md:text-base italic"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </div>
        <span className="text-5xl text-red-500/20 font-serif leading-none block text-right -mt-4">&rdquo;</span>
      </div>
    </div>
  )
}
