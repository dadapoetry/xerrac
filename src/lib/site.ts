const DEFAULT_URL = 'https://xerrac.vercel.app'

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_URL || DEFAULT_URL
}

export function absoluteUrl(path: string = '/'): string {
  const base = getSiteUrl().replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
