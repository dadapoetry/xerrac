'use client'

import { SectionData, AclarimentCulturalContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { EditorialArticle } from '@/components/EditorialArticle'
import { readingTime } from '@/lib/html'

export function AclarimentCulturalSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as AclarimentCulturalContent

  return (
    <div className="max-w-prose w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle="Aclarir allò que continua sense aclarir-se" readingTime={readingTime(content.body)} />
      <div className="relative pl-6">
        <EditorialArticle body={content.body} style="quoted" capitular={false} className="aparell" />
      </div>
    </div>
  )
}
