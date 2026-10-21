'use client'

import { SectionData, EditorialContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { EditorialArticle } from '@/components/EditorialArticle'
import { readingTime } from '@/lib/html'

export function EditorialSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as EditorialContent

  return (
    <div className="max-w-prose w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle={content.subtitle || undefined} readingTime={readingTime(content.body)} />
      <EditorialArticle body={content.body} />
    </div>
  )
}
