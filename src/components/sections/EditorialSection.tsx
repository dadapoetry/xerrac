'use client'

import { SectionData, EditorialContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function EditorialSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as EditorialContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} />
      <div
        className="text-gray-300 leading-relaxed space-y-6 text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    </div>
  )
}
