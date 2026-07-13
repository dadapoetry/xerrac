'use client'

import { SawIcon } from '@/components/SawIcon'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
}

export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12 md:mb-16 relative">
      <div className="absolute -top-10 -left-4 text-[140px] md:text-[220px] font-black select-none pointer-events-none leading-none opacity-[0.04]" style={{ color: 'var(--accent)' }}>
        {String(number).padStart(2, '0')}
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <SawIcon className="w-5 h-5" />
          <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {String(number).padStart(2, '0')}
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-300 tracking-wider uppercase mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {subtitle}
          </p>
        )}
        <div className="w-12 h-[2px] opacity-60" style={{ backgroundColor: 'var(--accent)' }} />
      </div>
    </div>
  )
}
