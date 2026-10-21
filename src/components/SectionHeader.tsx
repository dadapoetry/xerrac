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
  /** Rail vertical (tategaki): títol i subtítol en escriptura vertical. */
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

  // Rail vertical: com l'etiqueta de departament d'una revista japonesa, on
  // el títol es llegeix de dalt a baixo i la columna deixa lloc al cos.
  //
  // La integració al text passa per un fil vertical d'accent que neix de la
  // serra i baixa per tota la secció: uneix el capçal amb el cos en lloc de
  // deixar-lo flotant al marge. La serra hi serveix d'ancoratge, com a la
  // resta de seccions.
  if (vertical) {
    return (
      <div
        ref={ref}
        className={`relative mb-8 md:mb-0 ${entered ? 'entered' : ''}`}
      >
        {/* Filet d'accent: el llom de la secció, de dalt a baix. */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{
            background:
              'linear-gradient(to bottom, rgba(var(--accent-rgb), 0.6) 0%, rgba(var(--accent-rgb), 0.22) 45%, transparent 100%)',
          }}
        />

        <div className="pl-4 md:pl-5">
          {/* Ancoratge: la serra, com a la resta de seccions. */}
          <span
            className="stagger-item delay-1 inline-block"
            style={{ color: titleColor || 'var(--accent-text)', filter: 'drop-shadow(0 0 2px currentColor)' }}
          >
            <SawIcon className="w-4 h-4" />
          </span>

          <div className="mt-4 flex items-start gap-3 md:gap-4">
            <span className="stagger-item delay-1 [writing-mode:vertical-rl] text-orientation-mixed font-mono text-2xs tracking-[0.3em] uppercase font-semibold shrink-0" style={{ color: 'var(--accent-text)' }}>
              {String(number).padStart(2, '0')}
            </span>

            <h2
              className="stagger-item delay-2 [writing-mode:vertical-rl] text-orientation-mixed text-xl sm:text-2xl md:text-4xl font-black tracking-tight uppercase leading-[0.95] whitespace-nowrap shrink-0"
              style={{ color: titleColor || (accentTitle ? 'var(--accent-text)' : 'var(--paper)') }}
            >
              {title}
            </h2>

            {subtitle && (
              <p className="stagger-item delay-3 [writing-mode:vertical-rl] text-orientation-mixed font-serif italic text-sm md:text-base leading-[1.8] text-gray-400 whitespace-nowrap shrink-0">
                {subtitle}
              </p>
            )}

            {readingTime && (
              <span className={`stagger-item delay-4 [writing-mode:vertical-rl] text-orientation-mixed font-mono text-2xs tracking-wider tabular-nums shrink-0 ${bright ? 'text-gray-200' : 'text-gray-600'}`}>
                ~{readingTime} min
              </span>
            )}
          </div>
        </div>
      </div>
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
