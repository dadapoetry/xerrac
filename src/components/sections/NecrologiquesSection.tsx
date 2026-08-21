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
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/88 via-black/78 to-black/92" />
          <div className="absolute inset-x-0 top-0 h-24 z-[2] bg-gradient-to-b from-black/60 to-transparent" />
        </>
      )}

      <div className="relative z-[3] border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase mb-9">
            <span style={{ color: 'rgba(var(--accent-rgb), 0.7)' }}>{section.title}</span>
            <span className="text-gray-600">&nbsp;&nbsp;·&nbsp;&nbsp;Conceptes que ens han deixat</span>
          </p>

          {entries.length === 0 ? (
            <p className="text-gray-600 text-xs italic">Cap defunció que declarar, aquest semestre.</p>
          ) : (
            <div className="flex flex-wrap gap-x-12 gap-y-7">
              {entries.map((entry, i) => (
                <article key={i} className="max-w-[250px]">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-300 leading-snug">
                    {entry.name}
                  </h4>
                  {entry.years && (
                    <p
                      className="mt-1 font-mono text-[10px] tracking-[0.22em]"
                      style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}
                    >
                      †&nbsp;&nbsp;{entry.years}
                    </p>
                  )}
                  {entry.epitaph && (
                    <div
                      className="mt-1.5 italic text-xs leading-relaxed text-gray-400 [&>p]:mt-1"
                      dangerouslySetInnerHTML={{ __html: entry.epitaph }}
                    />
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
