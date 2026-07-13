'use client'

import { SectionData, AclarimentCulturalContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { styleBlockquotes } from '@/lib/html'

export function AclarimentCulturalSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as AclarimentCulturalContent

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto md:grid md:grid-cols-6 md:gap-6">
        <div className="md:col-span-4 md:col-start-2">
          <div className="relative pl-6 md:pl-10 border-l-[3px]" style={{ borderColor: 'rgba(var(--accent-rgb), 0.25)' }}>
            <div className="absolute top-0 -left-[1px] w-[3px] h-16" style={{ backgroundColor: 'var(--accent)' }} />
            <SectionHeader number={index} title={section.title} subtitle="Aclarir allò que continua sense aclarir-se" />
          </div>
          <div className="mt-8 pl-6 md:pl-10">
            <div
              className="editorial-body text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
              dangerouslySetInnerHTML={{ __html: styleBlockquotes(content.body) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
