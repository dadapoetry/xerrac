import type { Metadata } from 'next'
import { getLatestIssue, getIssue } from '@/lib/data'
import { getSiteUrl, hreflang } from '@/lib/site'
import { permanentRedirect } from 'next/navigation'
import { IssueView } from '@/components/IssueView'
import { issuePath, articlePath, buildSectionSlugMap } from '@/lib/slugs'

function getPreviewStatus(preview?: string): boolean {
  const token = process.env.PREVIEW_TOKEN
  return token ? preview === token : false
}

export async function generateMetadata({ searchParams }: { searchParams: { issue?: string; section?: string; preview?: string } }): Promise<Metadata> {
  const isPreview = getPreviewStatus(searchParams.preview)
  const issueId = searchParams.issue
  const issue = issueId ? await getIssue(issueId) : (isPreview ? null : await getLatestIssue())
  const siteUrl = getSiteUrl()

  if (!issue || (!issue.published && !isPreview)) {
    return {
      title: { absolute: "Xerrac! — Revista d'aclariment cultural" },
      description: "Revista d'aclariment cultural",
    }
  }

  const sectionNames = (issue.sections as any[])
    .filter((s: any) => s.type !== 'portada')
    .map((s: any) => s.title || s.type)

  const canonical = issueId ? `${siteUrl}${issuePath(issue.number)}` : `${siteUrl}/`

  return {
    title: { absolute: `Número ${issue.number}: ${issue.title} — Xerrac!` },
    description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}. ${sectionNames.join(', ')}.`,
    alternates: { canonical, languages: hreflang() },
    robots: isPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${issue.title} — Xerrac!`,
      description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}.`,
      type: 'article',
      publishedTime: new Date(issue.date).toISOString(),
      modifiedTime: new Date(issue.updatedAt || issue.date).toISOString(),
      url: `${siteUrl}${issuePath(issue.number)}`,
      images: [{ url: `${siteUrl}/api/og?issue=${issue.id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${issue.title} — Xerrac!`,
      description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural.`,
      images: [`${siteUrl}/api/og?issue=${issue.id}`],
    },
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { issue?: string; section?: string; preview?: string }
}) {
  const isPreview = getPreviewStatus(searchParams.preview)
  const issueId = searchParams.issue
  const issue = issueId ? await getIssue(issueId) : (isPreview ? null : await getLatestIssue())

  if (issue && issue.published && !isPreview) {
    const slugMap = buildSectionSlugMap((issue.sections as any[]) || [])
    const allSections = [...((issue.sections as any[]) || [])].sort((a, b) => a.order - b.order)
    const secIdx = searchParams.section !== undefined ? parseInt(searchParams.section, 10) : NaN
    if (!isNaN(secIdx) && secIdx > 0 && secIdx < allSections.length) {
      const slug = slugMap.get(allSections[secIdx].id)
      if (slug) permanentRedirect(articlePath(issue.number, slug))
    }
    permanentRedirect(issuePath(issue.number))
  }

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

  return <IssueView issue={issue} />
}
