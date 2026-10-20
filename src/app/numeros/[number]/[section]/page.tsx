import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedIssueByNumber } from '@/lib/data'
import { getSiteUrl } from '@/lib/site'
import { safeParse } from '@/lib/utils'
import { extractExcerpt } from '@/lib/excerpt'
import { buildSectionSlugMap, sectionLabel, issuePath, articlePath } from '@/lib/slugs'
import { IssueView } from '@/components/IssueView'

export const revalidate = 300

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
  params: Promise<{ number: string; section: string }>
}): Promise<Metadata> {
  const { number, section: sectionParam } = await params
  const data = await loadArticle(number, sectionParam)
  if (!data) return { title: { absolute: 'Article no trobat — Xerrac!' } }

  const { issue, section, index } = data
  const siteUrl = getSiteUrl()
  const label = sectionLabel(section.type, section.title)
  const excerpt = extractExcerpt(section.content) || `Article de Xerrac!, número ${issue.number}.`
  const canonical = `${siteUrl}${articlePath(issue.number, sectionParam)}`

  return {
    title: { absolute: `${label} — Número ${issue.number} — Xerrac!` },
    description: excerpt,
    alternates: { canonical },
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
  params: Promise<{ number: string; section: string }>
}) {
  const { number, section: sectionParam } = await params
  const data = await loadArticle(number, sectionParam)
  if (!data) notFound()

  const { issue, section, index } = data
  const siteUrl = getSiteUrl()
  const label = sectionLabel(section.type, section.title)
  const canonical = `${siteUrl}${articlePath(issue.number, sectionParam)}`

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* La ruta de secció és un enllaç profund al número sencer: el
          FanzineViewer se situa a la secció i la URL de lectura passa a ser la
          de la secció. Així, compartir (des de l'app o des del navegador)
          porta sempre al mateix lloc. */}
      <IssueView issue={issue} initialSectionIndex={index} jsonLd={false} />
    </>
  )
}
