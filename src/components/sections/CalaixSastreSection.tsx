'use client'

import { SectionData, CalaixSastreContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function CalaixSastreSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as CalaixSastreContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} />

      {content.interviews?.length > 0 && (
        <div className="mb-12">
          <span className="text-[10px] text-gray-600 tracking-[0.3em] uppercase block mb-6">Entrevistes</span>
          {content.interviews.map((item, i) => (
            <div key={i} className="mb-6 pb-6 border-b border-gray-800 last:border-0">
              <h3 className="text-lg font-bold text-white mb-3">{item.subject}</h3>
              <div
                className="text-gray-400 leading-relaxed text-[15px] md:text-base"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}

      {content.reviews?.length > 0 && (
        <div>
          <span className="text-[10px] text-gray-600 tracking-[0.3em] uppercase block mb-6">Crítiques</span>
          {content.reviews.map((item, i) => (
            <div key={i} className="mb-6 pb-6 border-b border-gray-800 last:border-0">
              <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
              <div
                className="text-gray-400 leading-relaxed text-[15px] md:text-base"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
