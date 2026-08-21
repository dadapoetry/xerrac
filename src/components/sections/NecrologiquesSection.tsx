'use client'

import { useEffect, useState } from 'react'
import { SectionData, NecrologiquesContent } from '@/types'

export function NecrologiquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as NecrologiquesContent
  const entries = content.entries || []
  const [bgReady, setBgReady] = useState(false)

  useEffect(() => {
    setBgReady(true)
  }, [])

  return (
    <div className="relative w-full bg-black overflow-hidden">
      {section.backgroundImage && (
        <>
          <div
            className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ${bgReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url("${section.backgroundImage}")` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/85 via-black/70 to-black/90" />
        </>
      )}
      <div className="relative z-[3] max-w-xl mx-auto px-6 py-16 md:py-20">
        <header className="mb-10">
          <p
            className="font-mono text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(var(--accent-rgb), 0.6)' }}
          >
            {section.title}
          </p>
          <p className="text-xs text-gray-500 mt-1.5">Conceptes que ens han deixat</p>
        </header>

        {entries.length === 0 ? (
          <p className="text-gray-600 text-xs italic">Cap defunció que declarar, aquest semestre.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {entries.map((entry, i) => (
              <article key={i} className="py-7 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-200">
                    {entry.name}
                  </h3>
                  {entry.years && (
                    <span
                      className="font-mono text-[10px] tracking-[0.2em] shrink-0"
                      style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}
                    >
                      {entry.years}
                    </span>
                  )}
                </div>
                {entry.epitaph && (
                  <div
                    className="italic text-sm text-gray-400 leading-relaxed mt-2"
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