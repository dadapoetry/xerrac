import Link from 'next/link'
import { getPublishedIssues } from '@/lib/actions'
import { RedRule } from '@/components/RedRule'

export const dynamic = 'force-dynamic'

export default async function ArxiuPage() {
  const issues = await getPublishedIssues()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs text-gray-600 hover:text-white transition-colors mb-10 inline-block uppercase tracking-[0.25em] font-mono"
        >
          ← Tornar
        </Link>

        <span className="text-[10px] text-gray-600 tracking-[0.3em] uppercase font-mono block mb-4">
          Arxiu
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3">
          Xerrac<span className="text-red-500">!</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Tots els números publicats
        </p>
        <RedRule className="mb-12" />

        {issues.length === 0 ? (
          <p className="text-gray-700 italic text-sm">No hi ha números publicats.</p>
        ) : (
          <div className="space-y-2">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/?issue=${issue.id}`}
                className="group flex items-center justify-between p-4 border border-gray-900 hover:border-red-900/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-700 font-mono w-8 shrink-0">
                    {String(issue.number).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                      {issue.title}
                    </h2>
                    <span className="text-xs text-gray-700 mt-1 block">
                      {issue.sections.length} seccions
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-700 shrink-0 font-mono">
                  {new Date(issue.date).toLocaleDateString('ca-ES', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
