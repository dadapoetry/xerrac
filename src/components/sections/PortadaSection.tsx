'use client'

import { useState, useEffect } from 'react'
import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'
import { SawIcon } from '@/components/SawIcon'

interface SumariEntry {
  number: string
  title: string
}

export function PortadaSection({ section, sumariEntries }: { section: SectionData; sumariEntries?: SumariEntry[] }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="relative w-full min-h-[80vh] flex flex-col overflow-hidden">
      <SawIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[520px] opacity-[0.03] pointer-events-none animate-spin-slow" />

      <div className="relative z-10 flex flex-col min-h-[80vh]">
        <div className="flex items-start justify-between px-4 md:px-6 pt-6 md:pt-8">
          <Logo />
          <span className="text-[11px] text-gray-600 font-mono">Nº&nbsp;03</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          {content.topic && (
            <p className="text-4xl md:text-5xl lg:text-6xl text-gray-100 font-bold leading-tight text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] max-w-3xl">
              {content.topic}
            </p>
          )}
        </div>

        {sumariEntries && sumariEntries.length > 0 && (
          <div className="px-4 md:px-6 pb-6 md:pb-8">
            <div className="max-w-md mx-auto md:mx-0 md:ml-auto">
              <div className="space-y-2">
                {sumariEntries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-[11px] leading-none w-6 text-right shrink-0"
                      style={{ color: 'rgba(var(--accent-rgb), 0.5)' }}
                    >
                      {entry.number}
                    </span>
                    <span className="text-sm text-gray-200/80 leading-none">{entry.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
