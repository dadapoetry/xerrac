'use client'

import { useState, useEffect, useCallback } from 'react'
import { IssueData, SECTION_LABELS } from '@/types'
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
  const el = document.querySelector(
    `[data-section-index="${index}"]`
  ) as HTMLElement | null
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function FanzineViewer({ issue }: FanzineViewerProps) {
  const sortedSections = [...issue.sections].sort((a, b) => a.order - b.order)
  const [activeSection, setActiveSection] = useState(0)


  useEffect(() => {
    let raf: number
    const check = () => {
      setActiveSection(getCurrentSectionIndex())
      raf = requestAnimationFrame(check)
    }
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
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

  const goNext = useCallback(() => {
    const cur = getCurrentSectionIndex()
    if (cur < sortedSections.length - 1) scrollToSectionEl(cur + 1)
  }, [sortedSections.length])

  const goPrev = useCallback(() => {
    const cur = getCurrentSectionIndex()
    if (cur > 0) scrollToSectionEl(cur - 1)
  }, [])

  const progress = ((activeSection + 1) / sortedSections.length) * 100
  const canGoPrev = activeSection > 0
  const canGoNext = activeSection < sortedSections.length - 1
  const currentSection = sortedSections[activeSection]

  return (
    <div>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 no-print bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 h-12">
          <Logo compact />

          <div className="flex-1 h-px bg-gray-900 relative">
            <div
              className="absolute left-0 top-0 h-full bg-red-500/60 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[11px] text-gray-400 font-mono tracking-wider">
            {String(activeSection + 1).padStart(2, '0')}/{String(sortedSections.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Side buttons */}
      <div className="fixed right-4 bottom-6 z-50 no-print flex flex-col gap-2">
        <a
          href="/arxiu"
          className="w-9 h-9 border border-gray-800 bg-black/80 text-gray-600 flex items-center justify-center hover:border-red-500/50 hover:text-red-400 transition-all text-xs"
          title="Arxiu"
        >☰</a>
      </div>

      {/* Sections */}
      {sortedSections.map((section, i) => (
        <div key={section.id} data-section-index={i}>
          <SectionRenderer section={section as any} index={i} />
        </div>
      ))}
    </div>
  )
}
