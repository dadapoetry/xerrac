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

  const [lead, ...rest] = entries

  return (
    <div className="relative w-full overflow-hidden">
      {section.backgroundImage && (
        <>
          <div
            className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ${bgReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url("${section.backgroundImage}")` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/85 via-black/70 to-black/90" />
          <div className="absolute inset-x-0 top-0 h-24 z-[2] bg-gradient-to-b from-black/60 to-transparent" />
        </>
      )}

      <div className="relative z-[3] max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12 md:mb-16">
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
          <>
            {lead && (
              <article className="max-w-2xl pb-12 md:pb-16">
                <h3 className="text-xl md:text-2xl font-semibold uppercase tracking-[0.1em] text-gray-100">
                  {lead.name}
                </h3>
                {lead.years && (
                  <p
                    className="mt-3 font-mono text-[10px] tracking-[0.3em]"
                    style={{ color: 'rgba(var(--accent-rgb), 0.6)' }}
                  >
                    †&nbsp;&nbsp;{lead.years}
                  </p>
                )}
                {lead.epitaph && (
                  <div
                    className="mt-5 italic text-sm md:text-base text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: lead.epitaph }}
                  />
                )}
                {lead.mourners && (
                  <p className="mt-4 font-mono text-[10px] tracking-wide text-gray-600">
                    Avisen: {lead.mourners}
                  </p>
                )}
              </article>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
                {rest.map((entry, i) => (
                  <article
                    key={i}
                    className="flex flex-col items-center px-6 py-8 text-center bg-[#0a0a0a]/90 backdrop-blur-sm"
                  >
                    <span
                      className="text-base leading-none"
                      style={{ color: 'rgba(var(--accent-rgb), 0.65)' }}
                    >
                      †
                    </span>
                    <h4 className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-200">
                      {entry.name}
                    </h4>
                    {entry.years && (
                      <p className="mt-1.5 font-mono text-[9px] tracking-[0.25em] text-gray-500">
                        {entry.years}
                      </p>
                    )}
                    {entry.epitaph && (
                      <div
                        className="mt-3 mb-4 italic text-[11px] leading-relaxed text-gray-400 [&>p]:mt-1"
                        dangerouslySetInnerHTML={{ __html: entry.epitaph }}
                      />
                    )}
                    {entry.mourners && (
                      <p className="mt-auto w-full border-t border-white/5 pt-3 font-mono text-[9px] tracking-wide text-gray-600">
                        Avisen: {entry.mourners}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
