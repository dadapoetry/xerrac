'use client'

import { useState, useEffect, useCallback } from 'react'
import { IssueData, SECTION_LABELS } from '@/types'
import { SectionRenderer } from './SectionRenderer'
import { generatePDF } from '@/lib/pdf'

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
  const [generatingPdf, setGeneratingPdf] = useState(false)

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

  const handlePdf = async () => {
    setGeneratingPdf(true)
    try {
      const sections = sortedSections.map((s) => ({
        type: s.type,
        title: s.title,
        content: s.content,
        backgroundImage: s.backgroundImage,
      }))
      await generatePDF({
        number: issue.number,
        title: issue.title,
        date: issue.date,
        sections,
      })
    } catch {
      window.print()
    } finally {
      setGeneratingPdf(false)
    }
  }

  const progress = ((activeSection + 1) / sortedSections.length) * 100
  const canGoPrev = activeSection > 0
  const canGoNext = activeSection < sortedSections.length - 1
  const currentSection = sortedSections[activeSection]

  return (
    <div>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 no-print bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-3 px-4 h-10">
          <span className="text-xs text-gray-500 uppercase tracking-widest shrink-0">
            N.{issue.number}
          </span>
          <div className="flex-1 h-px bg-gray-800 relative">
            <div
              className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 truncate max-w-[200px]">
            {currentSection ? SECTION_LABELS[currentSection.type] || currentSection.title : ''}
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 no-print bg-black/80 backdrop-blur-sm border-t border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={goPrev}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors uppercase tracking-wider ${
              canGoPrev ? 'text-gray-400 hover:text-white' : 'text-gray-700'
            }`}
          >
            ← {canGoPrev ? SECTION_LABELS[sortedSections[activeSection - 1]?.type] || 'Anterior' : '—'}
          </button>

          <div className="flex items-center gap-2">
            {sortedSections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToSectionEl(i)}
                className={`text-[10px] uppercase tracking-widest transition-all duration-200 px-1.5 py-1 rounded ${
                  i === activeSection
                    ? 'text-red-400 bg-red-900/30 font-bold'
                    : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={goNext}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors uppercase tracking-wider ${
              canGoNext ? 'text-gray-400 hover:text-white' : 'text-gray-700'
            }`}
          >
            {canGoNext ? SECTION_LABELS[sortedSections[activeSection + 1]?.type] || 'Següent' : '—'} →
          </button>
        </div>
      </div>

      {/* Side PDF button */}
      <div className="fixed right-4 bottom-20 z-50 no-print">
        <button
          onClick={handlePdf}
          disabled={generatingPdf}
          className="w-10 h-10 border border-gray-700 bg-black/80 text-gray-500 flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white disabled:opacity-50 transition-all text-sm"
          title="PDF"
        >{generatingPdf ? '...' : '⎙'}</button>
      </div>

      {sortedSections.map((section, i) => (
        <div key={section.id} data-section-index={i}>
          <SectionRenderer section={section as any} />
        </div>
      ))}
    </div>
  )
}
