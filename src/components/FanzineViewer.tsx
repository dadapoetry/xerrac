'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function FanzineViewer({ issue }: FanzineViewerProps) {
  const sortedSections = [...issue.sections].sort((a, b) => a.order - b.order)
  const types = sortedSections.map((s) => s.type)
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === 'undefined') return 0
    const hash = window.location.hash.slice(1)
    if (!hash) return 0
    const idx = types.indexOf(hash.replace('s-', ''))
    return idx >= 0 ? idx : 0
  })
  const [showHint, setShowHint] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('xerrac-keyboard-hint')
    if (!seen) {
      setShowHint(true)
      const timer = setTimeout(() => {
        setShowHint(false)
        localStorage.setItem('xerrac-keyboard-hint', '1')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = parseInt(entry.target.getAttribute('data-section-index') || '0')
            setActiveSection(i)
            const type = sortedSections[i]?.type
            if (type) {
              history.replaceState(null, '', `#${sectionSlug(type)}`)
            }
          }
        }
      },
      { threshold: 0.3 }
    )
    const els = document.querySelectorAll('[data-section-index]')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sortedSections])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const idx = types.indexOf(hash.replace('s-', ''))
      if (idx > 0) {
        setTimeout(() => scrollToSectionEl(idx), 150)
      }
    }
  }, [])

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

  const copySectionLink = useCallback(
    (type: string) => {
      const url = `${window.location.origin}${window.location.pathname}#${sectionSlug(type)}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    },
    []
  )

  return (
    <div>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 no-print bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 h-12">
          <Logo compact />

          <div className="flex-1 h-0.5 bg-gray-900 relative rounded overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[11px] text-gray-400 font-mono tracking-wider">
            {String(activeSection + 1).padStart(2, '0')}/{String(sortedSections.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Keyboard hint */}
      {showHint && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 no-print bg-black/90 border border-gray-800 px-4 py-2 text-xs text-gray-400 animate-fade-in">
          ← → o ↑ ↓ per navegar entre seccions
        </div>
      )}
      {copied && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 no-print bg-black/90 border border-gray-800 px-4 py-2 text-xs text-gray-400 animate-fade-in">
          Enllaç copiat
        </div>
      )}

      {/* Desktop section nav */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-50 no-print hidden md:flex flex-col items-center gap-3">
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500
              whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
              uppercase tracking-wider"
            >
              {section.title}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile section nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print md:hidden flex items-center gap-2 bg-black/80 border border-gray-800 px-3 py-1.5 rounded-full">
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

      {/* Side buttons */}
      <div className="fixed right-4 bottom-16 z-50 no-print flex flex-col gap-2">
        <button
          onClick={() => {
            const section = sortedSections[activeSection]
            if (section) copySectionLink(section.type)
          }}
          className="w-9 h-9 border border-gray-800 bg-black/80 text-gray-600 flex items-center justify-center
            hover:border-red-500/50 hover:text-red-400 transition-all text-xs"
          title="Compartir secció"
        >
          ↗
        </button>
      </div>
      <div className="fixed right-4 bottom-6 z-50 no-print flex flex-col gap-2">
        <a
          href="/arxiu"
          className="w-9 h-9 border border-gray-800 bg-black/80 text-gray-600 flex items-center justify-center
            hover:border-red-500/50 hover:text-red-400 transition-all text-xs"
          title="Arxiu"
        >
          ☰
        </a>
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
