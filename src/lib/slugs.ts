import { SECTION_LABELS } from '@/types'

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface SectionRef {
  id: string
  type: string
  order: number
}

export function buildSectionSlugMap(sections: SectionRef[]): Map<string, string> {
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  const counters = new Map<string, number>()
  const map = new Map<string, string>()
  for (const s of sorted) {
    if (s.type === 'portada') continue
    const base = slugify(s.type) || 'seccio'
    const n = (counters.get(base) || 0) + 1
    counters.set(base, n)
    map.set(s.id, n === 1 ? base : `${base}-${n}`)
  }
  return map
}

export function issuePath(number: number): string {
  return `/numeros/${number}`
}

export function articlePath(number: number, slug: string): string {
  return `/numeros/${number}/${slug}`
}

// Adreça d'una secció dins de la revista: el número amb la secció a la
// consulta. És la que s'escriu a la barra d'adreces mentre es llegeix i la que
// es comparteix, de manera que qui rep l'enllaç veu la revista sencera i pot
// continuar llegint. La pàgina d'article (`articlePath`) és una altra cosa: la
// fitxa de la secció, per a cercadors i xarxes.
export function sectionQueryPath(number: number, slug: string): string {
  return `${issuePath(number)}?section=${slug}`
}

// Resol el paràmetre ?section= cap a una posició. Accepta el slug (format
// actual) i també un índex solt, per no trencar els enllaços que ja circulen.
// Retorna -1 si no hi ha paràmetre o no es pot resoldre. La portada no té
// slug, així que ?section=0 es resol a 0 però no a cap slug.
export function resolveSectionIndex(value: string | null | undefined, sections: SectionRef[]): number {
  if (value === null || value === undefined || value === '') return -1
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  const slugMap = buildSectionSlugMap(sections)
  const bySlug = sorted.findIndex((s) => slugMap.get(s.id) === value)
  if (bySlug >= 0) return bySlug
  const idx = parseInt(value, 10)
  return !isNaN(idx) && idx >= 0 && idx < sorted.length ? idx : -1
}

// El slug d'un ?section= donat, o null si no n'hi ha (portada o paràmetre buit).
export function resolveSectionSlug(value: string | null | undefined, sections: SectionRef[]): string | null {
  const index = resolveSectionIndex(value, sections)
  if (index < 0) return null
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  return buildSectionSlugMap(sections).get(sorted[index].id) ?? null
}

export function sectionLabel(type: string, title?: string): string {
  const t = (title || '').trim()
  return t || SECTION_LABELS[type] || type
}
