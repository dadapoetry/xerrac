import { SawIcon } from '@/components/SawIcon'

// Divisor entre seccions: la serra de la marca, el número de la secció que
// comença i un filet. Marca el ritme del número sense afegir-hi un bloc nou.
// El número és el de la secció que ve a continuació (el mateix que encapçala).
export function SectionDivider({ number, accentColor }: { number: number; accentColor?: string }) {
  return (
    <div className="section-divider no-print" aria-hidden="true">
      <span className="section-divider-line" />
      <span className="flex items-center gap-2 px-1">
        <SawIcon className="w-3.5 h-3.5 opacity-50" color={accentColor} />
        <span className="font-mono text-2xs tabular-nums tracking-[0.25em] text-gray-400">
          {String(number).padStart(2, '0')}
        </span>
      </span>
      <span className="section-divider-line" />
    </div>
  )
}
