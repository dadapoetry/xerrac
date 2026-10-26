'use client'

interface LogoProps {
  compact?: boolean
  large?: boolean
  className?: string
  /** Si es passa, el logo es converteix en botó (no recarrega la pàgina). */
  onClick?: () => void
  /** URL alternativa per al mode enllaç. Per defecte `/`. */
  href?: string
}

export function Logo({ compact, large, className = '', onClick, href = '/' }: LogoProps) {
  if (onClick) {
    if (compact) {
      return (
        <button
          type="button"
          onClick={onClick}
          aria-label="Torna al sumari"
          className={`no-underline flex items-center h-9 ${className} cursor-pointer`}
        >
          <span className="text-sm font-bold tracking-tight text-white leading-none">
            Xerrac<span style={{ color: 'var(--accent-text, #df3939)' }}>!</span>
          </span>
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Torna al sumari"
        className={`no-underline inline-block ${className} cursor-pointer text-left`}
      >
        <h1 className={`${large ? 'text-6xl md:text-8xl' : 'text-masthead'} font-black tracking-tighter text-white leading-none`}>
          XERRAC<span style={{ color: 'var(--accent-text, #df3939)', filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb, 220, 38, 38), 0.45))' }}>!</span>
        </h1>
        <div className="h-px w-full mt-1.5 md:mt-2" style={{ backgroundColor: 'var(--accent, #dc2626)' }} />
        <p className="text-2xs text-gray-300 tracking-[0.25em] uppercase mt-2 md:mt-3">
          Revista d&apos;aclariment cultural
        </p>
      </button>
    )
  }

  if (compact) {
    return (
      <a href={href} className={`no-underline flex items-center h-9 ${className}`}>
        <span className="text-sm font-bold tracking-tight text-white leading-none">
          Xerrac<span style={{ color: 'var(--accent-text, #df3939)' }}>!</span>
        </span>
      </a>
    )
  }

  return (
    <a href={href} className={`no-underline inline-block ${className}`}>
      <h1 className={`${large ? 'text-6xl md:text-8xl' : 'text-masthead'} font-black tracking-tighter text-white leading-none`}>
        XERRAC<span style={{ color: 'var(--accent-text, #df3939)', filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb, 220, 38, 38), 0.45))' }}>!</span>
      </h1>
      <div className="h-px w-full mt-1.5 md:mt-2" style={{ backgroundColor: 'var(--accent, #dc2626)' }} />
      <p className="text-2xs text-gray-300 tracking-[0.25em] uppercase mt-2 md:mt-3">
        Revista d&apos;aclariment cultural
      </p>
    </a>
  )
}
