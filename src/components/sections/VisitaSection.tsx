'use client'

import { SectionData, VisitaContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { readingTime } from '@/lib/html'

export function VisitaSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as VisitaContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle="Turisme teòric" readingTime={readingTime(content.body)} />
      <blockquote className="relative -mx-4 md:-mx-12 px-4 md:px-12 border-l-2" style={{ borderColor: 'rgba(var(--accent-rgb), 0.1)' }}>
        {/* Les cometes van al marge, no dins del text: així la citació arrenca a
            la columna i el marc no desplaça la primera línia. Decoratives per als
            lectors de pantalla —del fet de ser una citació ja en dona fe el
            `<blockquote>`—, i una mica més visibles que abans (0,3 en comptes de
            0,2), perquè un marc que no es veu no emmarca res. */}
        <span
          aria-hidden="true"
          className="absolute left-1 -top-1 text-7xl font-serif leading-none select-none pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
          style={{ color: 'rgba(var(--accent-rgb), 0.3)' }}
        >
          «
        </span>

        <div className="pl-8 md:pl-12 pr-4">
          <div
            className="text-gray-300 leading-relaxed text-sm md:text-md italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </div>

        <span
          aria-hidden="true"
          className="block text-right text-7xl font-serif leading-none select-none -mt-4 -mr-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
          style={{ color: 'rgba(var(--accent-rgb), 0.3)' }}
        >
          »
        </span>

        {/* Colofó: la font de la traducció, en mono i a baix, on es busca. */}
        {content.source && (
          <p className="pl-8 md:pl-12 pr-4 mt-6 font-mono text-xs text-gray-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {content.source}
          </p>
        )}
      </blockquote>
    </div>
  )
}
