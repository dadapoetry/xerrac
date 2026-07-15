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

  return (
    <>
      <style>{`
        @page { size: A3 landscape; margin: 0; }
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .tabloid-page { box-shadow: none !important; margin: 0; width: 297mm !important; min-height: 210mm !important; }
        }
      `}</style>
      <TabloidPreview issue={parsedIssue as any} />
    </>
  )
}
