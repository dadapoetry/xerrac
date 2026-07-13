'use client'

import { SectionData, EditorialContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { styleBlockquotes } from '@/lib/html'

export function EditorialSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as EditorialContent

  return (
    <div className="w-full py-12 relative">
      <div className="max-w-5xl mx-auto md:grid md:grid-cols-6 md:gap-6">
        <div className="md:col-span-4 md:col-start-3">
          <SectionHeader number={index} title={section.title} />
          <div className="editorial-body text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            dangerouslySetInnerHTML={{ __html: styleBlockquotes(content.body) }}
          />
        </div>
        <div className="hidden md:block md:col-start-1 md:col-span-1 relative">
          <div className="sticky top-32 text-right">
            <span className="block text-[11px] text-gray-500 font-mono tracking-[0.3em] uppercase mb-2">Número</span>
            <span className="text-[100px] font-black leading-none select-none" style={{ color: 'var(--accent)', opacity: 0.08 }}>
              {String(index).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
