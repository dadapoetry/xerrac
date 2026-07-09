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

        {/* Section nav strip */}
        <div className="flex items-center gap-0 px-3 pb-1.5 overflow-x-auto no-scrollbar">
          {sortedSections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => scrollToSectionEl(i)}
              className={`text-[10px] uppercase tracking-wider whitespace-nowrap px-2 py-0.5 transition-colors ${
                i === activeSection
                  ? 'text-red-400'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <span className="hidden md:inline">{section.title}</span>
              <span className={`md:hidden block w-1.5 h-1.5 rounded-full ${
                i === activeSection ? 'bg-red-500' : 'bg-gray-600'
              }`} />
            </button>
          ))}
        </div>
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
