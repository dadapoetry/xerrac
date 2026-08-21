'use client'

import { useEffect, useState } from 'react'
import { SectionData, NecrologiquesContent } from '@/types'

function NoticeDivider() {
  return (
    <div className="flex items-center gap-4 my-8" aria-hidden="true">
      <span className="flex-1 h-px bg-white/10" />
      <span className="text-xs leading-none" style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}>†</span>
      <span className="flex-1 h-px bg-white/10" />
    </div>
  )
}

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
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/88 via-black/78 to-black/90" />
          <div className="absolute inset-x-0 top-0 h-24 z-[2] bg-gradient-to-b from-black/60 to-transparent" />
        </>
      )}

      <div className="relative z-[3] min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="w-full max-w-xl border border-white/20 p-1.5">
          <div className="border border-white/10 bg-[#0a0a0a]/85 backdrop-blur-sm px-7 py-12 sm:px-10 md:px-14 md:py-14 text-center">

            <span
              className="block text-lg leading-none mb-5"
              style={{ color: 'rgba(var(--accent-rgb), 0.65)' }}
            >
              †
            </span>

            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-gray-100">
              {section.title}
            </h3>
            <p className="mt-2.5 italic text-xs text-gray-500">Conceptes que ens han deixat</p>

            <NoticeDivider />

            {entries.length === 0 ? (
              <p className="text-gray-600 text-xs italic pb-2">
                Cap defunció que declarar, aquest semestre.
              </p>
            ) : (
              entries.map((entry, i) => (
                <article key={i} className={`py-6 ${i < entries.length - 1 ? 'border-b border-white/[0.07]' : 'pb-2'}`}>
                  <h4 className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-gray-100">
                    {entry.name}
                  </h4>
                  {entry.years && (
                    <p
                      className="mt-1.5 font-mono text-[9px] tracking-[0.28em]"
                      style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}
                    >
                      {entry.years}
                    </p>
                  )}
                  {entry.epitaph && (
                    <div
                      className="mt-3 italic text-xs leading-relaxed text-gray-400 max-w-sm mx-auto [&>p]:mt-1"
                      dangerouslySetInnerHTML={{ __html: entry.epitaph }}
                    />
                  )}
                </article>
              ))
            )}

            <NoticeDivider />
          </div>
        </div>
      </div>
    </div>
  )
}
