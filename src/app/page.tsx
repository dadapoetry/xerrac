import type { Metadata } from 'next'
import Link from 'next/link'
import { getLatestIssue, getIssue } from '@/lib/data'
import { getSiteUrl } from '@/lib/site'
import { permanentRedirect, notFound } from 'next/navigation'
import { IssueView } from '@/components/IssueView'
import { SubscribeForm } from '@/components/SubscribeForm'
import { PrivacyNote } from '@/components/PrivacyNote'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Logo'
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
      alternates: { canonical: `${siteUrl}/` },
    }
  }

  const sectionNames = (issue.sections as any[])
    .filter((s: any) => s.type !== 'portada')
    .map((s: any) => s.title || s.type)

  const canonical = issueId ? `${siteUrl}${issuePath(issue.number)}` : `${siteUrl}/`

  return {
    title: { absolute: `Número ${issue.number}: ${issue.title} — Xerrac!` },
    description: `Número ${issue.number} de Xerrac!, revista d'aclariment cultural. ${issue.title}. ${sectionNames.join(', ')}.`,
    alternates: { canonical },
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

// Portada abans del primer número: la revista encara no ha sortit, però el lloc
// no ha de semblar trencat. Explica què és Xerrac!, recull correus i dona accés
// a la resta de pàgines.
function EmptyHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <Logo className="mb-8" />

          <p className="text-gray-300 text-[15px] leading-relaxed mb-10">
            Encara no hi ha cap número publicat. El primer número arriba aviat; si vols, deixa el
            correu i t&rsquo;avisarem.
          </p>

          <SubscribeForm />
          <PrivacyNote className="mt-4" />

          <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-wider">
            <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
              La revista
            </Link>
            <Link href="/arxiu" className="text-gray-400 hover:text-white transition-colors">
              Arxiu
            </Link>
            <Link href="/privacitat" className="text-gray-400 hover:text-white transition-colors">
              Privacitat
            </Link>
          </nav>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { issue?: string; section?: string; preview?: string }
}) {
  const isPreview = getPreviewStatus(searchParams.preview)
  const issueId = searchParams.issue
  const issue = issueId ? await getIssue(issueId) : (isPreview ? null : await getLatestIssue())

  // Un número esborrany només és visible amb el testimoni de previsualització.
  if (issue && !issue.published && !isPreview) notFound()

  if (issue && !isPreview) {
    const slugMap = buildSectionSlugMap((issue.sections as any[]) || [])
    const allSections = [...((issue.sections as any[]) || [])].sort((a, b) => a.order - b.order)
    const secIdx = searchParams.section !== undefined ? parseInt(searchParams.section, 10) : NaN
    if (!isNaN(secIdx) && secIdx > 0 && secIdx < allSections.length) {
      const slug = slugMap.get(allSections[secIdx].id)
      if (slug) permanentRedirect(articlePath(issue.number, slug))
    }
    permanentRedirect(issuePath(issue.number))
  }

  // Només s'arriba aquí amb una previsualització vàlida.
  if (issue) return <IssueView issue={issue} />

  return <EmptyHome />
}
