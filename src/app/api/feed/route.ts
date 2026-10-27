import { getPublishedIssues } from '@/lib/data'
import { getAllSettings } from '@/lib/settings'
import { escapeXml } from '@/lib/utils'
import { getSiteUrl } from '@/lib/site'
import { buildSectionSlugMap, articlePath } from '@/lib/slugs'

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
  necrologiques: 'Necrològiques',
}

export const revalidate = 0

export async function GET() {
  const issues = await getPublishedIssues()
  const settings = await getAllSettings()
  const copyright = settings.footer_copyright || 'Xerrac!'

  const items: string[] = []

  for (const issue of issues) {
    const sections = (issue.sections as any[]).map((s: any) => {
      let content = s.content
      if (typeof content === 'string') {
        try { content = JSON.parse(content) } catch { content = {} }
      }
      return { ...s, content }
    })

    const slugMap = buildSectionSlugMap(sections)

    // Imatge de portada del número (fallback)
    const portada = sections.find((s: any) => s.type === 'portada')
    let issueImage: string | null = null
    if (portada) {
      if (portada.backgroundImage && portada.backgroundImage.trim()) {
        issueImage = portada.backgroundImage
      } else if (portada.backgroundImageMobile && portada.backgroundImageMobile.trim()) {
        issueImage = portada.backgroundImageMobile
      } else if (portada.content?.image && typeof portada.content.image === 'string') {
        issueImage = portada.content.image
      } else if (portada.content?.cover && typeof portada.content.cover === 'string') {
        issueImage = portada.content.cover
      }
    }

    for (const section of sections) {
      if (section.type === 'portada') continue

      const slug = slugMap.get(section.id)
      if (!slug) continue

      const url = `${getSiteUrl()}${articlePath(issue.number, slug)}`

      // Imatge: la de la secció si en té, si no la de la portada
      let imageUrl: string | null = null
      if (section.backgroundImage && section.backgroundImage.trim()) {
        imageUrl = section.backgroundImage
      } else if (section.backgroundImageMobile && section.backgroundImageMobile.trim()) {
        imageUrl = section.backgroundImageMobile
      } else {
        imageUrl = issueImage
      }

      const enclosure = imageUrl
        ? `\n      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />`
        : ''
      const mediaContent = imageUrl
        ? `\n      <media:content url="${escapeXml(imageUrl)}" medium="image" />`
        : ''

      const sectionTitle = section.title && section.title.trim()
        ? section.title
        : (typeLabels[section.type] || section.type)

      const text = extractText(section.content, 500)

      items.push(`    <item>
      <title>${escapeXml(sectionTitle)} — Núm. ${issue.number}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(issue.date).toUTCString()}</pubDate>
      <description><![CDATA[${escapeXml(text)}…]]></description>${enclosure}${mediaContent}
      <category>${escapeXml(typeLabels[section.type] || section.type)}</category>
    </item>`)
    }
  }

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
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
