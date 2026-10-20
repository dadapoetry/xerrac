'use client'

import { SectionData, FaduCatalaContent, FaduEntry } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { readingTime, prepareBody } from '@/lib/html'

function EntryCard({ entry, index }: { entry: FaduEntry; index: number }) {
  const typeLabel =
    entry.type === 'biography' ? 'Biografia' : entry.type === 'ucronia' ? 'Ucronia' : entry.type === 'artefacte' ? 'Artefacte' : 'Fadu'
  return (
    <div className="mb-8 pb-6 relative">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold text-white mb-3 leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{entry.title}</h3>
        {/* Etiqueta com un segell de goma: girada, mono i amb doble filet, que
            digui el gènere de la fitxa sense posar-s'hi seriós. */}
        <span
          aria-hidden="true"
          className="shrink-0 -rotate-[7deg] select-none font-mono text-2xs uppercase tracking-[0.18em] px-2 py-1 border-2"
          style={{
            color: 'var(--accent)',
            borderColor: 'var(--accent)',
            background: 'rgba(var(--accent-rgb), 0.1)',
            boxShadow: '2px 2px 0 rgba(var(--accent-rgb), 0.35)',
          }}
        >
          {typeLabel}
        </span>
      </div>
      <div
        className="text-gray-300 leading-relaxed text-sm md:text-md text-justify hyphens-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: prepareBody(entry.body) }}
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
