import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedIssueByNumber } from '@/lib/data'
import { getSiteUrl, hreflang } from '@/lib/site'
import { safeParse } from '@/lib/utils'
import { extractExcerpt } from '@/lib/excerpt'
import { buildSectionSlugMap, sectionLabel, issuePath, articlePath } from '@/lib/slugs'
import { SectionRenderer } from '@/components/SectionRenderer'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Logo'

export const revalidate = 300

function hexToRgb(hex: string): string {
  const h = (hex || '#ef4444').replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '239, 68, 68'
  return `${r}, ${g}, ${b}`
}

async function loadArticle(numberParam: string, slug: string) {
  const number = Number(numberParam)
  if (!Number.isInteger(number) || number <= 0) return null
  const issue = await getPublishedIssueByNumber(number)
  if (!issue) return null

  const sections = (issue.sections as any[]).map((s: any) => ({
    ...s,
    content: typeof s.content === 'string' ? safeParse(s.content) : s.content,
  }))
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  const slugMap = buildSectionSlugMap(sorted)
  const index = sorted.findIndex((s) => slugMap.get(s.id) === slug)
  if (index < 0) return null
  return { issue, section: sorted[index], index, sorted, slugMap }
}

export async function generateMetadata({
  params,
}: {
  params: { number: string; section: string }
}): Promise<Metadata> {
  const data = await loadArticle(params.number, params.section)
  if (!data) return { title: { absolute: 'Article no trobat — Xerrac!' } }

  const { issue, section, index } = data
  const siteUrl = getSiteUrl()
  const label = sectionLabel(section.type, section.title)
  const excerpt = extractExcerpt(section.content) || `Article de Xerrac!, número ${issue.number}.`
  const canonical = `${siteUrl}${articlePath(issue.number, params.section)}`

  return {
    title: { absolute: `${label} — Número ${issue.number} — Xerrac!` },
    description: excerpt,
    alternates: { canonical, languages: hreflang() },
    openGraph: {
      title: `${label} — Xerrac!`,
      description: excerpt,
      type: 'article',
      publishedTime: new Date(issue.date).toISOString(),
      modifiedTime: new Date(section.updatedAt || issue.updatedAt || issue.date).toISOString(),
      url: canonical,
      images: [{ url: `${siteUrl}/api/og?issue=${issue.id}&section=${index}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} — Xerrac!`,
      description: excerpt,
      images: [`${siteUrl}/api/og?issue=${issue.id}&section=${index}`],
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { number: string; section: string }
}) {
  const data = await loadArticle(params.number, params.section)
  if (!data) notFound()

  const { issue, section, index, sorted, slugMap } = data
  const siteUrl = getSiteUrl()
  const label = sectionLabel(section.type, section.title)
  const canonical = `${siteUrl}${articlePath(issue.number, params.section)}`
  const accent = issue.accentColor || '#ef4444'

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: label,
    description: extractExcerpt(section.content) || undefined,
    articleSection: label,
    inLanguage: 'ca',
    datePublished: new Date(issue.date).toISOString(),
    dateModified: new Date(section.updatedAt || issue.updatedAt || issue.date).toISOString(),
    url: canonical,
    mainEntityOfPage: canonical,
    image: `${siteUrl}/api/og?issue=${issue.id}&section=${index}`,
    author: { '@type': 'Organization', name: 'Xerrac!' },
    publisher: {
      '@type': 'Organization',
      name: 'Xerrac!',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png`, width: 512, height: 512 },
    },
    isPartOf: {
      '@type': 'PublicationIssue',
      issueNumber: issue.number,
      name: issue.title,
      url: `${siteUrl}${issuePath(issue.number)}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Xerrac!', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: `Número ${issue.number}`, item: `${siteUrl}${issuePath(issue.number)}` },
      { '@type': 'ListItem', position: 3, name: label, item: canonical },
    ],
  }

  return (
    <div style={{ '--accent': accent, '--accent-rgb': hexToRgb(accent) } as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 no-print">
        <div className="flex items-center gap-3 px-3 min-h-[2.5rem]">
          <Link href="/" aria-label="Inici">
            <Logo compact />
          </Link>
          <span className="text-gray-700 hidden sm:inline">·</span>
          <Link
            href={issuePath(issue.number)}
            className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-white transition-colors truncate"
          >
            Número {String(issue.number).padStart(2, '0')} — {issue.title}
          </Link>
        </div>
      </div>

      <main className="animate-fade-in">
        <h1 className="sr-only">{label} — Xerrac!, número {issue.number}</h1>
        <SectionRenderer section={section as any} index={index} />
      </main>

      <Footer currentIssueNumber={issue.number} />
    </div>
  )
}
