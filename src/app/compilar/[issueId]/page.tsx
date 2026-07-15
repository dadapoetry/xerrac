import { getIssue } from '@/lib/actions'
import { TabloidPreview } from '@/components/TabloidPreview'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CompilarPage({
  params,
}: {
  params: { issueId: string }
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

  return <TabloidPreview issue={parsedIssue as any} />
}
