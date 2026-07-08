'use client'

import { useState, useCallback, useRef } from 'react'
import { IssueData, SECTION_LABELS } from '@/types'
import { SectionRenderer } from './SectionRenderer'

interface FanzineViewerProps {
  issue: IssueData
}

export function FanzineViewer({ issue }: FanzineViewerProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const sortedSections = [...issue.sections].sort((a, b) => a.order - b.order)

  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= sortedSections.length) return
    setCurrentSection(index)
    const el = document.getElementById(`section-${sortedSections[index].id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [sortedSections])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div ref={containerRef}>
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

      <div className="fanzine-nav no-print">
        <button
          onClick={() => goToSection(currentSection - 1)}
          disabled={currentSection === 0}
          className="disabled:opacity-30 disabled:cursor-not-allowed"
          title="Secció anterior"
        >
          ←
        </button>
        <button
          onClick={() => goToSection(currentSection + 1)}
          disabled={currentSection === sortedSections.length - 1}
          className="disabled:opacity-30 disabled:cursor-not-allowed"
          title="Secció següent"
        >
          →
        </button>
        <button onClick={handlePrint} title="Imprimeix / PDF">
          ⎙
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

      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section as any} />
      ))}
    </div>
  )
}
