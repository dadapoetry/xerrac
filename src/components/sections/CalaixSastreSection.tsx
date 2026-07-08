'use client'

import { SectionData, CalaixSastreContent } from '@/types'

export function CalaixSastreSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as CalaixSastreContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-8 text-red-400 uppercase tracking-tight">
        {section.title}
      </h2>

      {content.interviews?.length > 0 && (
        <div className="mb-12">
          <h3 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-6">Entrevistes</h3>
          {content.interviews.map((item, i) => (
            <div key={i} className="mb-8 p-6 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-4">{item.subject}</h4>
              <div
                className="text-gray-300 text-justify leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}

      {content.reviews?.length > 0 && (
        <div>
          <h3 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-6">Crítiques</h3>
          {content.reviews.map((item, i) => (
            <div key={i} className="mb-8 p-6 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-4">{item.title}</h4>
              <div
                className="text-gray-300 text-justify leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
