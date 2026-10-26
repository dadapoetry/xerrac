'use client'

import { useState, useEffect, Fragment } from 'react'
import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'
import { sectionAnchorId } from '@/lib/slugs'

function ScrollHint({ onSelectSection }: { onSelectSection?: (index: number) => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={`#${sectionAnchorId(1)}`}
      onClick={(e) => {
        e.preventDefault()
        if (onSelectSection) {
          onSelectSection(1)
          return
        }
        const el = document.querySelector(`[data-section-index="1"]`) as HTMLElement | null
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
      className={`inline-flex items-center gap-3 min-h-[44px] py-2 text-2xs uppercase tracking-[0.3em] text-gray-500 hover:text-gray-300 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <span className="w-px h-6 bg-gray-500" aria-hidden="true" />
      <span>Comença a llegir · 01</span>
    </a>
  )
}

interface SumariEntry {
  number: string
  title: string
  readingTime?: number
  /** Índex de la secció dins del visor. És el que permet anar-hi amb l'ancora. */
  index?: number
}

export function PortadaSection({ section, sumariEntries, issueNumber, issueDate, onSelectSection }: { section: SectionData; sumariEntries?: SumariEntry[]; issueNumber?: number; issueDate?: Date; onSelectSection?: (index: number) => void }) {
  const content = section.content as unknown as PortadaContent

  // El sumari és un enllaç real (perquè es pugui obrir en una pestanya nova o
  // copiar), però el desplaçament el fem nosaltres perquè coincideixi amb el
  // de la navegació de l'encapçalera i l'URL de lectura s'actualitzi igual.
  const goToSection = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault()
    if (onSelectSection) {
      onSelectSection(index)
      return
    }
    const el = document.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col items-center w-full text-center px-4 relative overflow-hidden">
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

        {sumariEntries && sumariEntries.length > 0 && (
          <p className="relative z-10 mt-6 text-2xs uppercase tracking-[0.3em] text-gray-600">
            o tria una secció
          </p>
        )}

        {/* Sumari horitzontal dens (estil revista japonesa). Cada secció rep una
            tonalitat derivada de l'accent del número: continuen sent un sol
            color de marca, però cada secció és reconeixible d'un cop d'ull. */}
        {sumariEntries && sumariEntries.length > 0 && (
          <div className="mt-5 relative z-10 border-t border-b py-3" style={{ borderColor: 'rgba(var(--accent-rgb), 0.12)' }}>
            <div className="flex flex-wrap">
              {sumariEntries.map((entry, i) => {
                const tint = 1 - (i / Math.max(1, sumariEntries.length - 1)) * 0.88
                const targetIndex = entry.index ?? i + 1
                return (
                <a
                  key={i}
                  href={`#${sectionAnchorId(targetIndex)}`}
                  onClick={(e) => goToSection(e, targetIndex)}
                  aria-label={`Anar a la secció ${entry.number}, ${entry.title}`}
                  className="group flex items-baseline gap-2 py-1.5 pr-4 mr-4 border-r last:border-r-0 transition-colors no-underline"
                  style={{ borderColor: `rgba(var(--accent-rgb), ${tint * 0.55})` }}
                >
                  <span
                    className="font-mono tabular-nums text-lg md:text-xl font-bold leading-none shrink-0 transition-all duration-200 group-hover:opacity-100"
                    style={{ color: `rgba(var(--accent-rgb), ${tint})` }}
                  >
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
                </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <ScrollHint onSelectSection={onSelectSection} />
    </div>
  )
}
