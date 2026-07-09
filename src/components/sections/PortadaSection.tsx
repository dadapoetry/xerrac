'use client'

import { useState, useEffect } from 'react'
import { SectionData, PortadaContent } from '@/types'
import { Logo } from '@/components/Logo'
import { SawIcon } from '@/components/SawIcon'

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
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-pulse pointer-events-none">
      <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em]">Desplaça</span>
      <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  )
}

export function PortadaSection({ section }: { section: SectionData }) {
  const content = section.content as unknown as PortadaContent

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4 relative overflow-hidden">
      <SawIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] md:w-[420px] opacity-[0.04] pointer-events-none" />

      <div className="max-w-lg w-full relative">
        <Logo className="mb-8" />

        {content.topic && (
          <p className="text-3xl md:text-4xl text-gray-100 font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {content.topic}
          </p>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}
