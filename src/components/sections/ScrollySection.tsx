'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { SectionData, ScrollyContent } from '@/types'

function splitParagraphs(html: string): string[] {
  const m = html.match(/<p[\s\S]*?<\/p>/gi)
  if (!m || m.length === 0) return html.trim() ? [html] : []
  const leftover = html.replace(/<p[\s\S]*?<\/p>/gi, '').trim()
  const parts = leftover ? [...m, `<p>${leftover}</p>`] : m
  return parts.filter((p) => p.trim())
}

function RevealText({ html, active, right, kick }: { html: string; active: boolean; right?: boolean; kick?: boolean }) {
  const paras = useMemo(() => splitParagraphs(html), [html])
  if (kick) {
    return (
      <div className={right ? 'text-right' : ''}>
        {paras.map((p, i) => (
          <p
            key={i}
            className={`text-center font-black uppercase leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-4xl md:text-6xl lg:text-7xl transition-all duration-[1200ms] ease-out ${
              active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${i * 120}ms` }}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>
    )
  }
  return (
    <div className={right ? 'text-right' : ''}>
      {paras.map((p, i) => (
        <div
          key={i}
          className={`text-gray-100 leading-loose font-serif text-[15px] md:text-lg prose-invert transition-all duration-[900ms] ease-out ${
            active
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          } ${i > 0 ? 'mt-6 md:mt-8' : ''}`}
          style={{ transitionDelay: `${300 + i * 220}ms` }}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      ))}
    </div>
  )
}

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
        <div className="max-w-4xl mx-auto py-12">
          <h2 className="font-black uppercase tracking-tight text-white text-3xl md:text-5xl leading-none">{section.title}</h2>
          {content.subtitle && <p className="mt-4 text-sm tracking-wider uppercase text-gray-300">{content.subtitle}</p>}
          <p className="mt-8 text-gray-600 text-sm">Aquest assaig encara no té escenes.</p>
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
                i === mediaIdx
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

        {/* Fosquitud subtil sobre les imatges */}
        <div className="pointer-events-none absolute inset-0 bg-black/15" />

        {/* Peu de foto de l'escena activa */}
        {current?.caption && (
          <p
            key={mediaIdx}
            className="absolute bottom-6 left-6 md:left-12 max-w-md font-mono text-[11px] leading-relaxed tracking-wide text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] animate-fade-in"
          >
            {current.caption}
          </p>
        )}

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
        {steps.map((step, i) => {
          const dist = i - active
          const parallax = dist * 40
          return (
          <div key={i} data-scene={i} className="h-[100svh] flex items-center px-4 md:px-8">
            <div
              className={`pointer-events-auto transition-all duration-700 ease-out ${
                i === active ? 'opacity-100' : 'opacity-0'
              } ${step.position === 'center' ? 'mx-auto' : step.position === 'right' ? 'ml-auto mr-[12%]' : 'mr-auto ml-[12%]'}`}
              style={{ transform: `translateY(${parallax}px)` }}
            >
              {step.kick ? (
                <div
                  className={`max-w-4xl transition-all duration-[900ms] ease-out ${
                    i === active ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <RevealText
                    kick
                    html={step.text}
                    active={i === active}
                    right={step.position === 'right'}
                  />
                </div>
              ) : (
              <>
              {step.title && (
                <h4
                  className={`mb-6 max-w-xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] ${
                    i === 0 ? 'text-5xl md:text-7xl' : 'text-3xl md:text-5xl'
                  } ${step.position === 'right' ? 'text-right' : ''}`}
                >
                  {step.title}
                </h4>
              )}
              {i === 0 && content.subtitle && (
                <p className="-mt-4 mb-6 max-w-xl text-sm md:text-base tracking-wider uppercase text-gray-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {content.subtitle}
                </p>
              )}
              {step.text && (
                <div
                  className={`max-w-xl ${
                    step.readable
                      ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
                      : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  }`}
                >
                  <RevealText
                    html={step.text}
                    active={i === active}
                    right={step.position === 'right'}
                  />
                </div>
              )}
              {i === steps.length - 1 && (
                <div
                  className={`mt-10 flex max-w-xl items-center gap-3 transition-all duration-[900ms] ease-out ${
                    i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } ${step.position === 'right' ? 'justify-end' : ''}`}
                  style={{ transitionDelay: `${400 + (splitParagraphs(step.text || '').length) * 220}ms` }}
                >
                  <span className="h-px w-8 bg-white/40" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                    Continua llegint ↓
                  </span>
                </div>
              )}
              </>
              )}
            </div>
          </div>
          )
        })}
      </div>
    </section>
  )
}
