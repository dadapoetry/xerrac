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
  let closest = Infinity
  els.forEach((el) => {
    try {
      const rect = el.getBoundingClientRect()
      const dist = Math.abs(rect.top)
      if (dist < closest) {
        closest = dist
        const val = parseInt(el.getAttribute('data-section-index') || '0', 10)
        if (!isNaN(val)) idx = val
      }
    } catch {}
  })
  return idx
}

function scrollToSectionEl(index: number) {
  const el = document.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null
  if (!el) return
  try {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {}
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
    let prevIdx = -1
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        ticking.current = false
        try {
          const idx = getCurrentSectionIndex()
          if (idx === prevIdx) return
          prevIdx = idx
          setActiveSection(idx)
          const type = sortedSections[idx]?.type
          if (type) {
            try {
              history.replaceState(null, '', `#${sectionSlug(type)}`)
            } catch {}
          }
        } catch {}
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
      try {
        const cur = getCurrentSectionIndex()
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (cur > 0) scrollToSectionEl(cur - 1)
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          if (cur < sortedSections.length - 1) scrollToSectionEl(cur + 1)
        }
      } catch {}
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sortedSections.length])

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
      {/* Header — sticky at top, accompanies reader */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 no-print relative">
        <div className="flex items-center gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />

          <div className="flex items-center gap-0 flex-1 overflow-x-auto min-w-0">
            {sortedSections.map((section, i) => (
              <button
                key={section.id}
                onClick={() => scrollToSectionEl(i)}
                className={`text-[10px] uppercase tracking-wider whitespace-nowrap px-2 h-5 flex items-center leading-none transition-colors shrink-0 ${
                  i === activeSection
                    ? 'text-red-400'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {section.type === 'portada' ? issue.title : section.title}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-gray-400 font-mono tracking-wider min-w-[2.5em] text-right shrink-0">
            {String(activeSection + 1).padStart(2, '0')}/{String(sortedSections.length).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={shareLink}
              className="w-8 h-8 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/50
                transition-all flex items-center justify-center"
              title="Compartir secció"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.475l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
              </svg>
            </button>
            <a
              href="/arxiu"
              className="w-8 h-8 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/50
                transition-all flex items-center justify-center"
              title="Arxiu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
                <path d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5Z" />
              </svg>
            </a>
          </div>
        </div>
        {copied && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 bg-black/90 border border-gray-800 px-4 py-2 text-xs text-gray-400 animate-fade-in whitespace-nowrap">
            Enllaç copiat
          </div>
        )}
      </div>

      {/* Sections */}
      {sortedSections.map((section, i) => (
        <div key={section.id} data-section-index={i} id={sectionSlug(section.type)}>
          <SectionRenderer section={section as any} index={i} />
        </div>
      ))}
    </div>
  )
}
