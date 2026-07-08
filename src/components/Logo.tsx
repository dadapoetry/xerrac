'use client'

interface LogoProps {
  compact?: boolean
  className?: string
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16,18 L52,18
          L66,24 L52,30 L66,36 L52,42
          L66,48 L52,54 L66,60 L52,66
          L16,66 Z"
        fill="#ef4444"
      />
      <rect x="16" y="18" width="33" height="48" rx="1" fill="#000000" />
      <line x1="22" y1="30" x2="44" y2="30" stroke="#ef4444" strokeWidth="1" opacity="0.45" />
      <line x1="22" y1="39" x2="40" y2="39" stroke="#ef4444" strokeWidth="1" opacity="0.35" />
      <line x1="22" y1="48" x2="36" y2="48" stroke="#ef4444" strokeWidth="1" opacity="0.25" />
    </svg>
  )
}

export function Logo({ compact, className = '' }: LogoProps) {
  if (compact) {
    return (
      <a href="/" className={`no-underline flex items-center gap-2.5 ${className}`}>
        <Mark className="w-5 h-5 shrink-0" />
        <span className="text-sm font-bold tracking-tight text-white leading-none">
          XERRAC<span className="text-red-500">!</span>
        </span>
      </a>
    )
  }

  return (
    <a href="/" className={`no-underline inline-block ${className}`}>
      <div className="flex items-center gap-5">
        <Mark className="w-14 h-14 md:w-20 md:h-20 shrink-0" />
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            XERRAC<span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">!</span>
          </h1>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 tracking-[0.25em] uppercase mt-2 ml-[4.25rem] md:ml-[5.5rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
        Revista d&apos;aclariment cultural
      </p>
    </a>
  )
}
