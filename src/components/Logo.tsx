'use client'

interface LogoProps {
  compact?: boolean
  className?: string
}

export function Logo({ compact, className = '' }: LogoProps) {
  return (
    <a href="/" className={`no-underline ${className}`}>
      {compact ? (
        <span className="flex items-center gap-2">
          <SawIcon className="w-5 h-5" />
          <span className="text-base font-black tracking-tight text-white">
            XERRAC<span className="text-red-500">!</span>
          </span>
        </span>
      ) : (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <SawIcon className="w-8 h-8 md:w-10 md:h-10" />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                XERRAC<span className="text-red-500">!</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">
                Revista d&apos;aclariment cultural
              </p>
            </div>
          </div>
        </div>
      )}
    </a>
  )
}

function SawIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50,8 L54,18 L64,14 L62,26 L74,24 L70,36 L82,36 L76,48 L86,50 L76,52 L82,64 L70,62 L74,74 L62,70 L64,82 L54,76 L50,86 L46,76 L36,82 L38,70 L26,74 L30,62 L18,64 L24,52 L14,50 L24,48 L18,36 L30,38 L26,26 L38,30 L36,18 L46,26 Z"
        fill="#dc2626"
      />
      <circle cx="50" cy="50" r="12" fill="#0a0a0a" />
      <circle cx="50" cy="50" r="5" fill="#dc2626" />
    </svg>
  )
}
