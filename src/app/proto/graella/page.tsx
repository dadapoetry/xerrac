import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getIssue, getLatestIssue } from '@/lib/data'
import { safeParse } from '@/lib/utils'
import { styleBlockquotes, readingTime } from '@/lib/html'
import { SECTION_LABELS } from '@/types'
import { GraellaPrototype } from '@/components/proto/GraellaPrototype'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Prototip — graella de revista' },
  robots: { index: false, follow: false },
}

const DEFAULT_ISSUE_ID = 'd9231231-ec05-4edb-a6bf-123248624131'

function firstSentences(text: string, max = 165): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
  return (lastStop > 40 ? cut.slice(0, lastStop + 1) : cut).trim() + '…'
}

export default async function GraellaPage({
  searchParams,
}: {
  searchParams?: { issue?: string }
}) {
  const issueId = searchParams?.issue || DEFAULT_ISSUE_ID
  const issue = (await getIssue(issueId)) || (await getLatestIssue())

  if (!issue) notFound()

  const sections = ((issue.sections as any[]) || []).map((s: any) => ({
    ...s,
    content: typeof s.content === 'string' ? safeParse(s.content) : s.content,
  }))

  const target =
    sections.find((s: any) => s.type === 'editorial') ||
    sections.find((s: any) => s.type !== 'portada')

  if (!target) notFound()

  const body = (target.content as any)?.body || ''
  const plain = body.replace(/<[^>]*>/g, ' ')
  const portada = sections.find((s: any) => s.type === 'portada')

  return (
    <GraellaPrototype
      number={Number(issue.number) || 1}
      label={SECTION_LABELS[target.type] || target.type}
      title={target.title}
      subtitle={(target.content as any)?.subtitle || undefined}
      bodyHtml={styleBlockquotes(body, 'line')}
      excerpt={firstSentences(plain)}
      readingMinutes={readingTime(body)}
      image={target.backgroundImage || portada?.backgroundImage || ''}
    />
  )
}
