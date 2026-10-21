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
      <div className="w-px h-8 bg-gray-500 origin-top animate-[breathe_2s_ease-in-out_infinite]" />
      <span className="text-2xs text-gray-500 uppercase tracking-[0.25em]">Desplaça</span>
    </div>
  )
}

interface SumariEntry {
  number: string
  title: string
  readingTime?: number
}

export function PortadaSection({ section, sumariEntries, issueNumber }: { section: SectionData; sumariEntries?: SumariEntry[]; issueNumber?: number }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full text-center px-4 relative overflow-hidden">
      {/* Número de volum com a element gràfic de fons (watermark), darrere del logo i el títol */}
      {issueNumber !== undefined && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        >
          <span
            className="font-black leading-none"
            style={{
              fontSize: 'clamp(16rem, 40vw, 32rem)',
              color: 'var(--accent)',
              opacity: 0.12,
              letterSpacing: '-0.05em',
            }}
          >
            {String(issueNumber).padStart(2, '0')}
          </span>
        </div>
      )}

      <div className="max-w-2xl w-full relative z-10">
        {/* Capçalera de publicació: Logo petit + metadades */}
        <div className="flex flex-col items-center mb-6">
          <Logo className="mb-3" />
        </div>

        {/* Tema com a titular principal */}
        {content.topic && (
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.95] mb-2">
            {content.topic}
          </h1>
        )}

        {/* Sumari com a taula de continguts editorial */}
        {sumariEntries && sumariEntries.length > 0 && (
          <nav aria-label="Sumari del número" className="mt-12 mx-auto max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(var(--accent-rgb),0.4))' }} />
              <span className="font-mono text-2xs tracking-[0.3em] uppercase" style={{ color: 'var(--accent-text)' }}>
                Sumari
              </span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(var(--accent-rgb),0.4))' }} />
            </div>
            <ul className="flex flex-col">
              {sumariEntries.map((entry, i) => (
                <li
                  key={i}
                  className="group relative flex items-baseline gap-4 py-3 border-b border-gray-800/60 last:border-b-0 transition-colors"
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-px bg-[var(--accent)] transition-all duration-300 group-hover:w-3" />
                  <span className="font-mono tabular-nums text-sm tracking-[0.15em] text-gray-500 group-hover:text-[var(--accent-text)] transition-colors shrink-0 pl-0 group-hover:pl-5 duration-300">
                    {entry.number}
                  </span>
                  <span className="flex-1 text-left text-base md:text-lg text-gray-200 group-hover:text-white transition-colors font-medium">
                    {entry.title}
                  </span>
                  {entry.readingTime && entry.readingTime > 0 && (
                    <span className="font-mono text-2xs text-gray-600 shrink-0">
                      {entry.readingTime} min
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}
