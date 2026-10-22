'use client'

import { useRef, useEffect, useState } from 'react'
import { SawIcon } from '@/components/SawIcon'
import { SectionNumber } from '@/components/SectionNumber'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
  readingTime?: number
  bright?: boolean
  accentTitle?: boolean
  titleColor?: string
  /**
   * Capçal en vertical, com el llom d'un llibre. Opt-in: només l'ha de fer
   * servir la secció que el vol (ara mateix, el Fadu català). La resta de
   * seccions continuen amb el capçal horitzontal de sempre.
   */
  vertical?: boolean
}

export function SectionHeader({ number, title, subtitle, readingTime, bright, accentTitle, titleColor, vertical }: SectionHeaderProps) {
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

  // Capçal en vertical: el títol s'apila de dalt a baix amb les lletres
  // dretes (tategaki) i la banda fa de llom d'un llibre. El filament
  // d'accent neix de la serra i baixa per tota l'alçada, de manera que el
  // capçal queda unit al cos de la secció i no flotant al marge.
  if (vertical) {
    return (
      <aside
        ref={ref}
        className={`xerrac-spine ${entered ? 'entered' : ''}`}
        aria-label={`Capçalera de la secció: ${title}`}
      >
        <div className="xerrac-spine__head stagger-item delay-1">
          <span style={{ color: titleColor || 'var(--accent-text)', filter: 'drop-shadow(0 0 2px currentColor)' }}>
            <SawIcon className="w-4 h-4" />
          </span>
          <span className="xerrac-spine__volume xerrac-tate-chu-yoko">
            {String(number).padStart(2, '0')}
          </span>
        </div>

        <h2
          className="xerrac-spine__title xerrac-tategaki stagger-item delay-2"
          style={titleColor ? { color: titleColor } : accentTitle ? { color: 'var(--accent-text)' } : undefined}
        >
          {title}
        </h2>

        {subtitle && (
          <p className="xerrac-spine__subtitle xerrac-tategaki stagger-item delay-3">
            {subtitle}
          </p>
        )}

        {readingTime && (
          <span className={`xerrac-spine__time stagger-item delay-4 ${bright ? 'text-gray-200' : ''}`}>
            ~{readingTime} min
          </span>
        )}
      </aside>
    )
  }

  return (
<div ref={ref} className={`mb-12 md:mb-16 relative ${entered ? 'entered' : ''}`}>

      <SectionNumber number={number} />

        <div className="relative">

          <div className="stagger-item delay-1 flex items-center gap-3 mb-4">

            <span style={{ color: titleColor || 'var(--accent-text)', filter: 'drop-shadow(0 0 2px currentColor)' }}>

              <SawIcon className="w-4 h-4" />

            </span>

            <span className="text-2xs tracking-[0.3em] uppercase font-mono tabular-nums font-semibold" style={{ color: 'var(--accent-text)' }}>

              {String(number).padStart(2, '0')}

            </span>

            <span
              className="h-px flex-1"
              style={{
                background:
                  'linear-gradient(to right, rgba(var(--accent-rgb, 220, 38, 38), 0.55), rgba(255, 255, 255, 0.16) 40%, transparent)',
              }}
            />

            {readingTime && (

              <span className={`text-2xs tracking-wider font-mono tabular-nums ${bright ? 'text-gray-200' : 'text-gray-400'}`}>

                ~{readingTime} min

              </span>

            )}

          </div>

          <h2 className={`stagger-item delay-2 text-3xl md:text-5xl font-black tracking-tight uppercase leading-[0.95] mb-4 ${titleColor ? '' : (accentTitle ? 'text-[var(--accent-text)]' : 'text-white')}`} style={titleColor ? { color: titleColor } : undefined}>

          {title}

        </h2>

        {subtitle && (

          <p className={`stagger-item delay-3 text-sm tracking-wider uppercase mb-4 max-w-2xl ${bright ? 'text-gray-100' : 'text-gray-300'}`}>

            {subtitle}

          </p>

        )}

        <div className={`stagger-rule ${subtitle ? 'delay-4' : 'delay-3'} w-12 h-[2px]`} style={{ backgroundColor: 'var(--accent)' }} />

      </div>

    </div>
  )
}
