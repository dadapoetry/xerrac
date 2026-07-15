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
        {issueNumber !== undefined && (
          <a
            href={`/compilar/${issueNumber}`}
            className="group relative mt-6 inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold
              tracking-[0.15em] uppercase text-gray-300 border border-gray-700
              hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5
              transition-all duration-300 ease-out overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
              </svg>
              Compila PDF
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          </a>
        )}
      </div>

      {issueNumber !== undefined && (
        <span className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none z-10">Nº&nbsp;{String(issueNumber).padStart(2, '0')}</span>
      )}
      <ScrollHint />
    </div>
  )
}
