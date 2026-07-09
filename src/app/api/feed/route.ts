import { getPublishedIssues } from '@/lib/actions'
import { getAllSettings } from '@/lib/settings'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export async function GET() {
  const issues = await getPublishedIssues()
  const settings = await getAllSettings()
  const copyright = settings.footer_copyright || 'Xerrac!'

  const items = issues.flatMap((issue) => {
    const sections = (issue.sections as any[]).map((s: any) => ({
      ...s,
      content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
    }))

    return sections.map((section: any) => {
      const body = section.content?.body || ''
      const bodyText = stripHtml(body).slice(0, 300)
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
      }

      return `    <item>
      <title>${issue.title} — ${typeLabels[section.type] || section.type}</title>
      <link>${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/#s-${section.type}</link>
      <guid>${issue.id}-${section.id}</guid>
      <pubDate>${new Date(issue.date).toUTCString()}</pubDate>
      <description><![CDATA[${bodyText}…]]></description>
    </item>`
    })
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Xerrac! — Revista d'aclariment cultural</title>
    <link>${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}</link>
    <description>Revista d'aclariment cultural</description>
    <language>ca</language>
    <copyright>${copyright}</copyright>
    <atom:link href="${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/api/feed" rel="self" type="application/rss+xml"/>
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
