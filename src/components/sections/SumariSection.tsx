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
    <div className="min-h-screen w-full relative overflow-hidden">
      {coverImage ? (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${coverImage}")` }}
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/50 to-black" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-black" />
      )}
      <div
        ref={ref}
        className={`relative z-[2] min-h-screen flex flex-col justify-center px-4 py-24 ${entered ? 'entered' : ''}`}
      >
        <div className="max-w-lg mx-auto w-full">
          <p className="stagger-item text-[10px] text-gray-500 tracking-[0.3em] uppercase font-mono mb-12 text-center">
            En aquest número
          </p>
          <div className="space-y-5">
            {entries.map((entry, i) => (
              <button
                key={entry.displayIndex}
                onClick={() => goToSection(entry.displayIndex)}
                className="w-full text-left group flex items-start gap-4 stagger-item"
                style={{ transitionDelay: `${80 + i * 85}ms` }}
              >
                <span
                  className="text-[40px] md:text-[52px] font-black leading-none shrink-0 select-none"
                  style={{ color: 'var(--accent)', opacity: 0.12 }}
                >
                  {String(entry.displayIndex).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <SawIcon className="w-4 h-4 shrink-0 transition-opacity duration-500 opacity-60" />
                    <span className="text-sm font-bold text-white tracking-tight leading-tight group-hover:text-gray-300 transition-colors">
                      {entry.title}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
