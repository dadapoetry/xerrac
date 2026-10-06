import { ImageResponse } from 'next/og'
import { getOgFonts } from '@/lib/ogFonts'
import { getOgBackground } from '@/lib/ogImage'

export const runtime = 'nodejs'

const typeLabels: Record<string, string> = {
  portada: 'Portada',
  editorial: 'Editorial',
  aclariment_cultural: 'Aclariment Cultural',
  fadu_catala: 'Fadu Català',
  pagines_grogues: 'Pàgines Grogues',
  calaix_sastre: 'Calaix de Sastre',
  visita: 'Visita',
  full_mural: 'Full Mural',
  ludita: 'Ludita',
  scrolly: 'Assaig visual',
  necrologiques: 'Necrològiques',
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const TEXT_KEYS = ['body', 'text', 'content', 'description', 'quote', 'topic', 'summary', 'caption', 'answer']

function isNoise(value: string): boolean {
  return /^(https?:|data:|blob:|\/)/i.test(value)
}

function collectText(
  value: unknown,
  key: string | null,
  depth: number,
  out: { key: string | null; text: string }[],
): void {
  if (depth > 8 || out.length > 80) return
  if (typeof value === 'string') {
    const text = stripHtml(value)
    if (text && !isNoise(text)) out.push({ key, text })
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, key, depth + 1, out)
    return
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectText(v, k, depth + 1, out)
  }
}

function genericText(content: unknown): string {
  const found: { key: string | null; text: string }[] = []
  collectText(content, null, 0, found)
  if (found.length === 0) return ''
  const preferred = found.filter((f) => f.key !== null && TEXT_KEYS.includes(f.key))
  const pool = preferred.length > 0 ? preferred : found
  return pool.reduce((best, f) => (f.text.length > best.text.length ? f : best), pool[0]).text
}

function firstSentenceEnd(text: string): number {
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch !== '.' && ch !== '!' && ch !== '?') continue
    const next = text[i + 1]
    if (next === undefined || next === ' ') return i
  }
  return -1
}

function cutExcerpt(text: string, maxLen: number): string {
  const clean = stripHtml(String(text ?? ''))
  if (!clean) return ''
  const end = firstSentenceEnd(clean)
  if (end >= 0 && end + 1 <= maxLen) return clean.slice(0, end + 1)
  if (clean.length <= maxLen) return clean
  const window = clean.slice(0, maxLen)
  const space = window.lastIndexOf(' ')
  return (space > 0 ? window.slice(0, space) : window).trim()
}

function extractExcerpt(content: unknown, maxLen = 220): string {
  if (!content || typeof content !== 'object') return ''
  const c = content as Record<string, any>
  let text = ''
  if (typeof c.topic === 'string' && c.topic) text = c.topic
  else if (typeof c.source === 'string' && c.source) text = `Entrevista a ${c.source}`
  else if (typeof c.body === 'string' && c.body) text = c.body
  else if (Array.isArray(c.proverbs)) text = c.proverbs.map((e: any) => e?.text).filter(Boolean).join(' · ')
  else if (Array.isArray(c.interviews)) text = c.interviews.map((e: any) => e?.subject || (typeof e?.body === 'string' ? stripHtml(e.body) : '')).filter(Boolean).join(', ')
  else if (Array.isArray(c.reviews)) text = c.reviews.map((e: any) => e?.title || (typeof e?.body === 'string' ? stripHtml(e.body) : '')).filter(Boolean).join(', ')
  else if (Array.isArray(c.collages)) text = c.collages.map((e: any) => e?.description).filter(Boolean).join(' · ')
  else if (c.crossword) text = 'L\'enigma del número'
  if (!text) text = genericText(c)
  return cutExcerpt(text, maxLen)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const issueId = searchParams.get('issue')
  const sectionParam = searchParams.get('section')

  let title = 'XERRAC!'
  let subtitle = "Revista d'aclariment cultural"
  let number = ''
  let excerpt = ''
  let accent = '#ef4444'
  let cover = ''

  if (issueId) {
    try {
      const { getIssue } = await import('@/lib/data')
      const issue = await getIssue(issueId)
      if (issue) {
        number = String(issue.number).padStart(2, '0')
        accent = issue.accentColor || '#ef4444'

        const sections = [...((issue.sections as any[]) || [])].sort((a, b) => a.order - b.order)
        cover = sections.find((s) => s.type === 'portada')?.backgroundImage || ''
        const idx = sectionParam !== null ? parseInt(sectionParam, 10) : NaN

        if (!isNaN(idx) && idx > 0 && idx < sections.length) {
          const s = sections[idx]
          title = (s.title || typeLabels[s.type] || s.type).toUpperCase()
          subtitle = `Núm. ${number}`
          let content: unknown = s.content
          if (typeof content === 'string') {
            try { content = JSON.parse(content) } catch { content = { body: content } }
          }
          excerpt = extractExcerpt(content)
        } else {
          title = issue.title.toUpperCase()
          subtitle = `Núm. ${number}`
        }
      }
    } catch {}
  }

  if (!cover) {
    try {
      const { getLatestIssue } = await import('@/lib/data')
      const latest = await getLatestIssue()
      cover = (((latest?.sections as any[]) || []).find((s) => s.type === 'portada')?.backgroundImage) || ''
    } catch {}
  }
  const background = await getOgBackground(cover)

  const titleSize = excerpt ? 52 : number ? 72 : 160

  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          position: 'relative',
          display: 'flex',
        }}
      >
        {background && (
          <img
            src={background}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {background && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(10,10,10,0.78)',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            color: '#fafafa',
            display: 'flex',
            gap: '8px',
            textAlign: 'center',
            padding: '0 60px',
          }}
        >
          {title}
          <span style={{ color: accent }}>!</span>
        </div>
        {excerpt && (
          <div
            style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.55)',
              marginTop: 28,
              maxWidth: 820,
              textAlign: 'center',
              lineHeight: 1.5,
              padding: '0 40px',
              display: 'flex',
            }}
          >
            {excerpt}
          </div>
        )}
        <div
          style={{
            width: 60,
            height: 3,
            background: accent,
            opacity: 0.6,
            margin: '24px 0 0',
            display: 'flex',
          }}
        />
        <div
          style={{
            fontSize: 24,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginTop: 20,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
        {number && (
          <div
            style={{
              fontSize: 14,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              marginTop: 12,
              fontWeight: 400,
            }}
          >
            Xerrac! — Revista d&apos;aclariment cultural
          </div>
        )}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await getOgFonts() },
  )

  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return response
}
