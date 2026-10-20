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

export function sectionLabel(type: string, title?: string): string {
  const t = (title || '').trim()
  return t || SECTION_LABELS[type] || type
}
