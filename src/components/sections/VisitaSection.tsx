'use client'

import { SectionData, VisitaContent } from '@/types'

export function VisitaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as VisitaContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-2 text-red-400 uppercase tracking-tight">
        {section.title}
      </h2>
      {content.source && (
        <p className="text-sm text-gray-600 mb-8 italic">
          {content.source}
        </p>
      )}
      <div className="relative">
        <span className="text-6xl text-red-800 font-serif absolute -top-4 -left-2 opacity-30">&ldquo;</span>
        <div className="pl-8 pr-4 pt-4">
          <div
            className="text-gray-200 text-justify leading-relaxed prose prose-invert prose-lg max-w-none
              prose-strong:text-red-300 prose-em:text-gray-400"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </div>
        <span className="text-6xl text-red-800 font-serif absolute -bottom-12 -right-2 opacity-30">&rdquo;</span>
      </div>
    </div>
  )
}
