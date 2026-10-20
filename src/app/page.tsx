import type { Metadata } from 'next'
import Link from 'next/link'
import { getLatestIssue, getIssue } from '@/lib/data'
import { getSiteUrl } from '@/lib/site'
import { permanentRedirect, notFound } from 'next/navigation'
import { IssueView } from '@/components/IssueView'
import { SubscribeForm } from '@/components/SubscribeForm'
import { Logo } from '@/components/Logo'
import { issuePath, articlePath, buildSectionSlugMap } from '@/lib/slugs'

function getPreviewStatus(preview?: string): boolean {
  const token = process.env.PREVIEW_TOKEN
  return token ? preview === token : false
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ issue?: string; section?: string; preview?: string }>
}): Promise<Metadata> {
  const sp = await searchParams
  const isPreview = getPreviewStatus(sp.preview)
  const issueId = sp.issue
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
// no ha de semblar trencat. Recull correus i dona accés a «La revista» i a la
// privacitat, prou. Sense peu ni enllaç a l'arxiu: encara no hi ha res a arxivar.
function EmptyHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <Logo className="mb-8" />

          <p className="text-gray-300 text-sm leading-relaxed mb-10">
            Encara no t&rsquo;hi has subscrit? Aclareix-te! Sigues el primer en llegir el primer
            número de Xerrac.
          </p>

          <SubscribeForm />

          <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-2xs uppercase tracking-wider">
            <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
              La revista
            </Link>
            <Link href="/privacitat" className="text-gray-400 hover:text-white transition-colors">
              Privacitat
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ issue?: string; section?: string; preview?: string }>
}) {
  const sp = await searchParams
  const isPreview = getPreviewStatus(sp.preview)
  const issueId = sp.issue
  const issue = issueId ? await getIssue(issueId) : (isPreview ? null : await getLatestIssue())

  // Un número esborrany només és visible amb el testimoni de previsualització.
  if (issue && !issue.published && !isPreview) notFound()

  if (issue && !isPreview) {
    const slugMap = buildSectionSlugMap((issue.sections as any[]) || [])
    const allSections = [...((issue.sections as any[]) || [])].sort((a, b) => a.order - b.order)
    const secIdx = sp.section !== undefined ? parseInt(sp.section, 10) : NaN
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
