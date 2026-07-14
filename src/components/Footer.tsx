import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { getPublishedIssues } from '@/lib/actions'
import { SawIcon } from '@/components/SawIcon'

interface SocialLink {
  name: string
  url: string
}

export async function Footer({ currentIssueNumber }: { currentIssueNumber?: number }) {
  const settings = await getAllSettings()

  let socialLinks: SocialLink[] = []
  try {
    socialLinks = JSON.parse(settings.footer_social_links || '[]')
  } catch {
    socialLinks = []
  }

  const copyright = settings.footer_copyright || ''
  const issn = settings.footer_issn || ''

  let prevIssue: { number: number; title: string; id: string } | null = null
  let nextIssue: { number: number; title: string; id: string; coverImage?: string } | null = null

  if (currentIssueNumber !== undefined) {
    try {
      const issues = await getPublishedIssues()
      const sorted = issues.sort((a: any, b: any) => a.number - b.number)
      const idx = sorted.findIndex((i: any) => i.number === currentIssueNumber)
      if (idx > 0) {
        const p = sorted[idx - 1]
        prevIssue = { number: p.number, title: p.title, id: p.id }
      }
      if (idx >= 0 && idx < sorted.length - 1) {
        const n = sorted[idx + 1]
        const cover = n.sections?.find((s: any) => s.type === 'portada')?.backgroundImage || ''
        nextIssue = { number: n.number, title: n.title, id: n.id, coverImage: cover }
      }
    } catch {}
  }

  return (
    <footer className="border-t border-gray-800 py-16 px-4 no-print">
      <div className="max-w-lg mx-auto text-center">
        {nextIssue && (
          <Link
            href={`/?issue=${nextIssue.id}`}
            className="group block relative overflow-hidden mb-12 border border-gray-800 hover:[border-color:rgba(var(--accent-rgb,239,68,68),0.4)] transition-colors text-left"
          >
            {nextIssue.coverImage && (
              <div className="absolute inset-0 z-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${nextIssue.coverImage}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
              </div>
            )}
            <div className="relative z-[1] p-8">
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] block mb-2">
                Número següent
              </span>
              <span className="text-3xl font-black tracking-tight text-white group-hover:[color:var(--accent,#ef4444)] transition-colors block mb-1">
                {String(nextIssue.number).padStart(2, '0')}
              </span>
              <span className="text-sm text-gray-300 block mb-4">
                {nextIssue.title}
              </span>
              <span className="inline-block text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                Llegir → 
              </span>
            </div>
          </Link>
        )}

        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Xerrac! — Revista d'aclariment cultural</p>
        <div className="flex justify-center mb-3">
          <SawIcon className="w-5 h-5 opacity-60" />
        </div>
        <div className="text-[11px] text-gray-600 leading-relaxed space-y-1">
          {issn && <p>{issn}</p>}
          {copyright && <p>{copyright}</p>}
        </div>

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-5 mt-5 text-xs text-gray-500">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        {(prevIssue || nextIssue) && (
          <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-gray-800 text-[11px]">
            {prevIssue ? (
              <Link href={`/?issue=${prevIssue.id}`} className="text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
                ← {String(prevIssue.number).padStart(2, '0')}
              </Link>
            ) : (
              <span />
            )}
            {nextIssue ? (
              <Link href={`/?issue=${nextIssue.id}`} className="text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
                {String(nextIssue.number).padStart(2, '0')} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6 text-[11px]">
          <Link href="/arxiu" className="text-gray-500 hover:text-white transition-colors uppercase tracking-wider">Arxiu</Link>
          <span className="text-gray-700">·</span>
          <a href="/api/feed" className="text-gray-500 hover:text-white transition-colors uppercase tracking-wider">RSS</a>
        </div>
      </div>
    </footer>
  )
}
