'use client'

import { useRef, useEffect, useState } from 'react'
import { SectionData, EditorialContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'
import { styleBlockquotes } from '@/lib/html'

export function EditorialSection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as EditorialContent
  const ref = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`max-w-prose w-full mx-auto py-12 ${entered ? 'entered' : ''}`}>
      <SectionHeader number={index} title={section.title} />
      <div
        className="editorial-body text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
        dangerouslySetInnerHTML={{ __html: styleBlockquotes(content.body) }}
      />
    </div>
  )
}
