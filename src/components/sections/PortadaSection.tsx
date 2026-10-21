'use client'

import { useState, useEffect, Fragment } from 'react'
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
      <span className="text-2xs text-gray-500 uppercase tracking-[0.25em]">Desplaça</span>
      <svg className="w-4 h-4 text-gray-400 animate-bounce motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <p className="text-3xl md:text-5xl text-gray-100 font-bold">
            {content.topic}
          </p>
        )}

        {sumariEntries && sumariEntries.length > 0 && (
          <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-wider text-gray-300">
            {sumariEntries.map((entry, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <span className="text-gray-500" aria-hidden="true">/</span>
                )}
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="text-gray-400 font-mono tabular-nums">{entry.number}</span>
                  <span className="text-gray-200">{entry.title}</span>
                </span>
              </Fragment>
            ))}
          </div>
        )}
      </div>
      
      {issueNumber !== undefined && (
        <span className="absolute bottom-4 right-4 text-2xs text-gray-100 font-mono pointer-events-none z-10">Nº&nbsp;{String(issueNumber).padStart(2, '0')}</span>
      )}
      <ScrollHint />
    </div>
  )
}
