'use client'

import { SectionData, FaduCatalaContent, FaduEntry } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { readingTime } from '@/lib/html'

function EntryCard({ entry, index }: { entry: FaduEntry; index: number }) {
  return (
    <div className="mb-8 pb-6 relative pt-3">
      {/* Regla superior d'accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--accent)' }} aria-hidden="true" />
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-2xs uppercase tracking-[0.3em]" style={{ color: 'var(--accent-text)' }}>
          {entry.type === 'biography' ? 'Biografia' : entry.type === 'ucronia' ? 'Ucronia' : entry.type === 'artefacte' ? 'Artefacte' : 'Fadu'}
        </span>
        <span className="text-2xs text-gray-400 font-mono tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">#{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-bold text-white mb-3 leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{entry.title}</h3>
        <span aria-hidden="true" className="text-2xl font-serif italic text-gray-400 select-none" style={{ color: 'rgba(var(--accent-text-rgb), 0.45)' }}>
          APÒCRIF
        </span>
      </div>
      <div
        className="text-gray-300 leading-relaxed text-sm md:text-md text-justify hyphens-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: entry.body }}
      />
    </div>
  )
}

export function FaduCatalaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as FaduCatalaContent
  const body = (content.entries || []).map((entry) => entry.body || '').join(' ')

  return (
    <div className="w-full py-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          number={index}
          title={section.title}
          subtitle="Caricatures i humor negre"
          readingTime={body ? readingTime(body) : undefined}
        />
        <div className="md:columns-2 md:gap-8">
          {content.entries?.map((entry: FaduEntry, i: number) => (
            <EntryCard key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
