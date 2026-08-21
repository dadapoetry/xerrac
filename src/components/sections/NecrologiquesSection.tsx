'use client'

import { useEffect, useState } from 'react'
import { SectionData, NecrologiquesContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function NecrologiquesSection({ section, index }: { section: SectionData; index: number }) {
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
        <SectionHeader
          number={index}
          title={section.title}
          subtitle="Conceptes que ens han deixat"
          bright={!!section.backgroundImage}
        />

        {entries.length === 0 ? (
          <p className="text-gray-600 text-sm italic">Cap defunció que declarar, aquest semestre.</p>
        ) : (
          <>
            {lead && (
              <article className="max-w-2xl mb-14 md:mb-20">
                {lead.years && (
                  <p
                    className="font-mono text-[11px] tracking-[0.35em] mb-4"
                    style={{ color: 'rgba(var(--accent-rgb), 0.75)' }}
                  >
                    †&nbsp;&nbsp;{lead.years}
                  </p>
                )}
                <h3 className="text-base md:text-lg font-bold uppercase tracking-[0.18em] text-gray-100 mb-5">
                  {lead.name}
                </h3>
                {lead.epitaph && (
                  <div
                    className="necro-dropcap italic text-sm md:text-[15px] text-gray-300 leading-relaxed [&>p]:mt-2"
                    dangerouslySetInnerHTML={{ __html: lead.epitaph }}
                  />
                )}
              </article>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
                {rest.map((entry, i) => (
                  <article
                    key={i}
                    className="flex flex-col items-center px-6 py-10 text-center bg-[#0a0a0a]/90 backdrop-blur-sm"
                  >
                    <span
                      className="text-sm leading-none"
                      style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}
                    >
                      †
                    </span>
                    <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-200">
                      {entry.name}
                    </h4>
                    {entry.years && (
                      <p className="mt-2 font-mono text-[9px] tracking-[0.28em] text-gray-500">
                        {entry.years}
                      </p>
                    )}
                    {entry.epitaph && (
                      <div
                        className="mt-3 mb-2 italic text-[11px] leading-relaxed text-gray-400 [&>p]:mt-1"
                        dangerouslySetInnerHTML={{ __html: entry.epitaph }}
                      />
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
