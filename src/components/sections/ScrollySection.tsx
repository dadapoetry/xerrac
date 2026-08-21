'use client'

import { useEffect, useRef, useState } from 'react'
import { SectionData, ScrollyContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function ScrollySection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as ScrollyContent
  const steps = content.steps || []
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const rootEl = rootRef.current
    if (!rootEl) return
    const els = Array.from(rootEl.querySelectorAll('[data-scene]'))
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = parseInt(entry.target.getAttribute('data-scene') || '0', 10)
            if (!isNaN(i)) setActive(i)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [steps.length])

  if (steps.length === 0) {
    return (
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <SectionHeader number={index} title={section.title} subtitle="Assaig visual" />
          <p className="text-gray-600 text-sm">Aquest assaig encara no té escenes.</p>
        </div>
      </div>
    )
  }

  let mediaIdx = -1
  for (let i = Math.min(active, steps.length - 1); i >= 0; i--) {
    if (steps[i]?.media) { mediaIdx = i; break }
  }
  if (mediaIdx === -1) mediaIdx = steps.findIndex((s) => s.media)
  const current = mediaIdx >= 0 ? steps[mediaIdx] : undefined

  const jumpTo = (i: number) => {
    try {
      const el = rootRef.current?.querySelector(`[data-scene="${i}"]`) as HTMLElement | null
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch {}
  }

  return (
    <section ref={rootRef} className="relative w-full bg-black" style={{ height: `${steps.length * 100}svh` }}>
      {/* Capa visual clavada a pantalla sencera */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {steps.map((step, i) =>
          step.media ? (
            <img
              key={i}
              src={step.media}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-all ease-out ${
                i === active
                  ? 'opacity-100 duration-[1600ms] motion-safe:scale-100'
                  : 'opacity-0 duration-[900ms] motion-safe:scale-[1.08]'
              }`}
            />
          ) : null
        )}
        {!steps.some((s) => s.media) && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-800 text-xs uppercase tracking-widest">
            Sense imatges
          </div>
        )}

        {/* Degradats de llegibilitat */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Peu de foto de l'escena activa */}
        {current?.caption && (
          <p
            key={mediaIdx}
            className="absolute bottom-6 left-6 md:left-12 max-w-md font-mono text-[11px] leading-relaxed tracking-wide text-gray-300 animate-fade-in"
          >
            {current.caption}
          </p>
        )}

        {/* Comptador */}
        <div className="absolute bottom-6 right-6 md:right-14 font-mono text-[11px] tracking-widest text-gray-400">
          {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </div>

        {/* Punts de progrés navegables */}
        <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 z-[5]">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`Anar a l'escena ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === active
                  ? 'bg-[var(--accent)] scale-150 shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]'
                  : 'bg-white/25 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Escenes de text que passen per sobre */}
      <div className="absolute inset-0 pointer-events-none">
        {steps.map((step, i) => (
          <div key={i} data-scene={i} className="h-[100svh] flex items-center justify-center px-4 md:px-8">
            <div
              className={`max-w-xl pointer-events-auto transition-all duration-700 ease-out ${
                i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {i === 0 && (
                <div className="mb-8 pointer-events-none">
                  <SectionHeader number={index} title={section.title} subtitle="Assaig visual" />
                </div>
              )}
              {step.text && (
                <div className="border border-white/10 bg-black/60 backdrop-blur-sm p-6 md:p-8 shadow-2xl">
                  <div
                    className="text-gray-100 leading-relaxed text-[15px] md:text-lg"
                    dangerouslySetInnerHTML={{ __html: step.text }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
