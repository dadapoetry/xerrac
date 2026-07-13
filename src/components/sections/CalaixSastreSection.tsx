'use client'

import { SectionData, CalaixSastreContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function CalaixSastreSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as CalaixSastreContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} subtitle="Parlem amb algú quan toca" />

      {content.interviews?.length > 0 && (
        <div className="mb-12">
          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Entrevistes</span>
          {content.interviews.map((item, i) => (
            <div key={i} className="mb-6 pb-6 border-b border-gray-700 last:border-0">
              <h3 className="text-lg font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.subject}</h3>
              <div
                className="text-gray-300 leading-relaxed text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}

      {content.reviews?.length > 0 && (
        <div>
          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Crítiques</span>
          {content.reviews.map((item, i) => (
            <div key={i} className="mb-6 pb-6 border-b border-gray-700 last:border-0">
              <h3 className="text-lg font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.title}</h3>
              <div
                className="text-gray-300 leading-relaxed text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
