import { getIssue } from '@/lib/actions'
import { SectionForm } from '@/components/admin/SectionForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditSeccioPage({
  params,
}: {
  params: { issueId: string; sectionId: string }
}) {
  const issue = await getIssue(params.issueId)

  if (!issue) notFound()

  const section = issue.sections.find((s) => s.id === params.sectionId)
  if (!section) notFound()

  const parsedSection = {
    ...section,
    content: JSON.parse(section.content),
  }

  return (
    <div>
      <Link
        href={`/admin/numeros/${issue.id}`}
        className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block uppercase tracking-wider"
      >
        ← {issue.title}
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Editar secció</h1>
      <p className="text-gray-500 text-sm mb-8">
        {issue.title} · {section.type}
      </p>

      <SectionForm
        issueId={issue.id}
        initial={parsedSection as any}
        nextOrder={issue.sections.length}
      />
    </div>
  )
}
