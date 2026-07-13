'use client'

import { SectionData, PaginesGroquesContent, Proverb } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function PaginesGroquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as PaginesGroquesContent

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHeader number={index} title={section.title} subtitle="Proverbis accidentals" />
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 md:gap-x-10">
            {content.proverbs?.map((proverb: Proverb, i: number) => (
              <div
                key={i}
                className="group relative py-4 transition-colors duration-300"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mx-3 px-3 rounded-sm"
                  style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.03)' }}
                />
                <div className="relative flex items-start gap-3">
                  <span
                    className="font-mono text-[11px] leading-none mt-0.5 shrink-0 w-7 text-right select-none"
                    style={{ color: 'rgba(var(--accent-rgb), 0.3)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <blockquote className="text-[16px] md:text-lg text-gray-200 italic leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                      &ldquo;{proverb.text}&rdquo;
                    </blockquote>
                    <p className="text-xs mt-1.5 text-right font-mono tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                      style={{ color: 'rgba(var(--accent-rgb), 0.5)' }}
                    >
                      — {proverb.author}
                    </p>
                  </div>
                </div>
                <div
                  className="mt-4 h-px w-full"
                  style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.08)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
