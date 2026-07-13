'use client'

import { SectionData, AclarimentCulturalContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { styleBlockquotes } from '@/lib/html'

export function AclarimentCulturalSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as AclarimentCulturalContent

  return (
    <div className="max-w-prose w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle="Aclarir allò que continua sense aclarir-se" />
      <div className="relative pl-6 border-l" style={{ borderColor: 'rgba(var(--accent-rgb), 0.3)' }}>
        <div
          className="editorial-body text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
          dangerouslySetInnerHTML={{ __html: styleBlockquotes(content.body) }}
        />
      </div>
    </div>
  )
}
