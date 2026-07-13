'use client'

import { SectionData, CalaixSastreContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function CalaixSastreSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as CalaixSastreContent

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHeader number={index} title={section.title} subtitle="Parlem amb algú quan toca" />

        {content.interviews?.length > 0 && (
          <div className="mb-12">
            <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Entrevistes</span>
            <div className="space-y-6">
              {content.interviews.map((item, i) => (
                <div key={i} className="border border-gray-700 p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.subject}</h3>
                  <div
                    className="text-gray-300 leading-relaxed text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                    dangerouslySetInnerHTML={{ __html: item.body }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {content.reviews?.length > 0 && (
          <div>
            <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Crítiques</span>
            <div className="grid md:grid-cols-2 gap-6">
              {content.reviews.map((item, i) => (
                <div key={i} className="border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.title}</h3>
                  <div
                    className="text-gray-300 leading-relaxed text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                    dangerouslySetInnerHTML={{ __html: item.body }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
