import Link from 'next/link'
import { getPublishedIssues } from '@/lib/data'
import { issuePath } from '@/lib/slugs'

export async function MiniArchive({ currentIssueNumber }: { currentIssueNumber?: number }) {
  let issues: any[] = []
  try {
    issues = await getPublishedIssues()
  } catch {
    return null
  }

  // Només visible quan hi ha més d'un número publicat.
  if (!issues || issues.length <= 1) return null

  const sorted = [...issues].sort((a: any, b: any) => a.number - b.number)

  return (
    <section className="no-print border-t border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <span className="text-2xs tracking-[0.3em] uppercase font-mono tabular-nums font-semibold" style={{ color: 'var(--accent-text)' }}>
            Arxiu
          </span>
          <Link href="/arxiu" className="text-2xs tracking-[0.2em] uppercase font-mono text-gray-400 hover:text-gray-200 transition-colors">
            Tots els números →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {sorted.map((issue: any) => {
            const cover = issue.sections?.find((s: any) => s.type === 'portada')?.backgroundImage || ''
            const isCurrent = issue.number === currentIssueNumber
            return (
              <Link
                key={issue.id}
                href={issuePath(issue.number)}
                className={`shrink-0 w-40 border transition-colors ${isCurrent ? 'border-[var(--accent)]' : 'border-gray-800 hover:border-gray-600'}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  {cover && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${cover}")` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="font-mono text-2xs tracking-[0.2em]" style={{ color: 'var(--accent-text)' }}>
                      Núm. {String(issue.number).padStart(2, '0')}
                    </div>
                    <div className="text-xs font-bold text-white leading-tight line-clamp-2 mt-1">
                      {issue.title}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
