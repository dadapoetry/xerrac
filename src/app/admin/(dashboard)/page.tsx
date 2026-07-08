import Link from 'next/link'
import { getIssues } from '@/lib/actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const issues = await getIssues()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona els números de Xerrac!</p>
        </div>
        <Link
          href="/admin/numeros/nou"
          className="px-4 py-2 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors"
        >
          + Nou número
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 border border-gray-800 radical-border">
          <p className="text-3xl font-bold text-white">{issues.length}</p>
          <p className="text-sm text-gray-500 mt-1">Números totals</p>
        </div>
        <div className="p-6 border border-gray-800 radical-border">
          <p className="text-3xl font-bold text-white">
            {issues.filter(i => i.published).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Publicats</p>
        </div>
        <div className="p-6 border border-gray-800 radical-border">
          <p className="text-3xl font-bold text-white">
            {issues.reduce((acc, i) => acc + i.sections.length, 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Seccions totals</p>
        </div>
      </div>

      <div className="border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm uppercase tracking-wider text-gray-400">Últims números</h2>
        </div>
        {issues.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hi ha números. Crea&apos;n un de nou.
          </div>
        ) : (
          <div>
            {issues.slice(0, 10).map((issue) => (
              <Link
                key={issue.id}
                href={`/admin/numeros/${issue.id}`}
                className="flex items-center justify-between p-4 border-b border-gray-800
                  hover:bg-gray-900 transition-colors"
              >
                <div>
                  <span className="text-xs text-gray-600 uppercase tracking-wider">
                    Núm. {issue.number}
                  </span>
                  <h3 className="text-white font-medium">{issue.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    issue.published
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {issue.published ? 'Publicat' : 'Esborrany'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(issue.date).toLocaleDateString('ca-ES')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
