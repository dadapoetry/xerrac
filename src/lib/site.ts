const DEFAULT_URL = 'https://laxerrac.cat'

export const DEFAULT_CONTACT_EMAIL = 'contacte@laxerrac.cat'

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_URL || DEFAULT_URL
}

export function absoluteUrl(path: string = '/'): string {
  const base = getSiteUrl().replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/* Construeix la URL de la imatge OG (/api/og). Sense paràmetres dóna la imatge
   genèrica (portada del darrer número); amb `issue`/`section` la del número o
   secció; amb `title`/`subtitle`/`excerpt` una a mida per a les pàgines
   estàtiques. */
export interface OgImageOptions {
  issue?: string
  section?: number
  title?: string
  subtitle?: string
  excerpt?: string
}

export function ogImageUrl(options: OgImageOptions = {}): string {
  const params = new URLSearchParams()
  if (options.issue) params.set('issue', options.issue)
  if (options.section !== undefined) params.set('section', String(options.section))
  if (options.title) params.set('title', options.title)
  if (options.subtitle) params.set('subtitle', options.subtitle)
  if (options.excerpt) params.set('excerpt', options.excerpt)
  const qs = params.toString()
  return `${getSiteUrl()}/api/og${qs ? `?${qs}` : ''}`
}
