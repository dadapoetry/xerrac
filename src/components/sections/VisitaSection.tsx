'use client'

import { SectionData, VisitaContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function VisitaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as VisitaContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle="Turisme teòric"  />

      {content.source && (
        <p className="text-xs text-gray-400 mb-6 italic tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
          {content.source}
        </p>
      )}

      <div className="-mx-4 md:-mx-12 px-4 md:px-12 border-l-2" style={{ borderColor: 'rgba(var(--accent-rgb), 0.1)' }}>
        <span className="text-7xl font-serif leading-none block -mb-8 -ml-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" style={{ color: 'rgba(var(--accent-rgb), 0.2)' }}>&ldquo;</span>
        <div className="pl-8 md:pl-12 pr-4 relative">
          <div
            className="text-gray-300 leading-relaxed text-[15px] md:text-base italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </div>
        <span className="text-7xl font-serif leading-none block text-right -mt-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" style={{ color: 'rgba(var(--accent-rgb), 0.2)' }}>&rdquo;</span>
      </div>
    </div>
  )
}
