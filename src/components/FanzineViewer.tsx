'use client'

import { useState, useEffect } from 'react'
import { IssueData, SECTION_LABELS } from '@/types'
import { SectionRenderer } from './SectionRenderer'
import { generatePDF } from '@/lib/pdf'

interface FanzineViewerProps {
  issue: IssueData
}

export function FanzineViewer({ issue }: FanzineViewerProps) {
  const sortedSections = [...issue.sections].sort((a, b) => a.order - b.order)
  const [currentSection, setCurrentSection] = useState(0)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const els = document.querySelectorAll('[data-section-index]')
      let active = 0
      els.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 2) {
          active = parseInt(el.getAttribute('data-section-index') || '0')
        }
      })
      setCurrentSection(active)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const goToSection = (index: number) => {
    setCurrentSection(index)
    const el = document.querySelector(
      `[data-section-index="${index}"]`
    ) as HTMLElement | null
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'smooth' })
  }

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

  return (
    <div>
      <div className="fixed top-4 left-4 z-50 no-print">
        <span className="text-xs text-gray-600 uppercase tracking-wider">
          Núm. {issue.number}
        </span>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 no-print z-50 flex flex-col gap-2">
        <button
          onClick={() => goToSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="w-10 h-10 border border-gray-600 bg-black text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Anterior"
        >←</button>
        <button
          onClick={() => goToSection(Math.min(sortedSections.length - 1, currentSection + 1))}
          disabled={currentSection === sortedSections.length - 1}
          className="w-10 h-10 border border-gray-600 bg-black text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Següent"
        >→</button>
        <button
          onClick={handlePdf}
          disabled={generatingPdf}
          className="w-10 h-10 border border-gray-600 bg-black text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 disabled:opacity-50"
          title="PDF"
        >{generatingPdf ? '...' : '⎙'}</button>
      </div>

      <div className="fixed left-4 top-1/2 -translate-y-1/2 no-print z-50">
        <div className="flex flex-col gap-2">
          {sortedSections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => goToSection(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentSection ? 'bg-red-500 w-3 h-3' : 'bg-gray-700 hover:bg-gray-500'
              }`}
              title={SECTION_LABELS[section.type] || section.type}
            />
          ))}
        </div>
      </div>

      {sortedSections.map((section, i) => (
        <div key={section.id} data-section-index={i}>
          <SectionRenderer section={section as any} />
        </div>
      ))}
    </div>
  )
}
