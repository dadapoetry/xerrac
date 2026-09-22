import { getIssue } from '@/lib/actions'
import { db } from '@/lib/db'
import { SectionForm } from '@/components/admin/SectionForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NovaSeccioPage({ params }: { params: { issueId: string } }) {
  const issue = await getIssue(params.issueId)

  if (!issue) {
    return <div className="text-center py-16 text-gray-500">Número no trobat</div>
  }

  const nextOrderResult = await db.execute({
    sql: 'SELECT COALESCE(MAX("order"), 0) + 1 AS next FROM Section WHERE issueId = ?',
    args: [issue.id],
  })
  const nextOrder = Number(nextOrderResult.rows[0]?.next) || 0

  return (
    <div>
      <Link
        href={`/admin/numeros/${issue.id}`}
        className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block uppercase tracking-wider"
      >
        ← {issue.title}
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Nova secció</h1>
      <p className="text-gray-500 text-sm mb-8">Afegeix una secció al número {issue.number}</p>

      <SectionForm
        issueId={issue.id}
        nextOrder={nextOrder}
      />
    </div>
  )
}
