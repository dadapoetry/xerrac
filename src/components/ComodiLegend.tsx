import { XERRAC_COMODI_CLASS } from '@/components/xerracComodiBlot'

// Llegenda dels mots comodí: apareix una sola vegada, al final de la secció que
// en conté, perquè el ratllat de serra no quedi orfe de significat.
export function ComodiLegend() {
  return (
    <p className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
      <span className="xerrac-comodi-key" aria-hidden="true" />
      <span className="text-gray-400">Mot comodí</span>
      <span className="normal-case tracking-normal text-gray-500">
        paraula que ocupa el lloc d&rsquo;una idea
      </span>
    </p>
  )
}

export function hasComodi(content: unknown): boolean {
  if (content == null) return false
  try {
    return JSON.stringify(content).includes(XERRAC_COMODI_CLASS)
  } catch {
    return false
  }
}
