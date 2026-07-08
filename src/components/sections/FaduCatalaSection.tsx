'use client'

import { SectionData, FaduCatalaContent, FaduEntry } from '@/types'

function FaduEntryCard({ entry, index }: { entry: FaduEntry; index: number }) {
  return (
    <div className="mb-8 p-6 border border-gray-800 hover:border-red-900 transition-colors
      radical-border-yellow" style={{ borderColor: '#eab308' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs uppercase tracking-widest text-yellow-500">
          {entry.type === 'biography' ? '↪ Biografia apòcrifa' : entry.type === 'ucronia' ? '↪ Ucronia' : '↪ Personatge'}
        </span>
        <span className="text-4xl text-yellow-600 font-serif opacity-30">#{index + 1}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{entry.title}</h3>
      <div
        className="text-gray-300 text-justify leading-relaxed prose prose-invert max-w-none
          prose-strong:text-yellow-200"
        dangerouslySetInnerHTML={{ __html: entry.body }}
      />
    </div>
  )
}

export function FaduCatalaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as FaduCatalaContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-2 text-yellow-500 uppercase tracking-tight">
        {section.title}
      </h2>
      <p className="text-sm text-gray-500 mb-8 uppercase tracking-wider">
        Refundació de l&apos;humor negre
      </p>
      <div>
        {content.entries?.map((entry: FaduEntry, i: number) => (
          <FaduEntryCard key={i} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}
