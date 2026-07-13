'use client'

interface LogoProps {
  compact?: boolean
  className?: string
}

export function Logo({ compact, className = '' }: LogoProps) {
  if (compact) {
    return (
      <a href="/" className={`no-underline flex items-center h-5 ${className}`}>
        <span className="text-sm font-bold tracking-tight text-white leading-none">
          Xerrac<span style={{ color: 'var(--accent, #ef4444)' }}>!</span>
        </span>
      </a>
    )
  }

  return (
    <a href="/" className={`no-underline inline-block ${className}`}>
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        XERRAC<span style={{ color: 'var(--accent, #ef4444)', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.4))' }}>!</span>
      </h1>
      <div className="h-[2px] w-full mt-1.5 md:mt-2" style={{ backgroundColor: 'var(--accent, #ef4444)' }} />
      <p className="text-[10px] text-gray-400 tracking-[0.25em] uppercase mt-2 md:mt-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
        Revista d&apos;aclariment cultural
      </p>
    </a>
  )
}
