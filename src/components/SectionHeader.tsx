'use client'

import { useRef, useEffect, useState } from 'react'
import { SawIcon } from '@/components/SawIcon'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
  readingTime?: number
  bright?: boolean
}

export function SectionHeader({ number, title, subtitle, readingTime, bright }: SectionHeaderProps) {
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
            <span className={`text-2xs tracking-[0.3em] uppercase font-mono tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] ${bright ? 'text-gray-200' : 'text-gray-400'}`}>
              {String(number).padStart(2, '0')}
            </span>
            <span className={`h-px flex-1 ${bright ? 'bg-white/20' : 'bg-white/10'}`} />
            {readingTime && (
              <span className={`text-2xs tracking-wider font-mono tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] ${bright ? 'text-gray-300' : 'text-gray-500'}`}>
                ~{readingTime} min
              </span>
            )}
          </div>
          <h2 className="stagger-item delay-2 text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-[0.95] mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {title}
        </h2>
        {subtitle && (
          <p className={`stagger-item delay-3 text-sm tracking-wider uppercase mb-4 max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${bright ? 'text-gray-100' : 'text-gray-300'}`}>
            {subtitle}
          </p>
        )}
        <div className={`stagger-rule ${subtitle ? 'delay-4' : 'delay-3'} w-12 h-[2px]`} style={{ backgroundColor: 'var(--accent)' }} />
      </div>
    </div>
  )
}
