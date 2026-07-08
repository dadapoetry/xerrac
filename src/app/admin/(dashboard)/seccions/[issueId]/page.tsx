import { notFound } from 'next/navigation'
import { getIssue } from '@/lib/actions'
import { SectionForm } from '@/components/admin/SectionForm'
import Link from 'next/link'
import { SectionList } from '@/components/admin/SectionList'

export const dynamic = 'force-dynamic'

export default async function SeccionsPage({ params }: { params: { issueId: string } }) {
  const issue = await getIssue(params.issueId)

  if (!issue) notFound()

  return (
    <div>
      <Link
        href={`/admin/numeros/${issue.id}`}
        className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block uppercase tracking-wider"
      >
        ← {issue.title}
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Seccions</h1>

      <SectionList issueId={issue.id} sections={issue.sections as any} />
    </div>
  )
}
