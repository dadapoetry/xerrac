'use client'

import { useState, useEffect, useCallback } from 'react'
import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'

function ScrollHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
      <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em]">Desplaça</span>
      <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  )
}

interface SumariEntry {
  number: string
  title: string
}

export function PortadaSection({ section, sumariEntries, issueNumber, issueId }: { section: SectionData; sumariEntries?: SumariEntry[]; issueNumber?: number; issueId?: string }) {
  const content = section.content as unknown as PortadaContent
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (downloading || !issueId) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/pdf/${issueId}`)
      if (!res.ok) throw new Error('Error generating PDF')
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="?(.+?)"?$/)
      const filename = match ? match[1] : `xerrac-${String(issueNumber ?? '').padStart(2, '0')}.pdf`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('No s\'ha pogut generar el PDF. Torna-ho a intentar.')
    } finally {
      setDownloading(false)
    }
  }, [downloading, issueId, issueNumber])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4 relative overflow-hidden">
      <div className="max-w-lg w-full relative">
        <Logo className="mb-5" />

        {content.topic && (
          <p className="text-3xl md:text-4xl text-gray-100 font-bold">
            {content.topic}
          </p>
        )}

        {sumariEntries && sumariEntries.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-1 text-xs text-gray-300">
            {sumariEntries.map((entry, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-gray-500 select-none mx-0.5">/</span>}
                <span className="font-mono text-[10px] text-gray-400">{entry.number}</span>
                <span className="text-gray-200">{entry.title}</span>
              </span>
            ))}
          </div>
        )}
        {issueId && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="group relative mt-6 inline-flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-bold
              tracking-[0.15em] uppercase text-gray-300 border border-gray-700 rounded-sm
              hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-wait
              transition-colors duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/8 to-red-500/0
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300" />
            <span className="relative z-10 flex items-center gap-2.5">
              {downloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Generant...</span>
                </>
              ) : (
                <>
                  <span className="relative">
                    Llegeix en PDF
                    <span className="absolute -inset-x-1 bottom-0 h-px bg-red-400/0 group-hover:bg-red-400/60
                      transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left" />
                  </span>
                  <svg className="w-3.5 h-3.5 transition-all duration-500 group-hover:translate-y-0.5 group-hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ transform: 'translateY(1px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </>
              )}
            </span>
          </button>
        )}
      </div>

      {issueNumber !== undefined && (
        <span className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none z-10">Nº&nbsp;{String(issueNumber).padStart(2, '0')}</span>
      )}
      <ScrollHint />
    </div>
  )
}
