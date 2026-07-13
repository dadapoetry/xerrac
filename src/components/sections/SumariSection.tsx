'use client'

import { useEffect, useRef, useState } from 'react'
import { SawIcon } from '@/components/SawIcon'

interface SumariEntry {
  title: string
  displayIndex: number
}

export function SumariSection({ entries, coverImage }: { entries: SumariEntry[]; coverImage?: string }) {
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

  function goToSection(index: number) {
    const el = document.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null
    if (!el) return
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {}
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col justify-end pb-16 md:pb-24">
      {coverImage ? (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${coverImage}")` }}
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/60 to-black" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-black" />
      )}
      <div
        ref={ref}
        className={`relative z-[2] px-4 ${entered ? 'entered' : ''}`}
      >
        <div className="max-w-lg mx-auto w-full">
          <p className="stagger-item text-[9px] text-gray-600 tracking-[0.35em] uppercase font-mono mb-5 text-center">
            En aquest número
          </p>
          <div className="flex flex-col gap-0.5">
            {entries.map((entry, i) => (
              <button
                key={entry.displayIndex}
                onClick={() => goToSection(entry.displayIndex)}
                className="w-full text-left group flex items-center gap-2 stagger-item py-0.5"
                style={{ transitionDelay: `${80 + i * 85}ms` }}
              >
                <span className="text-[10px] font-mono text-gray-600 w-5 shrink-0 text-right leading-none">
                  {String(entry.displayIndex).padStart(2, '0')}
                </span>
                <SawIcon className="w-[10px] h-[10px] shrink-0 opacity-30" />
                <span className="text-sm text-white/70 tracking-tight leading-tight group-hover:text-white transition-colors">
                  {entry.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
