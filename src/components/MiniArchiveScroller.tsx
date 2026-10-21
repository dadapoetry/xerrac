'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { issuePath } from '@/lib/slugs'

interface Issue {
  id: string
  number: number
  title: string
  sections?: { type: string; backgroundImage?: string }[]
}

export function MiniArchiveScroller({ issues, currentIssueNumber }: { issues: Issue[]; currentIssueNumber?: number }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [update])

  const scrollBy = (delta: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Drag-to-scroll (desktop)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let isDown = false
    let startX = 0
    let startScroll = 0
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      isDown = true
      startX = e.clientX
      startScroll = el.scrollLeft
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
      el.style.scrollSnapType = 'none'
    }
    const onMove = (e: PointerEvent) => {
      if (!isDown) return
      el.scrollLeft = startScroll - (e.clientX - startX)
    }
    const onUp = (e: PointerEvent) => {
      if (!isDown) return
      isDown = false
      el.releasePointerCapture(e.pointerId)
      el.style.cursor = ''
      el.style.scrollSnapType = ''
      update()
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [update])

  const sorted = [...issues].sort((a, b) => a.number - b.number)

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="mini-archive-scroller flex gap-4 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`.mini-archive-scroller::-webkit-scrollbar{display:none;}`}</style>
        {sorted.map((issue) => {
          const cover = issue.sections?.find((s) => s.type === 'portada')?.backgroundImage || ''
          const isCurrent = issue.number === currentIssueNumber
          return (
            <Link
              key={issue.id}
              href={issuePath(issue.number)}
              className={`group shrink-0 w-40 border transition-colors ${isCurrent ? 'border-[var(--accent)]' : 'border-gray-800 hover:border-gray-600'}`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                {cover && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url("${cover}")` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="font-mono text-2xs tracking-[0.2em]" style={{ color: 'var(--accent-text)' }}>
                    Núm. {String(issue.number).padStart(2, '0')}
                  </div>
                  <div className="text-xs font-bold text-white leading-tight line-clamp-2 mt-1">
                    {issue.title}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Arrow buttons (visible on hover / when scrollable) */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-240)}
          aria-label="Anterior"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center bg-black/80 border border-gray-700 text-gray-200 hover:text-white hover:border-gray-500 transition-colors z-10"
        >
          ‹
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy(240)}
          aria-label="Següent"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 flex items-center justify-center bg-black/80 border border-gray-700 text-gray-200 hover:text-white hover:border-gray-500 transition-colors z-10"
        >
          ›
        </button>
      )}
    </div>
  )
}
