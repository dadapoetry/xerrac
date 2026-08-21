'use client'

import { SectionData, NecrologiquesContent, NecrologicaEntry } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

function NecrologicaCard({ entry }: { entry: NecrologicaEntry }) {
  return (
    <div className="mb-8 pb-8 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0 break-inside-avoid">
      <div className="w-6 h-[2px] mb-4" style={{ backgroundColor: 'var(--accent)' }} aria-hidden="true" />
      <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
        {entry.name}
      </h3>
      {entry.years && (
        <p
          className="font-mono text-xs tracking-widest mt-2 mb-3"
          style={{ color: 'rgba(var(--accent-rgb), 0.85)' }}
        >
          {entry.years}
        </p>
      )}
      <div
        className="italic text-gray-300 leading-relaxed text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: entry.epitaph }}
      />
    </div>
  )
}

export function NecrologiquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as NecrologiquesContent
  const entries = content.entries || []

  return (
    <div className="w-full py-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <SectionHeader number={index} title={section.title} subtitle="Conceptes que ens han deixat" />
        {entries.length > 0 ? (
          <div className="md:columns-2 md:gap-8">
            {entries.map((entry, i) => (
              <NecrologicaCard key={i} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Cap defunció que declarar, aquest semestre.</p>
        )}
      </div>
    </div>
  )
}
