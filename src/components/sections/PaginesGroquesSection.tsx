'use client'

import { SectionData, PaginesGroquesContent, Proverb } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function PaginesGroquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as PaginesGroquesContent

  return (
    <div className="max-w-2xl w-full mx-auto py-12">
      <SectionHeader number={index + 1} title={section.title} subtitle="Proverbis accidentals" />
      <div className="space-y-8">
        {content.proverbs?.map((proverb: Proverb, i: number) => (
          <div key={i} className="group">
            <span className="text-[10px] text-gray-700 font-mono block mb-2">
              #{String(i + 1).padStart(2, '0')}
            </span>
            <blockquote className="text-lg md:text-xl text-gray-300 italic leading-relaxed mb-2">
              &ldquo;{proverb.text}&rdquo;
            </blockquote>
            <p className="text-sm text-gray-600 text-right">
              — {proverb.author}
            </p>
            {i < content.proverbs.length - 1 && (
              <div className="mt-6 h-px bg-gray-900" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
