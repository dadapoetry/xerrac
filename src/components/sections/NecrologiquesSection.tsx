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

      <div className="relative z-[3] max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="w-12 h-[2px] opacity-60 mb-5" style={{ backgroundColor: 'var(--accent)' }} />

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-12 md:mb-14">
          <span
            className="font-mono text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(var(--accent-rgb), 0.7)' }}
          >
            {section.title}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-600">
            Conceptes que ens han deixat
          </span>
        </div>

        {entries.length === 0 ? (
          <p className="text-gray-600 text-xs italic">Cap defunció que declarar, aquest semestre.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {entries.map((entry, i) => (
              <article key={i} className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-200 leading-relaxed">
                  {entry.name}
                </h4>
                {entry.years && (
                  <p
                    className="mt-1.5 font-mono text-[9px] tracking-[0.25em]"
                    style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}
                  >
                    †&nbsp;&nbsp;{entry.years}
                  </p>
                )}
                {entry.epitaph && (
                  <div
                    className="mt-2.5 italic text-[11px] leading-relaxed text-gray-500 [&>p]:mt-1"
                    dangerouslySetInnerHTML={{ __html: entry.epitaph }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
