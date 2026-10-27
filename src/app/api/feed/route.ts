import { getPublishedIssues } from '@/lib/data'
import { getAllSettings } from '@/lib/settings'
import { escapeXml } from '@/lib/utils'
import { getSiteUrl } from '@/lib/site'
import { issuePath } from '@/lib/slugs'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function extractText(content: any, maxLen: number): string {
  if (!content || typeof content !== 'object') return ''
  if (content.body) return stripHtml(content.body).slice(0, maxLen)
  if (content.topic) return content.topic.slice(0, maxLen)
  if (content.source) return `Entrevista a ${content.source}`
  if (content.proverbs) {
    return content.proverbs.map((e: any) => e.text).filter(Boolean).join(' · ').slice(0, maxLen)
  }
  if (content.interviews) {
    return content.interviews.map((e: any) => stripHtml(e.body || '')).filter(Boolean).join(' ').slice(0, maxLen)
  }
  if (content.reviews) {
    return content.reviews.map((e: any) => stripHtml(e.body || '')).filter(Boolean).join(' ').slice(0, maxLen)
  }
  if (content.investigacio) {
    return content.investigacio.map((e: any) => stripHtml(e.body || '')).filter(Boolean).join(' ').slice(0, maxLen)
  }
  if (content.collages) {
    return content.collages.map((e: any) => e.description).filter(Boolean).join(' ').slice(0, maxLen)
  }
  if (content.crossword) {
    return 'Crossword'
  }
  return ''
}

function getIssueImage(issue: any): string | null {
  const sections = (issue.sections as any[]) || []
  const portada = sections.find((s: any) => s.type === 'portada')
  if (!portada) return null

  if (portada.backgroundImage && portada.backgroundImage.trim()) {
    return portada.backgroundImage
  }
  if (portada.backgroundImageMobile && portada.backgroundImageMobile.trim()) {
    return portada.backgroundImageMobile
  }

  let content = portada.content
  if (typeof content === 'string') {
    try { content = JSON.parse(content) } catch { content = {} }
  }
  if (content?.image && typeof content.image === 'string' && content.image.trim()) {
    return content.image
  }
  if (content?.cover && typeof content.cover === 'string' && content.cover.trim()) {
    return content.cover
  }

  return null
}

const typeLabels: Record<string, string> = {
  portada: 'Portada',
  editorial: 'Editorial',
  aclariment_cultural: 'Aclariment Cultural',
  fadu_catala: 'Fadu Català',
  pagines_grogues: 'Pàgines Grogues',
  calaix_sastre: 'Calaix Desastre',
  visita: 'Visita',
  full_mural: 'Full Mural',
  ludita: 'Ludita',
  assaig: 'Assaig visual',
}

export const revalidate = 0

export async function GET() {
  const issues = await getPublishedIssues()
  const settings = await getAllSettings()
  const copyright = settings.footer_copyright || 'Xerrac!'

  const items = issues.map((issue) => {
    const sections = (issue.sections as any[]).map((s: any) => {
      let content = s.content
      if (typeof content === 'string') {
        try { content = JSON.parse(content) } catch { content = {} }
      }
      return { ...s, content }
    })

    const bodySections = sections.filter((s: any) => s.type !== 'portada')
    const firstText = bodySections.length > 0
      ? extractText(bodySections[0].content, 500)
      : `Número ${issue.number}`

    const categories = bodySections.map((s: any) =>
      `      <category>${escapeXml(typeLabels[s.type] || s.type)}</category>`
    ).join('\n')

    const imageUrl = getIssueImage(issue)
    const enclosure = imageUrl
      ? `\n      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />`
      : ''
    const mediaContent = imageUrl
      ? `\n      <media:content url="${escapeXml(imageUrl)}" medium="image" />`
      : ''

    return `    <item>
      <title>${escapeXml(issue.title)}</title>
      <link>${getSiteUrl()}${issuePath(issue.number)}</link>
      <guid isPermaLink="true">${getSiteUrl()}${issuePath(issue.number)}</guid>
      <pubDate>${new Date(issue.date).toUTCString()}</pubDate>
      <description><![CDATA[${escapeXml(firstText)}…]]></description>${enclosure}${mediaContent}
${categories}
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Xerrac! — Revista d'aclariment cultural</title>
    <link>${getSiteUrl()}</link>
    <description>Revista d'aclariment cultural</description>
    <language>ca</language>
    <copyright>${escapeXml(copyright)}</copyright>
    <atom:link href="${getSiteUrl()}/api/feed" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
