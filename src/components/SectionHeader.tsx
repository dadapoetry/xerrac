'use client'

import { useRef, useEffect, useState } from 'react'
import { SawIcon } from '@/components/SawIcon'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
  readingTime?: number
  bright?: boolean
  accentTitle?: boolean
}

export function SectionHeader({ number, title, subtitle, readingTime, bright, accentTitle }: SectionHeaderProps) {
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

  return (
<div ref={ref} className={`mb-12 md:mb-16 relative ${entered ? 'entered' : ''}`}>

      <div className="stagger-number absolute -top-10 -left-4 text-section-num font-black select-none pointer-events-none leading-none" style={{ color: 'var(--accent)' }}>

        {String(number).padStart(2, '0')}

      </div>

        <div className="relative">

          <div className="stagger-item delay-1 flex items-center gap-3 mb-4">

            <span style={{ color: 'var(--accent-text)' }}>

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

          <h2 className={`stagger-item delay-2 text-3xl md:text-5xl font-black tracking-tight uppercase leading-[0.95] mb-4 ${accentTitle ? 'text-[var(--accent-text)]' : 'text-white'}`}>

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
