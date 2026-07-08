'use client'

interface LogoProps {
  compact?: boolean
  className?: string
}

export function Logo({ compact, className = '' }: LogoProps) {
  if (compact) {
    return (
      <a href="/" className={`no-underline flex items-center gap-2 ${className}`}>
        <span className="text-sm font-bold tracking-tight text-white leading-none">
          XERRAC<span className="text-red-500">!</span>
        </span>
      </a>
    )
  }

  return (
    <a href="/" className={`no-underline inline-block ${className}`}>
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
        XERRAC<span className="text-red-500">!</span>
      </h1>
      <p className="text-[10px] text-gray-500 tracking-[0.25em] uppercase mt-2">
        Revista d&apos;aclariment cultural
      </p>
    </a>
  )
}
