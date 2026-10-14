'use client'

import { useRef, useEffect, useState } from 'react'
import { SawIcon } from '@/components/SawIcon'

export type SectionOpenerVariant = 'press' | 'spine' | 'register'

interface SectionOpenerProps {
  variant: SectionOpenerVariant
  number: number
  title: string
  subtitle?: string | null
  readingTime?: number
}

function useEntered() {
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

  return { ref, state: entered ? 'entered' : '' }
}

function ReadingTime({ readingTime, className = '' }: { readingTime?: number; className?: string }) {
  if (!readingTime) return null
  return (
    <p className={`text-[10px] text-gray-500 tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] ${className}`}>
      ~{readingTime} min de lectura
    </p>
  )
}

function PressOpener({ number, title, subtitle, readingTime }: Omit<SectionOpenerProps, 'variant'>) {
  const { ref, state } = useEntered()
  const num = String(number).padStart(2, '0')

  return (
    <div ref={ref} className={`mb-12 md:mb-16 ${state}`}>
      <div className="stagger-item delay-1 flex items-center gap-2 mb-4">
        <span style={{ color: 'var(--accent)' }}>
          <SawIcon className="w-4 h-4" />
        </span>
        <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-gray-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {num}
        </span>
      </div>
      <h2 className="stagger-item delay-2 text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
        {title}
      </h2>
      {subtitle && (
        <p className="stagger-item delay-3 text-base md:text-lg normal-case tracking-normal text-gray-300 max-w-2xl mb-5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          {subtitle}
        </p>
      )}
      <div className="stagger-rule delay-4 w-16 h-[2px]" style={{ backgroundColor: 'var(--accent)' }} />
      <ReadingTime readingTime={readingTime} className="stagger-item delay-5 mt-4" />
    </div>
  )
}

function SpineOpener({ number, title, subtitle, readingTime }: Omit<SectionOpenerProps, 'variant'>) {
  const { ref, state } = useEntered()
  const num = String(number).padStart(2, '0')

  return (
    <div ref={ref} className={`mb-12 md:mb-16 ${state}`}>
      <div className="md:hidden">
        <div className="stagger-item delay-1 flex items-center gap-2 mb-4">
          <span style={{ color: 'var(--accent)' }}>
            <SawIcon className="w-4 h-4" />
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-gray-400">{num}</span>
        </div>
        <h2 className="stagger-item delay-2 text-3xl font-black tracking-tight text-white uppercase leading-none mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {title}
        </h2>
        {subtitle && (
          <p className="stagger-item delay-3 text-sm tracking-wider uppercase text-gray-400 mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {subtitle}
          </p>
        )}
        <div className="stagger-rule delay-4 w-12 h-[2px]" style={{ backgroundColor: 'var(--accent)' }} />
        <ReadingTime readingTime={readingTime} className="stagger-item delay-5 mt-4" />
      </div>

      <div className="hidden md:flex items-stretch gap-6 min-h-[220px]">
        <span
          className="stagger-number font-black leading-[0.8] select-none self-start"
          style={{ color: 'var(--accent)', fontSize: 'clamp(4rem, 9vw, 8rem)' }}
        >
          {num}
        </span>
        <div className="stagger-item delay-2 border-l pl-6 flex items-center" style={{ borderColor: 'rgba(var(--accent-rgb), 0.3)' }}>
          <h2
            className="text-4xl lg:text-5xl font-black tracking-[0.15em] text-white uppercase leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            style={{ writingMode: 'vertical-rl' }}
          >
            {title}
          </h2>
        </div>
        <div className="stagger-item delay-3 flex flex-col justify-end gap-4 max-w-xs pb-1">
          {subtitle && (
            <p className="text-sm tracking-wider uppercase text-gray-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {subtitle}
            </p>
          )}
          <div className="stagger-rule delay-4 w-16 h-[2px]" style={{ backgroundColor: 'var(--accent)' }} />
          <ReadingTime readingTime={readingTime} className="stagger-item delay-5" />
        </div>
      </div>
    </div>
  )
}

function RegisterOpener({ number, title, subtitle, readingTime }: Omit<SectionOpenerProps, 'variant'>) {
  const { ref, state } = useEntered()
  const num = String(number).padStart(2, '0')

  return (
    <div ref={ref} className={`mb-10 md:mb-12 ${state}`}>
      <div className="stagger-item delay-1 flex items-center gap-3 mb-3">
        <span className="font-mono text-[11px] tracking-[0.25em] uppercase shrink-0" style={{ color: 'var(--accent)' }}>
          Reg. {num}
        </span>
        <span className="h-px flex-1 bg-white/10" />
        {readingTime ? (
          <span className="font-mono text-[10px] text-gray-500 shrink-0">~{readingTime} min</span>
        ) : null}
      </div>
      <h2 className="stagger-item delay-2 text-2xl md:text-4xl font-black tracking-tight text-white uppercase leading-none mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
        {title}
      </h2>
      {subtitle && (
        <p className="stagger-item delay-3 text-[11px] font-mono tracking-wider uppercase text-gray-400 mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
          {subtitle}
        </p>
      )}
      <div className="stagger-rule delay-4 h-[2px] w-full" style={{ backgroundColor: 'var(--accent)' }} />
    </div>
  )
}

export function SectionOpener(props: SectionOpenerProps) {
  if (props.variant === 'spine') return <SpineOpener {...props} />
  if (props.variant === 'register') return <RegisterOpener {...props} />
  return <PressOpener {...props} />
}
