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
      <div className="max-w-2xl w-full relative z-10">
        {/* Número de volum com a element gràfic de fons (watermark), darrere del logo i el títol */}
        {issueNumber !== undefined && (
          <div
            aria-hidden="true"
            className="absolute -top-4 -right-2 md:-right-8 pointer-events-none select-none z-0"
          >
            <span
              className="font-black leading-none"
              style={{
                fontSize: 'clamp(12rem, 30vw, 20rem)',
                color: 'var(--accent)',
                opacity: 0.15,
                letterSpacing: '-0.05em',
              }}
            >
              {String(issueNumber).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Capçalera de publicació: Logo petit */}
        <div className="flex flex-col items-center mb-6 relative z-10">
          <Logo className="mb-3" />
        </div>

        {/* Tema com a titular principal */}
        {content.topic && (
          <h1 className="relative z-10 text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.95] mb-2">
            {content.topic}
          </h1>
        )}

        {/* Sumari com a índex editorial (números grans com a àncora visual, estil revista) */}
        {sumariEntries && sumariEntries.length > 0 && (
          <nav aria-label="Sumari del número" className="mt-10 mx-auto max-w-2xl relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
              <span className="font-mono text-2xs tracking-[0.4em] uppercase" style={{ color: 'var(--accent-text)' }}>
                Índex
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(var(--accent-rgb), 0.15)' }} />
            </div>
            <div className="relative pl-6">
              <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: 'rgba(var(--accent-rgb), 0.25)' }} />
              <ul className="flex flex-col gap-0">
                {sumariEntries.map((entry, i) => (
                  <li
                    key={i}
                    className="group relative flex items-baseline gap-4 py-2"
                  >
                    <span className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'var(--accent)' }} />
                    <span className="font-mono tabular-nums text-2xl md:text-3xl font-bold tracking-tight shrink-0 w-10 text-right leading-none" style={{ color: 'var(--accent-text)', opacity: 0.5 }}>
                      {entry.number}
                    </span>
                    <span className="flex-1 text-sm md:text-base text-gray-300 group-hover:text-white transition-colors leading-snug">
                      {entry.title}
                    </span>
                    {entry.readingTime && entry.readingTime > 0 && (
                      <span className="font-mono text-2xs text-gray-600 shrink-0 tabular-nums self-center">
                        {entry.readingTime}′
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}
