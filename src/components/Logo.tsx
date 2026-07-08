'use client'

interface LogoProps {
  compact?: boolean
  className?: string
}

export function Logo({ compact, className = '' }: LogoProps) {
  if (compact) {
    return (
      <a href="/" className={`no-underline flex items-center gap-2 ${className}`}>
        <SawMark className="w-3.5 h-3.5 shrink-0" />
        <span className="text-sm font-bold tracking-tight text-white leading-none">
          XERRAC<span className="text-red-500">!</span>
        </span>
      </a>
    )
  }

  return (
    <a href="/" className={`no-underline inline-block ${className}`}>
      <div className="flex items-center gap-4 mb-2">
        <SawMark className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            XERRAC<span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">!</span>
          </h1>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 tracking-[0.25em] uppercase mt-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
        Revista d&apos;aclariment cultural
      </p>
    </a>
  )
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
