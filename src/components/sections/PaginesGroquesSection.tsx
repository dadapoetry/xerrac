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
            <span className="text-[10px] text-gray-500 font-mono block mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
              #{String(i + 1).padStart(2, '0')}
            </span>
            <div className="pl-4 border-l-2 border-red-500/20">
              <blockquote className="text-lg md:text-xl text-gray-200 italic leading-relaxed mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                &ldquo;{proverb.text}&rdquo;
              </blockquote>
            </div>
            <p className="text-sm text-gray-400 text-right drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
              — {proverb.author}
            </p>
            {i < content.proverbs.length - 1 && (
              <div className="mt-6 h-px bg-gray-800" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
