'use client'

import { useState, useEffect } from 'react'
import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'

function ScrollHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
      <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em]">Desplaça</span>
      <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  )
}

interface SumariEntry {
  number: string
  title: string
}

export function PortadaSection({ section, sumariEntries, issueNumber }: { section: SectionData; sumariEntries?: SumariEntry[]; issueNumber?: number }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4 relative overflow-hidden">
      <div className="max-w-lg w-full relative">
        <Logo className="mb-5" />

        {content.topic && (
          <p className="text-3xl md:text-4xl text-gray-100 font-bold">
            {content.topic}
          </p>
        )}

        {sumariEntries && sumariEntries.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-1 text-xs text-gray-300">
            {sumariEntries.map((entry, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-gray-500 select-none mx-0.5">/</span>}
                <span className="font-mono text-[10px] text-gray-400">{entry.number}</span>
                <span className="text-gray-200">{entry.title}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {issueNumber !== undefined && (
        <span className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none z-10">Nº&nbsp;{String(issueNumber).padStart(2, '0')}</span>
      )}
      <ScrollHint />
    </div>
  )
}
