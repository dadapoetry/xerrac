import Link from 'next/link'
import { getIssues } from '@/lib/actions'
import { DeleteIssueButton } from '@/components/admin/DeleteIssueButton'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { IssueSearch } from './IssueSearch'

export const dynamic = 'force-dynamic'

export default async function NumerosPage() {
  const issues = await getIssues()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Números</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tots els números</p>
        </div>
        <Link
          href="/admin/numeros/nou"
          className="px-4 py-2 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors"
        >
          + Nou número
        </Link>
      </div>

      <IssueSearch issues={issues} />
    </div>
  )
}
