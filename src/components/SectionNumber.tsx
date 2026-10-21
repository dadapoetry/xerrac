interface SectionNumberProps {
  number: number
  color?: string
  className?: string
}

/**
 * Número de secció gegant de fons (140-220px, font-black, opacitat 0.04).
 * Component reutilitzable per a totes les seccions que mostren el número de fons.
 */
export function SectionNumber({ number, color, className = '' }: SectionNumberProps) {
  return (
    <div
      className={`stagger-number absolute -top-10 -left-4 text-section-num font-black select-none pointer-events-none leading-none ${className}`}
      style={{ color: color || 'var(--accent)' }}
      aria-hidden="true"
    >
      {String(number).padStart(2, '0')}
    </div>
  )
}
