'use client'

import { SectionData, VisitaContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function VisitaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as VisitaContent

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto">
        <div className="md:grid md:grid-cols-5 md:gap-8">
          <div className="md:col-span-3 md:col-start-2">
            <SectionHeader number={index} title={section.title} subtitle="Turisme teòric" />

            {content.source && (
              <p className="text-xs text-gray-400 mb-8 italic tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                {content.source}
              </p>
            )}

            <div className="relative">
              <span className="text-9xl font-serif leading-none block absolute -top-8 -left-4 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" style={{ color: 'rgba(var(--accent-rgb), 0.12)' }}>&ldquo;</span>
              <div className="pl-8 md:pl-16 pr-4 relative border-l-2" style={{ borderColor: 'rgba(var(--accent-rgb), 0.15)' }}>
                <div
                  className="text-gray-300 leading-relaxed text-[16px] md:text-lg italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                  dangerouslySetInnerHTML={{ __html: content.body }}
                />
              </div>
              <span className="text-9xl font-serif leading-none block text-right -mt-6 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" style={{ color: 'rgba(var(--accent-rgb), 0.12)' }}>&rdquo;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
