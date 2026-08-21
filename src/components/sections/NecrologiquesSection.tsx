'use client'

import { SectionData, NecrologiquesContent } from '@/types'

function Hairline() {
  return <div className="w-6 h-px bg-white/10 mx-auto" aria-hidden="true" />
}

export function NecrologiquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as NecrologiquesContent
  const entries = content.entries || []

  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-6 text-center">
        <Hairline />
        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-gray-500 mt-5">
          {section.title}
        </p>
        <p className="text-xs text-gray-500 mt-1.5">Conceptes que ens han deixat</p>

        {entries.length === 0 ? (
          <p className="text-gray-600 text-xs italic mt-10">Cap defunció que declarar, aquest semestre.</p>
        ) : (
          <div className="mt-12 space-y-10">
            {entries.map((entry, i) => (
              <div key={i}>
                {entry.name && (
                  <h3 className="text-sm md:text-base font-semibold uppercase tracking-[0.15em] text-gray-200">
                    {entry.name}
                  </h3>
                )}
                {entry.years && (
                  <p
                    className="font-mono text-[10px] tracking-[0.25em] mt-1.5"
                    style={{ color: 'rgba(var(--accent-rgb), 0.55)' }}
                  >
                    {entry.years}
                  </p>
                )}
                {entry.epitaph && (
                  <div
                    className="italic text-sm text-gray-400 leading-relaxed mt-2.5"
                    dangerouslySetInnerHTML={{ __html: entry.epitaph }}
                  />
                )}
                {i < entries.length - 1 && <div className="mt-10"><Hairline /></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
