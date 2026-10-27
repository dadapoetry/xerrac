import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedIssueByNumber } from '@/lib/data'
import { getSiteUrl, ogImageUrl } from '@/lib/site'
import { IssueView } from '@/components/IssueView'
import { issuePath } from '@/lib/slugs'

export const revalidate = 300

async function loadIssue(numberParam: string) {
  const number = Number(numberParam)
  if (!Number.isInteger(number) || number <= 0) return null
  return getPublishedIssueByNumber(number)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>
}): Promise<Metadata> {
  const issue = await loadIssue((await params).number)
  if (!issue) return { title: { absolute: 'Número no trobat — Xerrac!' } }

  const siteUrl = getSiteUrl()
  const sectionNames = (issue.sections as any[])
    .filter((s: any) => s.type !== 'portada')
    .map((s: any) => s.title || s.type)

  return {
    title: { absolute: `Número ${issue.number}: ${issue.title} — Xerrac!` },
    description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}. ${sectionNames.join(', ')}.`,
    alternates: {
      canonical: `${siteUrl}${issuePath(issue.number)}`,
      types: { 'application/rss+xml': `${siteUrl}/feed.xml` },
    },
    openGraph: {
      title: `${issue.title} — Xerrac!`,
      description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural.`,
      type: 'article',
      publishedTime: new Date(issue.date).toISOString(),
      modifiedTime: new Date(issue.updatedAt || issue.date).toISOString(),
      url: `${siteUrl}${issuePath(issue.number)}`,
      images: [{ url: ogImageUrl({ issue: issue.id }), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${issue.title} — Xerrac!`,
      description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural.`,
      images: [ogImageUrl({ issue: issue.id })],
    },
  }
}

export default async function IssuePage({ params }: { params: Promise<{ number: string }> }) {
  const issue = await loadIssue((await params).number)
  if (!issue) notFound()

  return <IssueView issue={issue} />
}
