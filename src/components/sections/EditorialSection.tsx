'use client'

import { SectionData, EditorialContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { styleBlockquotes } from '@/lib/html'

export function EditorialSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as EditorialContent

  return (
    <div className="max-w-prose w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} />
      <div
        className="editorial-body text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: styleBlockquotes(content.body) }}
      />
    </div>
  )
}
