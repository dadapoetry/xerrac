'use client'

import { useRef, useEffect, useState } from 'react'
import { SawIcon } from '@/components/SawIcon'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
  readingTime?: number
}

export function SectionHeader({ number, title, subtitle, readingTime }: SectionHeaderProps) {
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
      <div className="stagger-number absolute -top-10 -left-4 text-[140px] md:text-[220px] font-black select-none pointer-events-none leading-none" style={{ color: 'var(--accent)' }}>
        {String(number).padStart(2, '0')}
      </div>
      <div className="relative">
        <div className="stagger-item delay-1 flex items-center gap-2 mb-4">
          <span style={{ color: 'var(--accent)' }}>
            <SawIcon className="w-4 h-4" />
          </span>
          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {String(number).padStart(2, '0')}
          </span>
        </div>
        <h2 className="stagger-item delay-2 text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {title}
        </h2>
        {subtitle && (
          <p className="stagger-item delay-3 text-sm text-gray-300 tracking-wider uppercase mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {subtitle}
          </p>
        )}
        {readingTime && (
          <p className={`stagger-item ${subtitle ? 'delay-4' : 'delay-3'} text-[10px] text-gray-500 tracking-wider mb-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]`}>
            ~{readingTime} min de lectura
          </p>
        )}
        <div className={`stagger-rule ${subtitle ? readingTime ? 'delay-5' : 'delay-4' : readingTime ? 'delay-4' : 'delay-3'} w-12 h-[2px] opacity-60`} style={{ backgroundColor: 'var(--accent)' }} />
      </div>
    </div>
  )
}
