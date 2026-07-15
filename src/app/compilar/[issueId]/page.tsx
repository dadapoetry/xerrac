import { getIssue } from '@/lib/actions'
import { getSetting } from '@/lib/settings'
import { TabloidPreview } from '@/components/TabloidPreview'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CompilarPage({
  params,
  searchParams,
}: {
  params: { issueId: string }
  searchParams?: { print?: string }
}) {
  const issue = await getIssue(params.issueId)

  if (!issue) {
    notFound()
  }

  const parsedIssue = {
    ...issue,
    sections: (issue.sections as any[]).map((s: any) => ({
      ...s,
      content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
    })),
  }

  const issn = await getSetting('footer_issn')

  return <TabloidPreview issue={parsedIssue as any} issn={issn} autoPrint={searchParams?.print === '1'} />
}
