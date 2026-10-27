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
  // Retrat del número vigent: és el que Flipboard fa servir com a imatge de la
  // publicació quan algú afegeix el feed.
  let channelImage: string | null = null
  let channelImageTitle = ''

  for (const issue of issues) {
    const sortedSections = [...(issue.sections as any[])].sort((a: any, b: any) => a.order - b.order)
    const sections = sortedSections.map((s: any) => {
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

    if (!channelImage && issueImage) {
      channelImage = issueImage
      channelImageTitle = `Xerrac! Núm. ${issue.number} — ${issue.title}`
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      if (section.type === 'portada') continue

      const slug = slugMap.get(section.id)
      if (!slug) continue

      const url = `${getSiteUrl()}${articlePath(issue.number, slug)}`

      // Imatge: la de la secció si en té, i si no la targeta OG que se'n genera.
      const sectionImage = (section.backgroundImage || section.backgroundImageMobile || '').trim()
      const image = sectionImage || `${getSiteUrl()}/api/og?issue=${issue.id}&section=${i}`

      // Els agregadors no llegeixen la imatge del mateix lloc: uns miren
      // `media:thumbnail`, altres `media:content`, altres el primer <img> de la
      // descripció. Els posem tots tres. Fora l'<enclosure>: obliga a declarar
      // una mida que no coneixem i un MIME que no sempre és cert (la ruta OG
      // respon PNG i Cloudinary respon el format que demani l'Accept).
      const mediaImage = `\n      <media:content url="${escapeXml(image)}" medium="image" />\n      <media:thumbnail url="${escapeXml(image)}" />`

      const sectionTitle = section.title && section.title.trim()
        ? section.title
        : (typeLabels[section.type] || section.type)

      const text = extractText(section.content, 500) || typeLabels[section.type] || section.type

      items.push(`    <item>
      <title>${escapeXml(sectionTitle)} — Núm. ${issue.number}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(issue.date).toUTCString()}</pubDate>
      <description><![CDATA[<img src="${escapeXml(image)}" alt="" />${escapeXml(text)}…]]></description>${mediaImage}
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
    <copyright>${escapeXml(copyright)}</copyright>${channelImage ? `
    <image>
      <url>${escapeXml(channelImage)}</url>
      <title>${escapeXml(channelImageTitle)}</title>
      <link>${getSiteUrl()}</link>
    </image>` : ''}
    <atom:link href="${getSiteUrl()}/feed.xml" rel="self" type="application/rss+xml"/>
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
