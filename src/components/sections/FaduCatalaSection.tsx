'use client'

import { SectionData, FaduCatalaContent, FaduEntry } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

function EntryCard({ entry, index }: { entry: FaduEntry; index: number }) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-700 last:border-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] text-red-500/70 uppercase tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
          {entry.type === 'biography' ? 'Biografia apòcrifa' : entry.type === 'ucronia' ? 'Ucronia' : 'Personatge inventat'}
        </span>
        <span className="text-xs text-gray-500 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">#{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{entry.title}</h3>
      <div
        className="text-gray-300 leading-relaxed text-[15px] md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: entry.body }}
      />
    </div>
  )
}

export function FaduCatalaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as FaduCatalaContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle="Caricatures i humor negre" />
      <div>
        {content.entries?.map((entry: FaduEntry, i: number) => (
          <EntryCard key={i} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}
