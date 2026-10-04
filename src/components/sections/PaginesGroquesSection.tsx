'use client'

import { SectionData, PaginesGroquesContent, Proverb } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function PaginesGroquesSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as PaginesGroquesContent
  const proverbs = content.proverbs || []

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHeader number={index} title={section.title} subtitle="Proverbis i refranys accidentals" />
        <div className="max-w-4xl mx-auto">
          {proverbs.length === 0 ? (
            <p className="editorial-body text-gray-400 italic">
              Encara no s&rsquo;ha publicat cap refrany accidental.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 md:gap-x-12">
              {proverbs.map((proverb: Proverb, i: number) => (
                <div
                  key={i}
                  className="group relative border-t border-white/[0.07] py-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-6 bottom-6 w-[2px] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"
                    style={{ backgroundColor: 'rgba(var(--grogues-rgb), 0.55)' }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -mx-3 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: 'rgba(var(--grogues-rgb), 0.04)' }}
                  />
                  <div className="relative flex items-start gap-3">
                    <span
                      className="font-mono text-[11px] leading-none pt-[0.35rem] w-6 shrink-0 select-none tabular-nums"
                      style={{ color: 'rgba(var(--grogues-rgb), 0.55)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <blockquote
                        className="font-serif text-[17px] md:text-[19px] italic leading-[1.55] max-w-[40ch] text-pretty hyphens-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                        style={{ color: 'var(--grogues)' }}
                      >
                        «{proverb.text}»
                      </blockquote>
                      <p className="text-xs mt-2.5 font-mono tracking-wide text-gray-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        — {proverb.author}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
