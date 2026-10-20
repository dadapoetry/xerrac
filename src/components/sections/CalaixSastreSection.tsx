'use client'

import { SectionData, CalaixSastreContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { readingTime, prepareBody } from '@/lib/html'

export function CalaixSastreSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as CalaixSastreContent

  const body = [
    ...(content.interviews || []).map((i) => i.body),
    ...(content.reviews || []).map((r) => r.body),
    ...(content.investigacio || []).map((i) => i.body),
  ].join(' ')

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHeader number={index} title={section.title} subtitle="Parlem amb i d'algú quan toca" readingTime={readingTime(body)} />

        {content.interviews?.length > 0 && (
          <div className="mb-12">
            <span className="text-2xs text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Entrevistes</span>
            <div className="space-y-6">
              {content.interviews.map((item, i) => (
                <div key={i} className="relative pt-4">
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--accent)' }} aria-hidden="true" />
                  <div className="absolute -left-6 top-4 hidden md:block font-mono text-2xs tabular-nums text-gray-500 select-none" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.subject}</h3>
                  <div
                    className="text-gray-200 leading-[1.75] text-sm md:text-md text-justify hyphens-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                    dangerouslySetInnerHTML={{ __html: prepareBody(item.body) }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {content.reviews?.length > 0 && (
          <div className="mb-12">
            <span className="text-2xs text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Crítiques</span>
            <div className="grid md:grid-cols-2 gap-6">
              {content.reviews.map((item, i) => (
                <div key={i} className="relative pt-4">
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--accent)' }} aria-hidden="true" />
                  <div className="absolute -left-6 top-4 hidden md:block font-mono text-2xs tabular-nums text-gray-500 select-none" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.title}</h3>
                  <div
                    className="text-gray-200 leading-[1.75] text-sm md:text-md text-justify hyphens-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                    dangerouslySetInnerHTML={{ __html: prepareBody(item.body) }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {content.investigacio?.length > 0 && (
          <div>
            <span className="text-2xs text-gray-400 tracking-[0.3em] uppercase block mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Investigació</span>
            <div className="space-y-6">
              {content.investigacio.map((item, i) => (
                <div key={i} className="relative pt-4">
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--accent)' }} aria-hidden="true" />
                  <div className="absolute -left-6 top-4 hidden md:block font-mono text-2xs tabular-nums text-gray-500 select-none" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{item.title}</h3>
                  <div
                    className="text-gray-200 leading-[1.75] text-sm md:text-md text-justify hyphens-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                    dangerouslySetInnerHTML={{ __html: prepareBody(item.body) }}
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
