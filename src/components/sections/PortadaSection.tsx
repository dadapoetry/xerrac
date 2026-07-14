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
          <div className="mt-6 w-full max-w-md mx-auto">
            <div className="flex items-end gap-[2px] h-14 mb-3">
              {sumariEntries.map((entry, i) => {
                const height = 30 + Math.sin(i * 1.3 + 0.7) * 14
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                    <div
                      className="w-full transition-all duration-300"
                      style={{
                        height: `${height}px`,
                        background: 'var(--accent)',
                        opacity: 0.12,
                        clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                      }}
                    />
                    <span className="text-[7px] text-gray-500 font-mono mt-0.5 leading-none">{entry.number}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[10px] text-gray-300">
              {sumariEntries.map((entry, i) => (
                <span key={i} className="text-gray-400">
                  <span className="font-mono text-gray-500">{entry.number}</span> {entry.title}
                </span>
              ))}
            </div>
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
