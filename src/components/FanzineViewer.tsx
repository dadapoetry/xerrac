'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { IssueData } from '@/types'
import { SectionRenderer } from './SectionRenderer'
import { Logo } from './Logo'

interface FanzineViewerProps {
  issue: IssueData
}

function getCurrentSectionIndex(): number {
  const els = document.querySelectorAll('[data-section-index]')
  let idx = 0
  els.forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.top <= 2) {
      idx = parseInt(el.getAttribute('data-section-index') || '0')
    }
  })
  return idx
}

function scrollToSectionEl(index: number) {
  const el = document.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function sectionSlug(type: string) {
  return `s-${type}`
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

export function FanzineViewer({ issue }: FanzineViewerProps) {
  const sortedSections = useMemo(
    () => [...issue.sections].sort((a, b) => a.order - b.order),
    [issue.sections]
  )
  const types = useMemo(() => sortedSections.map((s) => s.type), [sortedSections])
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === 'undefined') return 0
    const hash = window.location.hash.slice(1)
    if (!hash) return 0
    const idx = types.indexOf(hash.replace('s-', ''))
    return idx >= 0 ? idx : 0
  })
  const [copied, setCopied] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const idx = getCurrentSectionIndex()
        setActiveSection(idx)
        const type = sortedSections[idx]?.type
        if (type) history.replaceState(null, '', `#${sectionSlug(type)}`)
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sortedSections])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const idx = types.indexOf(hash.replace('s-', ''))
      if (idx > 0) {
        setTimeout(() => scrollToSectionEl(idx), 150)
      }
    }
  }, [types])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cur = getCurrentSectionIndex()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (cur > 0) scrollToSectionEl(cur - 1)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (cur < sortedSections.length - 1) scrollToSectionEl(cur + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sortedSections.length])

  const progress = ((activeSection + 1) / sortedSections.length) * 100

  const shareLink = useCallback(() => {
    const section = sortedSections[activeSection]
    if (!section) return
    const url = `${window.location.origin}${window.location.pathname}#${sectionSlug(section.type)}`
    copyToClipboard(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [activeSection, sortedSections])

  return (
    <div>
      {/* Header — scrolls with content */}
      <div className="bg-black border-b border-gray-800 no-print">
        <div className="flex items-center gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />

          <div className="flex-1 h-0.5 bg-gray-900 relative rounded overflow-hidden min-w-[3rem]">
            <div
              className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[10px] text-gray-400 font-mono tracking-wider min-w-[2.5em] text-right shrink-0">
            {String(activeSection + 1).padStart(2, '0')}/{String(sortedSections.length).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={shareLink}
              className="w-7 h-7 border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-500/50
                transition-all text-xs flex items-center justify-center"
              title="Compartir secció"
            >
              ↗
            </button>
            <a
              href="/arxiu"
              className="w-7 h-7 border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-500/50
                transition-all text-xs flex items-center justify-center"
              title="Arxiu"
            >
              ☰
            </a>
          </div>
        </div>

      </div>

      {/* Section nav — fixed right side */}
      <nav className="fixed right-5 top-24 z-40 no-print hidden md:flex flex-col items-center gap-3">
        {sortedSections.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollToSectionEl(i)}
            className="group relative flex items-center justify-center"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === activeSection
                  ? 'w-2.5 h-2.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                  : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400'
              }`}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-gray-500
              whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
              uppercase tracking-wider"
            >
              {section.title}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile section nav — bottom strip */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print md:hidden flex items-center gap-2 bg-black/80 border border-gray-800 px-3 py-1.5 rounded-full">
        {sortedSections.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollToSectionEl(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === activeSection ? 'bg-red-500 scale-125' : 'bg-gray-600'
            }`}
            title={section.title}
          />
        ))}
      </div>

      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 no-print bg-black/90 border border-gray-800 px-4 py-2 text-xs text-gray-400 animate-fade-in">
          Enllaç copiat
        </div>
      )}

      {/* Sections */}
      {sortedSections.map((section, i) => (
        <div key={section.id} data-section-index={i} id={sectionSlug(section.type)}>
          <SectionRenderer section={section as any} index={i} />
        </div>
      ))}
    </div>
  )
}
