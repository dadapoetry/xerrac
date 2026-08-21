'use client'

import { useEffect, useRef, useState } from 'react'
import { SectionData, ScrollyContent } from '@/types'
import { SectionHeader } from '@/components/SectionHeader'

export function ScrollySection({ section, index }: { section: SectionData; index: number }) {
  const content = section.content as unknown as ScrollyContent
  const steps = content.steps || []
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rootEl = containerRef.current
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
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [steps.length])

  let mediaIdx = -1
  for (let i = Math.min(active, steps.length - 1); i >= 0; i--) {
    if (steps[i]?.media) { mediaIdx = i; break }
  }
  if (mediaIdx === -1) mediaIdx = steps.findIndex((s) => s.media)
  const current = mediaIdx >= 0 ? steps[mediaIdx] : undefined

  return (
    <div className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader number={index} title={section.title} subtitle="Assaig visual" />

        <div ref={containerRef} className="mt-8 md:grid md:grid-cols-[3fr_2fr] md:gap-12">
          <div className="hidden md:block">
            <div className="sticky top-16">
              <div className="relative border border-gray-800 bg-black overflow-hidden h-[70vh]">
                {current?.media ? (
                  <img
                    key={current.media}
                    src={current.media}
                    alt={current.caption || ''}
                    className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-xs uppercase tracking-widest">
                    Sense imatge
                  </div>
                )}
                {current?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-xs text-gray-300">
                    {current.caption}
                  </div>
                )}
                <div className="absolute top-3 right-3 font-mono text-[10px] text-gray-500 bg-black/60 px-2 py-1">
                  {String(mediaIdx + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          <div>
            {steps.map((step, i) => (
              <div key={i} data-scene={i} className="min-h-[55vh] md:min-h-[70vh] flex items-center py-10">
                <div
                  className="transition-opacity duration-500"
                  style={{ opacity: active === i ? 1 : 0.35 }}
                >
                  {step.media && (
                    <img
                      src={step.media}
                      alt={step.caption || ''}
                      className="md:hidden w-full aspect-[4/3] object-cover border border-gray-800 mb-5"
                    />
                  )}
                  <div
                    className="text-gray-300 leading-relaxed text-[15px] md:text-base"
                    dangerouslySetInnerHTML={{ __html: step.text }}
                  />
                  {step.caption && (
                    <p className="md:hidden text-xs text-gray-500 mt-3">{step.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
