import Link from 'next/link'
import { getIssues } from '@/lib/actions'
import { DeleteIssueButton } from '@/components/admin/DeleteIssueButton'

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

      <div className="border border-gray-800">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-gray-800
          text-xs uppercase tracking-wider text-gray-500">
          <span>Núm.</span>
          <span>Títol</span>
          <span>Data</span>
          <span>Estat</span>
          <span>Accions</span>
        </div>
        {issues.map((issue) => (
          <div key={issue.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-gray-800
              items-center hover:bg-gray-900 transition-colors"
          >
            <span className="text-white font-mono">{issue.number}</span>
            <Link href={`/admin/numeros/${issue.id}`} className="text-white hover:text-red-400 transition-colors">
              {issue.title}
            </Link>
            <span className="text-sm text-gray-500">
              {new Date(issue.date).toLocaleDateString('ca-ES')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              issue.published
                ? 'bg-green-900/50 text-green-400'
                : 'bg-gray-800 text-gray-500'
            }`}>
              {issue.published ? 'Publicat' : 'Esborrany'}
            </span>
            <div className="flex gap-2">
              <Link
                href={`/admin/numeros/${issue.id}`}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Editar
              </Link>
              <DeleteIssueButton id={issue.id} />
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            No hi ha números. Crea&apos;n un de nou.
          </div>
        )}
      </div>
    </div>
  )
}
