'use client'

import { useEffect, useState } from 'react'
import { SectionData, NecrologiquesContent } from '@/types'

export function NecrologiquesSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as NecrologiquesContent
  const entries = content.entries || []
  const [bgReady, setBgReady] = useState(false)

  useEffect(() => {
    setBgReady(true)
  }, [])

  return (
    <div className="relative w-full overflow-hidden">
      {section.backgroundImage && (
        <>
          <div
            className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ${bgReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url("${section.backgroundImage}")` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/85 via-black/72 to-black/90" />
          <div className="absolute inset-x-0 top-0 h-24 z-[2] bg-gradient-to-b from-black/60 to-transparent" />
        </>
      )}

      <div className="relative z-[3] max-w-prose w-full mx-auto px-6 py-14 md:py-20">
        <div className="w-12 h-[2px] opacity-60 mb-4" style={{ backgroundColor: 'var(--accent)' }} />

        <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase mb-10">
          <span className="font-semibold" style={{ color: 'rgba(var(--accent-rgb), 0.8)' }}>
            {section.title}
          </span>
          <span className="text-gray-500">&nbsp;&nbsp;·&nbsp;&nbsp;Conceptes que ens han deixat</span>
        </p>

        {entries.length === 0 ? (
          <p className="editorial-body text-gray-400 italic">Cap defunció que declarar, aquest semestre.</p>
        ) : (
          entries.map((entry, i) => (
            <article key={i} className={`editorial-body text-gray-300 ${i < entries.length - 1 ? 'mb-9' : ''}`}>
              <p>
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
                {entry.epitaph && (
                  <>
                    {'. '}
                    <span dangerouslySetInnerHTML={{ __html: entry.epitaph }} />
                  </>
                )}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
