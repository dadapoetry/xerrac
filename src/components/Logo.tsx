'use client'

interface LogoProps {
  compact?: boolean
  className?: string
}

export function Logo({ compact, className = '' }: LogoProps) {
  if (compact) {
    return (
      <a href="/" className={`no-underline flex items-center h-9 ${className}`}>
        <span className="text-sm font-bold tracking-tight text-white leading-none">
          Xerrac<span style={{ color: 'var(--accent-text, #df3939)' }}>!</span>
        </span>
      </a>
    )
  }

  return (
    <a href="/" className={`no-underline inline-block ${className}`}>
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        XERRAC<span style={{ color: 'var(--accent-text, #df3939)', filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb, 220, 38, 38), 0.45))' }}>!</span>
      </h1>
      <div className="h-[2px] w-full mt-1.5 md:mt-2" style={{ backgroundColor: 'var(--accent, #dc2626)' }} />
      <p className="text-2xs text-gray-300 tracking-[0.25em] uppercase mt-2 md:mt-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
        Revista d&apos;aclariment cultural
      </p>
    </a>
  )
}
