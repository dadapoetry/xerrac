'use client'

import { useState, useCallback, useEffect } from 'react'
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
    const ratios = new Map<Element, number>()
    const els = document.querySelectorAll('[data-section-index]')
    els.forEach((el) => ratios.set(el, 0))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio)
        }
        let bestIdx = 0
        let bestRatio = 0
        for (const [el, ratio] of ratios) {
          const idx = (el as HTMLElement).getAttribute('data-section-index')
          if (idx !== null && ratio > bestRatio) {
            bestRatio = ratio
            bestIdx = parseInt(idx)
          }
        }
        setCurrentSection(bestIdx)
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sortedSections.length])

  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= sortedSections.length) return
    setCurrentSection(index)
    const el = document.querySelector(
      `[data-section-index="${index}"]`
    ) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [sortedSections.length])

  const handlePdf = useCallback(async () => {
    setGeneratingPdf(true)
    try {
      const sections = sortedSections.map((s) => ({
        type: s.type,
        title: s.title,
        content: s.content,
      }))
      await generatePDF({
        number: issue.number,
        title: issue.title,
        date: issue.date,
        sections,
      })
    } catch (err) {
      console.error('PDF error, falling back to print:', err)
      window.print()
    } finally {
      setGeneratingPdf(false)
    }
  }, [issue, sortedSections])

  return (
    <div>
      <div className="fixed top-4 left-4 z-50 no-print">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 uppercase tracking-wider">
            Núm. {issue.number}
          </span>
          <span className="text-xs text-gray-700">
            {new Date(issue.date).toLocaleDateString('ca-ES', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 no-print z-50 flex flex-col gap-2">
        <button
          onClick={() => goToSection(currentSection - 1)}
          disabled={currentSection === 0}
          className="w-10 h-10 border border-gray-600 bg-black text-white flex items-center
            justify-center hover:bg-red-600 hover:border-red-600 transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed"
          title="Secció anterior"
        >
          ←
        </button>
        <button
          onClick={() => goToSection(currentSection + 1)}
          disabled={currentSection === sortedSections.length - 1}
          className="w-10 h-10 border border-gray-600 bg-black text-white flex items-center
            justify-center hover:bg-red-600 hover:border-red-600 transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed"
          title="Secció següent"
        >
          →
        </button>
        <button
          onClick={handlePdf}
          disabled={generatingPdf}
          className="w-10 h-10 border border-gray-600 bg-black text-white flex items-center
            justify-center hover:bg-red-600 hover:border-red-600 transition-colors
            disabled:opacity-50"
          title="Descarrega PDF"
        >
          {generatingPdf ? '...' : '⎙'}
        </button>
      </div>

      <div className="fixed left-4 top-1/2 -translate-y-1/2 no-print z-50">
        <div className="flex flex-col gap-2">
          {sortedSections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => goToSection(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300
                ${i === currentSection
                  ? 'bg-red-500 w-3 h-3'
                  : 'bg-gray-700 hover:bg-gray-500'
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
