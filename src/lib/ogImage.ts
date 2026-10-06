import { getSiteUrl } from './site'

const cache = new Map<string, string>()

function resolveUrl(value: string): string {
  const url = (value || '').trim()
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) {
    try {
      return `${getSiteUrl().replace(/\/+$/, '')}${url}`
    } catch {
      return ''
    }
  }
  return ''
}

function coverUrl(url: string): string {
  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return url
  const tail = url.slice(idx + marker.length)
  const head = tail.split('/')[0] || ''
  if (head.includes(',')) return url
  return `${url.slice(0, idx + marker.length)}f_jpg,q_auto,w_1200,h_630,c_fill/${tail}`
}

function detect(buf: Buffer): string {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length > 3 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  return ''
}

export async function getOgBackground(value: string): Promise<string | null> {
  const resolved = resolveUrl(value)
  if (!resolved) return null

  const src = coverUrl(resolved)
  const hit = cache.get(src)
  if (hit) return hit

  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const mime = detect(buf)
    if (!mime || buf.length > 6_000_000) return null
    const dataUri = `data:${mime};base64,${buf.toString('base64')}`
    cache.set(src, dataUri)
    return dataUri
  } catch {
    return null
  }
}
