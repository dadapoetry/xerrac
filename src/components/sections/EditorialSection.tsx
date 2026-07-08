'use client'

import { SectionData, EditorialContent } from '@/types'

export function EditorialSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as EditorialContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-8 text-red-500 uppercase tracking-tight">
        {section.title}
      </h2>
      <div
        className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-a:text-red-400
          prose-strong:text-red-300 prose-em:text-gray-300
          leading-relaxed space-y-4 text-gray-200 text-justify"
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    </div>
  )
}
