import Link from 'next/link'
import { getIssues } from '@/lib/data'
import { getIssueProgress } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const issues = await getIssues()
  const latestIssue = issues.find((i: any) => !i.published) || issues[0]
  const progress = latestIssue ? await getIssueProgress(latestIssue.id) : null

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

      {progress && (
        <Link
          href="/admin/calendari"
          className="block mb-8 p-6 border border-gray-800 hover:border-red-900/40 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1 group-hover:text-red-400 transition-colors">
                Número en curs
              </p>
              <p className="text-lg font-bold text-white">
                Núm. {String(progress.issue.number).padStart(2, '0')} · {progress.issue.title}
              </p>
            </div>
            <span className="text-2xl font-black text-white tabular-nums">
              {progress.ready}/{progress.total}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${progress.progress === 100 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {progress.progress}% completat
            {progress.issue.targetDate && (
              <> · Objectiu: {new Date(progress.issue.targetDate).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</>
            )}
          </p>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            {issues.reduce((acc, i) => acc + (i.sectionCount || 0), 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Seccions totals</p>
        </div>
        <Link
          href="/admin/config"
          className="p-6 border border-gray-800 radical-border hover:border-red-900/40 transition-colors group"
        >
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-1 group-hover:text-red-400 transition-colors">
            Configuració
          </p>
          <p className="text-sm text-gray-400">
            Footer, ISSN, xarxes
          </p>
        </Link>
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
