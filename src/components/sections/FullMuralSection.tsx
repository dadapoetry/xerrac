'use client'

import { SectionData, FullMuralContent, CollageEntry } from '@/types'

export function FullMuralSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as FullMuralContent

  return (
    <div className="max-w-5xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-2 text-red-400 uppercase tracking-tight">
        {section.title}
      </h2>
      <p className="text-sm text-gray-500 mb-8 uppercase tracking-wider">
        Collages i contribucions dels lectors
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {content.collages?.map((collage: CollageEntry, i: number) => (
          <div key={i} className="group border border-gray-800 overflow-hidden
            hover:border-red-900 transition-all duration-300">
            <div className="aspect-square bg-gray-900 flex items-center justify-center
              relative overflow-hidden">
              {collage.image ? (
                <img
                  src={collage.image}
                  alt={collage.description}
                  className="w-full h-full object-cover transition-transform duration-500
                    group-hover:scale-110"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="text-6xl mb-4 opacity-20">⎔</div>
                  <p className="text-gray-700 text-sm">Imatge no disponible</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-900/50">
              <p className="text-sm text-gray-400 leading-relaxed">
                {collage.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
