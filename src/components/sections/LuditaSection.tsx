'use client'

import { SectionData, LuditaContent, CrosswordData } from '@/types'
import { Crossword } from '@/components/Crossword'
import { SectionHeader } from '@/components/SectionHeader'

export function LuditaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as LuditaContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} subtitle="Mots encreuats d'aclariment" />
      {content.crossword ? (
        <Crossword data={content.crossword} />
      ) : (
        <p className="text-gray-600 italic text-sm">No hi ha crucigrama disponible per a aquest número.</p>
      )}
    </div>
  )
}
