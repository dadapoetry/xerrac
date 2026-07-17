import type { Metadata } from 'next'
import { getLatestIssue, getIssue } from '@/lib/actions'
import { safeParse } from '@/lib/utils'
import { getSiteUrl } from '@/lib/site'

import { FanzineViewer } from '@/components/FanzineViewer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/Footer'
import { Afterthought } from '@/components/Afterthought'

function getPreviewStatus(preview?: string): boolean {
  const token = process.env.PREVIEW_TOKEN
  return token ? preview === token : false
}

export async function generateMetadata({ searchParams }: { searchParams: { issue?: string; preview?: string } }): Promise<Metadata> {
  const isPreview = getPreviewStatus(searchParams.preview)
  const issueId = searchParams.issue
  const issue = issueId ? await getIssue(issueId) : (isPreview ? null : await getLatestIssue())
  const siteUrl = getSiteUrl()

  if (!issue || (!issue.published && !isPreview)) {
    return {
      title: 'Xerrac! — Revista d\'aclariment cultural',
      description: 'Revista d\'aclariment cultural',
    }
  }

  const sectionNames = (issue.sections as any[])
    .filter((s: any) => s.type !== 'portada')
    .map((s: any) => s.type)

  const issueUrl = `${siteUrl}/?issue=${issue.id}`

  return {
    title: `${issue.title} — Xerrac!`,
    description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}. ${sectionNames.join(', ')}.`,
    alternates: { canonical: issueUrl },
    robots: isPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${issue.title} — Xerrac!`,
      description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}.`,
      type: 'article',
      publishedTime: new Date(issue.date).toISOString(),
      modifiedTime: new Date(issue.date).toISOString(),
      section: 'Revista',
      url: issueUrl,
      images: [{ url: `${siteUrl}/api/og?issue=${issue.id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${issue.title} — Xerrac!`,
      description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}.`,
      images: [`${siteUrl}/api/og?issue=${issue.id}`],
    },
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { issue?: string; preview?: string }
}) {
  const isPreview = getPreviewStatus(searchParams.preview)
  const issueId = searchParams.issue
  const issue = issueId ? await getIssue(issueId) : (isPreview ? null : await getLatestIssue())

  if (issue && !issue.published && !isPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">XERRAC!</h1>
          <p className="text-gray-500">Aquest número encara no està publicat.</p>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">XERRAC!</h1>
          <p className="text-gray-500">Revista d&apos;aclariment cultural</p>
          <p className="text-gray-700 mt-8">Encara no hi ha números publicats.</p>
        </div>
      </div>
    )
  }

  const parsedIssue = {
    ...issue,
    sections: (issue.sections as any[]).map((s: any) => ({
      ...s,
      content: typeof s.content === 'string' ? safeParse(s.content) : s.content,
    })),
  }

  const siteUrl = getSiteUrl()
  const issueUrl = `${siteUrl}/?issue=${issue.id}`

  const sectionLabels: Record<string, string> = {
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

  function extractExcerpt(content: any): string {
    if (!content || typeof content !== 'object') return ''
    if (content.topic) return content.topic
    if (content.source) return `Entrevista a ${content.source}`
    if (content.body) return content.body.replace(/<[^>]+>/g, '').slice(0, 200)
    if (content.proverbs) return content.proverbs.map((e: any) => e.text).filter(Boolean).join(' · ').slice(0, 200)
    if (content.interviews) return content.interviews.map((e: any) => e.subject).filter(Boolean).join(', ').slice(0, 200)
    if (content.reviews) return content.reviews.map((e: any) => e.title).filter(Boolean).join(', ').slice(0, 200)
    if (content.investigacio) return content.investigacio.map((e: any) => e.title).filter(Boolean).join(', ').slice(0, 200)
    if (content.collages) return content.collages.map((e: any) => e.description).filter(Boolean).join(' ').slice(0, 200)
    return ''
  }

  const contentSections = parsedIssue.sections.filter((s: any) => s.type !== 'portada')
  const hasPart = contentSections.map((s: any) => ({
    '@type': 'ArticleSection' as const,
    name: s.title || sectionLabels[s.type] || s.type,
    about: extractExcerpt(s.content),
  }))

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: issue.title,
    description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural`,
    datePublished: new Date(issue.date).toISOString(),
    dateModified: new Date(issue.date).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Xerrac!',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Xerrac!',
      logo: `${siteUrl}/favicon.svg`,
    },
    image: `${siteUrl}/api/og?issue=${issue.id}`,
    url: issueUrl,
    mainEntityOfPage: issueUrl,
    about: {
      '@type': 'Thing',
      name: `Número ${issue.number}: ${issue.title}`,
    },
    isPartOf: {
      '@type': 'PublicationIssue',
      issueNumber: issue.number,
      datePublished: new Date(issue.date).toISOString(),
      publisher: {
        '@type': 'Organization',
        name: 'Xerrac!',
      },
    },
    hasPart,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Xerrac!', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: issue.title, item: issueUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ErrorBoundary>
        <FanzineViewer issue={parsedIssue as any} />
      </ErrorBoundary>
      <Afterthought />
      <Footer currentIssueNumber={issue.number} />
    </>
  )
}
