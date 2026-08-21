import { ImageResponse } from 'next/og'

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
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractExcerpt(content: unknown, maxLen = 220): string {
  if (!content || typeof content !== 'object') return ''
  const c = content as Record<string, any>
  if (c.topic) return String(c.topic).slice(0, maxLen)
  if (c.source) return `Entrevista a ${c.source}`
  if (c.body) return stripHtml(c.body).slice(0, maxLen)
  if (c.proverbs) return (c.proverbs as any[]).map((e) => e?.text).filter(Boolean).join(' · ').slice(0, maxLen)
  if (c.interviews) return (c.interviews as any[]).map((e) => e?.subject || stripHtml(e?.body || '')).filter(Boolean).join(', ').slice(0, maxLen)
  if (c.reviews) return (c.reviews as any[]).map((e) => e?.title || stripHtml(e?.body || '')).filter(Boolean).join(', ').slice(0, maxLen)
  if (c.collages) return (c.collages as any[]).map((e) => e?.description).filter(Boolean).join(' · ').slice(0, maxLen)
  if (c.crossword) return 'L\'enigma del número'
  return ''
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

  if (issueId) {
    try {
      const { getIssue } = await import('@/lib/actions')
      const issue = await getIssue(issueId)
      if (issue) {
        number = String(issue.number).padStart(2, '0')
        accent = issue.accentColor || '#ef4444'

        const sections = [...((issue.sections as any[]) || [])].sort((a, b) => a.order - b.order)
        const idx = sectionParam !== null ? parseInt(sectionParam, 10) : NaN

        if (!isNaN(idx) && idx > 0 && idx < sections.length) {
          const s = sections[idx]
          title = (s.title || typeLabels[s.type] || s.type).toUpperCase()
          subtitle = `Núm. ${number}`
          let content: unknown = s.content
          if (typeof content === 'string') {
            try { content = JSON.parse(content) } catch { content = {} }
          }
          excerpt = extractExcerpt(content)
        } else {
          title = issue.title.toUpperCase()
          subtitle = `Núm. ${number}`
        }
      }
    } catch {}
  }

  const titleSize = excerpt ? 52 : number ? 72 : 160

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
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
              color: 'rgba(255,255,255,0.2)',
              marginTop: 12,
              fontWeight: 400,
            }}
          >
            Xerrac! — Revista d&apos;aclariment cultural
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
