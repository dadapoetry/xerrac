'use client'

import { SectionData, PaginesGroquesContent, Proverb } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function PaginesGroquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as PaginesGroquesContent

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHeader number={index} title={section.title} subtitle="Proverbis accidentals" />
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {content.proverbs?.map((proverb: Proverb, i: number) => (
              <div key={i} className={`flex flex-col ${i % 2 === 1 ? 'md:items-end' : ''}`}>
                <span className="text-[10px] text-gray-500 font-mono block mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                  #{String(i + 1).padStart(2, '0')}
                </span>
                <div className={`${i % 2 === 1 ? 'md:text-right md:pl-12' : 'md:pr-12'}`}>
                  <blockquote className="text-lg md:text-xl text-gray-200 italic leading-relaxed mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                    style={{ borderColor: 'rgba(var(--accent-rgb), 0.2)' }}
                  >
                    <span className={`inline-block ${i % 2 === 1 ? 'order-2' : '-ml-3'}`} style={{ color: 'rgba(var(--accent-rgb), 0.2)' }}>&ldquo;</span>{proverb.text}&rdquo;
                  </blockquote>
                </div>
                <p className={`text-sm text-gray-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] ${i % 2 === 1 ? '' : 'text-right'}`}>
                  — {proverb.author}
                </p>
                {i < content.proverbs.length - 1 && (
                  <div className="mt-6 h-px bg-gray-800 w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
