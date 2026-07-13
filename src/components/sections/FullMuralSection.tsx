'use client'

import { SectionData, FullMuralContent, CollageEntry } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function FullMuralSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as FullMuralContent

  return (
    <div className="max-w-5xl w-full mx-auto py-12">
      <SectionHeader number={index} title={section.title} subtitle="Collages i contribucions dels lectors" />

      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 text-[11px] text-gray-500">
          <span className="h-px w-6 bg-gray-800" />
          <span>
            Participa-hi — envia els teus treballs visuals o textos a{' '}
            <a
              href="mailto:contacte@xerrac.cat"
              className="hover:underline decoration-from-font"
              style={{ color: 'var(--accent)' }}
            >
              contacte@xerrac.cat
            </a>
          </span>
          <span className="h-px w-6 bg-gray-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.collages?.map((collage: CollageEntry, i: number) => (
          <div key={i} className="group">
            <div className="aspect-[4/3] bg-gray-800 flex items-center justify-center relative overflow-hidden mb-2 border border-white/10 rounded-sm">
              {collage.image ? (
                <img
                  src={collage.image}
                  alt={collage.description}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <p className="text-gray-500 text-xs">Imatge no disponible</p>
              )}
            </div>
            <p className="text-[10px] font-mono tracking-wider text-gray-500 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
              {collage.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
