'use client'

import { SectionData, NecrologiquesContent } from '@/types'
import { SectionBackground } from '@/components/SectionBackground'
import { prepareBody } from '@/lib/html'

export function NecrologiquesSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as NecrologiquesContent
  const entries = content.entries || []

  return (
    <div className="section-shell">
      <SectionBackground section={section} gradient="from-black/85 via-black/72 to-black/90">
        <div className="absolute inset-x-0 top-0 h-24 z-[2] bg-gradient-to-b from-black/60 to-transparent" />
      </SectionBackground>

      <div className="relative z-[3] max-w-prose w-full mx-auto px-6 py-14 md:py-20">
        <div className="w-12 h-[2px] opacity-60 mb-4" style={{ backgroundColor: 'var(--accent)' }} />

        <p className="text-2xs md:text-xs tracking-[0.25em] uppercase mb-10">
          <span className="font-semibold" style={{ color: 'rgba(var(--accent-rgb), 0.8)' }}>
            {section.title}
          </span>
          <span className="text-gray-500">&nbsp;&nbsp;·&nbsp;&nbsp;Conceptes que ens han deixat</span>
        </p>

        {entries.length === 0 ? (
          <p className="editorial-body text-gray-400 italic text-sm md:text-md">Cap defunció que declarar, aquest semestre.</p>
        ) : (
          entries.map((entry, i) => (
            <article key={i} className={`editorial-body text-gray-200 text-sm md:text-md leading-[1.75] ${i < entries.length - 1 ? 'mb-9' : ''}`}>
              <p className="necrologica-name">
                <span className="font-semibold uppercase tracking-[0.06em] text-gray-100">
                  {entry.name}
                </span>
                {entry.years && (
                  <>
                    {' '}
                    <span
                      className="font-mono"
                      style={{ color: 'rgba(var(--accent-rgb), 0.75)', fontSize: '0.85em', letterSpacing: '0.08em' }}
                    >
                      †&thinsp;{entry.years}
                    </span>
                  </>
                )}
              </p>
              {entry.epitaph && (
                <div className="necrologica-epitaph" dangerouslySetInnerHTML={{ __html: prepareBody(entry.epitaph) }} />
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}
