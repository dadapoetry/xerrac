'use client'

import { SectionData, FaduCatalaContent, FaduEntry } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

function EntryCard({ entry, index }: { entry: FaduEntry; index: number }) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] text-red-500/70 uppercase tracking-widest">
          {entry.type === 'biography' ? 'Biografia apòcrifa' : entry.type === 'ucronia' ? 'Ucronia' : 'Personatge'}
        </span>
        <span className="text-xs text-gray-700 font-mono">#{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug">{entry.title}</h3>
      <div
        className="text-gray-400 leading-relaxed text-[15px] md:text-base"
        dangerouslySetInnerHTML={{ __html: entry.body }}
      />
    </div>
  )
}

export function FaduCatalaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as FaduCatalaContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} subtitle="Refundació de l'humor negre" />
      <div>
        {content.entries?.map((entry: FaduEntry, i: number) => (
          <EntryCard key={i} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}
