'use client'

interface SectionHeaderProps {
  number: number
  title: string
  subtitle?: string | null
}

function SawMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50,8 L54,18 L64,14 L62,26 L74,24 L70,36 L82,36 L76,48 L86,50 L76,52 L82,64 L70,62 L74,74 L62,70 L64,82 L54,76 L50,86 L46,76 L36,82 L38,70 L26,74 L30,62 L18,64 L24,52 L14,50 L24,48 L18,36 L30,38 L26,26 L38,30 L36,18 L46,26 Z"
        fill="#ef4444"
      />
      <circle cx="50" cy="50" r="14" fill="#000000" />
      <circle cx="50" cy="50" r="5" fill="#ef4444" />
    </svg>
  )
}

export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12 md:mb-16">
      <div className="flex items-center gap-2 mb-4">
        <SawMark className="w-3 h-3" />
        <span className="text-[10px] text-gray-500 tracking-[0.3em] uppercase font-mono">
          {String(number).padStart(2, '0')}
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-400 tracking-wider uppercase mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
          {subtitle}
        </p>
      )}
      <div className="w-12 h-[2px] bg-red-500/60" />
    </div>
  )
}
