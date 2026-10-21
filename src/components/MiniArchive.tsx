import { getPublishedIssues } from '@/lib/data'
import { MiniArchiveScroller } from '@/components/MiniArchiveScroller'

export async function MiniArchive({ currentIssueNumber }: { currentIssueNumber?: number }) {
  let issues: any[] = []
  try {
    issues = await getPublishedIssues()
  } catch {
    return null
  }

  // Només visible quan hi ha més d'un número publicat.
  if (!issues || issues.length <= 1) return null

  return (
    <section className="no-print border-t border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <span className="text-2xs tracking-[0.3em] uppercase font-mono tabular-nums font-semibold" style={{ color: 'var(--accent-text)' }}>
            Arxiu
          </span>
          <a href="/arxiu" className="text-2xs tracking-[0.2em] uppercase font-mono text-gray-400 hover:text-gray-200 transition-colors">
            Tots els números →
          </a>
        </div>
        <MiniArchiveScroller issues={issues} currentIssueNumber={currentIssueNumber} />
      </div>
    </section>
  )
}
