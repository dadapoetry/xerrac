'use client'

import { SectionData, PaginesGroquesContent, Proverb } from '@/types'

export function PaginesGroquesSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PaginesGroquesContent

  return (
    <div className="max-w-3xl w-full mx-auto py-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-2 text-yellow-400 uppercase tracking-tight">
        {section.title}
      </h2>
      <p className="text-sm text-gray-500 mb-8 uppercase tracking-wider">
        Proverbs accidents
      </p>
      <div className="space-y-6">
        {content.proverbs?.map((proverb: Proverb, i: number) => (
          <div
            key={i}
            className="group relative p-6 border border-gray-800
              hover:border-yellow-400/50 transition-all duration-300"
          >
            <span className="absolute -top-3 left-4 bg-black px-2 text-xs text-yellow-600">
              #{i + 1}
            </span>
            <p className="text-xl md:text-2xl text-gray-200 italic mb-3 leading-relaxed
              group-hover:text-white transition-colors">
              &ldquo;{proverb.text}&rdquo;
            </p>
            <p className="text-sm text-gray-500 text-right">
              — {proverb.author}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
