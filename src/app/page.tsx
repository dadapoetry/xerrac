import { getLatestIssue, getIssue } from '@/lib/actions'

export const dynamic = 'force-dynamic'
import { FanzineViewer } from '@/components/FanzineViewer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/Footer'
import { Afterthought } from '@/components/Afterthought'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { issue?: string }
}) {
  const issueId = searchParams.issue
  const issue = issueId ? await getIssue(issueId) : await getLatestIssue()

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
      content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
    })),
  }

  return (
    <>
      <ErrorBoundary>
        <FanzineViewer issue={parsedIssue as any} />
      </ErrorBoundary>
      <Afterthought />
      <Footer currentIssueNumber={issue.number} />
    </>
  )
}
