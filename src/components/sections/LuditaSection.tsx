'use client'

import { SectionData, LuditaContent, CrosswordData } from '@/types'
import { Crossword } from '@/components/Crossword'

export function LuditaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as LuditaContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-2 text-red-500 uppercase tracking-tight">
        {section.title}
      </h2>
      <p className="text-sm text-gray-500 mb-8 uppercase tracking-wider">
        Mots encreuats d'aclariment
      </p>

      {content.crossword ? (
        <Crossword data={content.crossword} />
      ) : (
        <p className="text-gray-600 italic">No hi ha crucigrama disponible per a aquest número.</p>
      )}
    </div>
  )
}
