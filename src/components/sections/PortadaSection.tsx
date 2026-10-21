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
    </div>
  )
}

interface SumariEntry {
  number: string
  title: string
  readingTime?: number
}

export function PortadaSection({ section, sumariEntries, issueNumber, issueDate }: { section: SectionData; sumariEntries?: SumariEntry[]; issueNumber?: number; issueDate?: Date }) {
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
                opacity: 0.09,
                letterSpacing: '-0.05em',
              }}
            >
              {String(issueNumber).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Capçalera de publicació: Logo gran */}
        <div className="flex flex-col items-center mb-4 relative z-10">
          <Logo large className="mb-2" />
          {issueNumber !== undefined && (
            <div className="font-mono text-2xs tracking-[0.3em] uppercase text-gray-500 mt-1">
              Núm. {String(issueNumber).padStart(2, '0')}
              {issueDate ? ` · ${new Date(issueDate).toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}` : ''}
            </div>
          )}
        </div>

        {/* Tema com a titular (secundari al logo) */}
        {content.topic && (
          <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-gray-200 leading-tight mb-2">
            {content.topic}
          </h1>
        )}

        {/* Sumari horitzontal dens (estil revista japonesa) */}
        {sumariEntries && sumariEntries.length > 0 && (
          <div className="mt-5 relative z-10 border-t border-b py-3" style={{ borderColor: 'rgba(var(--accent-rgb), 0.12)' }}>
            <div className="flex flex-wrap">
              {sumariEntries.map((entry, i) => (
                <div
                  key={i}
                  className="group flex items-baseline gap-2 py-1.5 pr-4 mr-4 border-r last:border-r-0 transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="font-mono tabular-nums text-lg md:text-xl font-bold leading-none shrink-0 transition-all duration-200 group-hover:opacity-100" style={{ color: 'var(--accent-text)', opacity: 0.5 }}>
                    {entry.number}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors leading-tight">
                    {entry.title}
                  </span>
                  {entry.readingTime && entry.readingTime > 0 && (
                    <span className="font-mono text-[9px] text-gray-600 group-hover:text-gray-400 shrink-0 tabular-nums transition-colors">
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
