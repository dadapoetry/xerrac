import Link from 'next/link'
import { getPublishedIssues } from '@/lib/actions'
import { FanzineViewer } from '@/components/FanzineViewer'

export const dynamic = 'force-dynamic'

export default async function ArxiuPage() {
  const issues = await getPublishedIssues()

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-white transition-colors mb-8 inline-block uppercase tracking-wider"
        >
          ← Tornar a la portada
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-2 uppercase tracking-tight">
          Arxiu
        </h1>
        <p className="text-gray-600 mb-12">
          Tots els números de Xerrac! per ordre de publicació.
        </p>

        {issues.length === 0 ? (
          <p className="text-gray-700 italic">No hi ha números publicats.</p>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/?issue=${issue.id}`}
                className="group block p-6 border border-gray-800 hover:border-red-900
                  transition-all duration-300 radical-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-600 uppercase tracking-wider">
                      Número {issue.number}
                    </span>
                    <h2 className="text-xl font-bold text-white group-hover:text-red-400
                      transition-colors mt-1">
                      {issue.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {new Date(issue.date).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    <div className="text-xs text-gray-700 mt-1">
                      {issue.sections.length} seccions
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
