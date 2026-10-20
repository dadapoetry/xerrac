import { FanzineViewer } from '@/components/FanzineViewer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/Footer'
import { Afterthought } from '@/components/Afterthought'
import { getSetting } from '@/lib/settings'
import { getSiteUrl, ogImageUrl } from '@/lib/site'
import { safeParse } from '@/lib/utils'
import { issuePath, articlePath, buildSectionSlugMap, sectionLabel } from '@/lib/slugs'

function parseIssueContent(issue: any) {
  return {
    ...issue,
    sections: (issue.sections as any[]).map((s: any) => ({
      ...s,
      content: typeof s.content === 'string' ? safeParse(s.content) : s.content,
    })),
  }
}

interface IssueViewProps {
  issue: any
  initialSectionIndex?: number
  /** Quan és false, qui el renderitza aporta el seu propi JSON-LD (p. ex. Article). */
  jsonLd?: boolean
}

export async function IssueView({ issue, initialSectionIndex, jsonLd = true }: IssueViewProps) {
  const siteUrl = getSiteUrl()
  const issn = (await getSetting('footer_issn').catch(() => '')) || ''
  const parsedIssue = parseIssueContent(issue)

  const issueUrl = `${siteUrl}${issuePath(issue.number)}`
  const contentSections = parsedIssue.sections.filter((s: any) => s.type !== 'portada')
  const slugMap = buildSectionSlugMap(parsedIssue.sections)

  const periodical = {
    '@type': 'Periodical',
    name: 'Xerrac!',
    url: siteUrl,
    inLanguage: 'ca',
    publisher: {
      '@type': 'Organization',
      name: 'Xerrac!',
      url: siteUrl,
    },
    ...(issn ? { issn } : {}),
  }

  const publicationIssue = {
    '@context': 'https://schema.org',
    '@type': 'PublicationIssue',
    issueNumber: issue.number,
    name: issue.title,
    datePublished: new Date(issue.date).toISOString(),
    dateModified: new Date(issue.updatedAt || issue.date).toISOString(),
    url: issueUrl,
    inLanguage: 'ca',
    image: ogImageUrl({ issue: issue.id }),
    isPartOf: periodical,
    hasPart: contentSections.map((s: any) => ({
      '@type': 'Article',
      headline: sectionLabel(s.type, s.title),
      url: `${siteUrl}${articlePath(issue.number, slugMap.get(s.id) || s.type)}`,
    })),
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
      {jsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(publicationIssue) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        </>
      )}
      <ErrorBoundary>
        <FanzineViewer issue={parsedIssue as any} initialSectionIndex={initialSectionIndex} />
      </ErrorBoundary>
      <Afterthought />
      <Footer currentIssueNumber={issue.number} />
    </>
  )
}
