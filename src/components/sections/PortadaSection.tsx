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

        {/* Sumari horitzontal dens (estil revista japonesa) — sense línies vermelles, sense "Index", sense comptador */}
        {sumariEntries && sumariEntries.length > 0 && (
          <div className="mt-8 relative z-10">
            <div className="flex flex-wrap">
              {sumariEntries.map((entry, i) => (
                <div
                  key={i}
                  className="group flex items-baseline gap-2 py-1.5 pr-4 mr-4 border-r last:border-r-0 transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="font-mono tabular-nums text-lg md:text-xl font-bold leading-none shrink-0" style={{ color: 'var(--accent-text)', opacity: 0.5 }}>
                    {entry.number}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors leading-tight">
                    {entry.title}
                  </span>
                  {entry.readingTime && entry.readingTime > 0 && (
                    <span className="font-mono text-[9px] text-gray-700 shrink-0 tabular-nums">
                      {entry.readingTime}′
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}
