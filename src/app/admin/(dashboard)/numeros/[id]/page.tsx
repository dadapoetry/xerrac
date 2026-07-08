import { getIssue } from '@/lib/actions'
import { IssueForm } from '@/components/admin/IssueForm'
import { SectionList } from '@/components/admin/SectionList'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditNumeroPage({ params }: { params: { id: string } }) {
  const issue = await getIssue(params.id)

  if (!issue) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">Número no trobat</h1>
        <Link href="/admin/numeros" className="text-red-400 hover:text-red-300">
          ← Tornar als números
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/admin/numeros"
        className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block uppercase tracking-wider"
      >
        ← Tots els números
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">{issue.title}</h1>
      <p className="text-gray-500 text-sm mb-8">
        Número {issue.number} · {new Date(issue.date).toLocaleDateString('ca-ES', {
          year: 'numeric', month: 'long'
        })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Detalls del número</h2>
          <div className="p-6 border border-gray-800">
            <IssueForm
              initial={{
                id: issue.id,
                number: issue.number,
                title: issue.title,
                date: issue.date.toISOString().split('T')[0],
                published: issue.published,
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Seccions</h2>
          <SectionList issueId={issue.id} sections={issue.sections as any} />
        </div>
      </div>
    </div>
  )
}
