'use client'

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { IssueData } from '@/types'
import { SectionRenderer } from './SectionRenderer'
import { Logo } from './Logo'
import { SawIcon } from './SawIcon'
import { NewsletterPopUp } from './NewsletterPopUp'

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.substring(0,2), 16)}, ${parseInt(h.substring(2,4), 16)}, ${parseInt(h.substring(4,6), 16)}`
}

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

function sectionSlug(index: number) {
  return `s-${index}`
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
    const match = hash.match(/^s-(\d+)$/)
    if (!match) return 0
    const idx = parseInt(match[1], 10)
    return idx >= 0 && idx < types.length ? idx : 0
  })
  const [copied, setCopied] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [idle, setIdle] = useState(false)
  const ticking = useRef(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout>>()
  const navRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onActivity = () => {
      setIdle(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdle(true), 4000)
    }
    window.addEventListener('scroll', onActivity, { passive: true })
    window.addEventListener('wheel', onActivity, { passive: true })
    onActivity()
    return () => {
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('wheel', onActivity)
      clearTimeout(idleTimer.current)
    }
  }, [])

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
          if (idx >= 2) setShowNewsletter(true)
          try {
            history.replaceState(null, '', `#${sectionSlug(idx)}`)
          } catch {}
        } catch {}
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sortedSections])

  useLayoutEffect(() => {
    const container = navRef.current
    if (!container) return
    if (activeSection === 0) {
      container.scrollLeft = 0
      return
    }
    const btn = container.children[activeSection] as HTMLElement | undefined
    if (!btn) return
    if (btn.offsetWidth > container.offsetWidth) {
      container.scrollLeft = btn.offsetLeft
    } else {
      const targetCenter = btn.offsetLeft + btn.offsetWidth / 2
      const target = Math.max(0, Math.min(targetCenter - container.offsetWidth / 2, container.scrollWidth - container.offsetWidth))
      container.scrollTo({ left: target, behavior: 'smooth' })
    }
  }, [activeSection])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const match = hash.match(/^s-(\d+)$/)
      if (match) {
        const idx = parseInt(match[1], 10)
        if (idx >= 0 && idx < sortedSections.length) {
          setTimeout(() => scrollToSectionEl(idx), 150)
        }
      }
    }
  }, [sortedSections.length])

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
    const url = `${window.location.origin}${window.location.pathname}#${sectionSlug(activeSection)}`
    copyToClipboard(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [activeSection, sortedSections])

  if (sortedSections.length === 0) {
    return (
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex items-center gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />
          <span className="text-sm text-gray-600">Cap secció disponible</span>
        </div>
      </div>
    )
  }

  const accentColor = issue.accentColor || '#ef4444'

  return (
    <div style={{ '--accent': accentColor, '--accent-rgb': hexToRgb(accentColor) } as React.CSSProperties}>
      {/* Header — sticky at top, accompanies reader */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 no-print relative">
        <div className="flex items-center gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />

          <SawIcon
            className={`w-4 h-4 transition-opacity duration-300 shrink-0 ${activeSection > 0 ? 'opacity-60' : 'opacity-20'} ${idle && activeSection > 0 ? 'animate-blade-sway' : ''}`}
            color={accentColor}
          />

          <div ref={navRef} className="flex items-center gap-0 flex-1 overflow-x-auto min-w-0">
            {sortedSections.map((section, i) => (
              <button
                key={section.id}
                onClick={() => scrollToSectionEl(i)}
                className={`nav-btn text-[10px] uppercase tracking-wider whitespace-nowrap px-2 h-5 flex items-center leading-none transition-colors shrink-0 ${
                  i === activeSection
                    ? 'active'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
                style={i === activeSection ? { color: 'var(--accent)' } : undefined}
              >
                {section.type === 'portada' ? issue.title : section.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={shareLink}
                className="w-8 h-8 border border-gray-800 text-gray-400 hover:border-red-500/50
                  transition-all flex items-center justify-center"
                style={{ '--btn-hover': 'var(--accent)' } as React.CSSProperties}
                title="Compartir secció"
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '' }}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 animate-check-pop">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.475l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
                  </svg>
                )}
              </button>
            <a
              href="/arxiu"
              className="w-8 h-8 border border-gray-800 text-gray-400 hover:border-red-500/50
                transition-all flex items-center justify-center"
              title="Arxiu"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '' }}
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
        <NewsletterPopUp visible={showNewsletter} onDismiss={() => setShowNewsletter(false)} />
      </div>

      {/* Sections */}
      {sortedSections.map((section, i) => (
        <div key={section.id} data-section-index={i} id={sectionSlug(i)}>
          <SectionRenderer section={section as any} index={i} />
        </div>
      ))}
    </div>
  )
}
