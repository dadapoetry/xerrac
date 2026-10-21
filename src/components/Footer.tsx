import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { DEFAULT_CONTACT_EMAIL } from '@/lib/site'
import { getPublishedIssues } from '@/lib/data'
import { issuePath } from '@/lib/slugs'
import { SawIcon } from '@/components/SawIcon'
import { accentStyle } from '@/lib/color'
import { MetaTitle } from '@/components/FooterMeta'

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
  const address = settings.footer_address || ''
  const periodicity = settings.footer_periodicity || ''
  const license = settings.footer_license || ''
  const contactEmail = settings.contact_email?.trim() || DEFAULT_CONTACT_EMAIL

  let prevIssue: { number: number; title: string; id: string } | null = null
  let nextIssue: { number: number; title: string; id: string; coverImage?: string } | null = null
  let accent = '#ef4444'

  try {
    const issues = await getPublishedIssues()
    const sorted = issues.sort((a: any, b: any) => a.number - b.number)
    const current = currentIssueNumber !== undefined
      ? sorted.find((i: any) => i.number === currentIssueNumber)
      : sorted[sorted.length - 1]
    // El peu pren el color del número que s'està llegint.
    if (current?.accentColor) accent = current.accentColor

    const idx = currentIssueNumber !== undefined
      ? sorted.findIndex((i: any) => i.number === currentIssueNumber)
      : -1
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

  return (
    <footer className="border-t border-gray-800 py-12 px-4 no-print" style={accentStyle(accent)}>
      <div className="max-w-6xl mx-auto">
        {nextIssue && (
          <Link
            href={issuePath(nextIssue.number)}
            className="group block relative overflow-hidden mb-10 border border-gray-800 hover:border-[var(--accent)] transition-colors text-left"
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
            <div className="relative z-[1] p-6 sm:p-8">
              <span className="text-2xs text-gray-400 uppercase tracking-[0.3em] block mb-2">
                Número següent
              </span>
              <span className="text-3xl font-black tracking-tight text-white group-hover:text-[var(--accent-text)] transition-colors block mb-1">
                {String(nextIssue.number).padStart(2, '0')}
              </span>
              <span className="text-sm text-gray-300 block mb-4">
                {nextIssue.title}
              </span>
              <span className="inline-block text-2xs uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                Llegir →
              </span>
            </div>
          </Link>
        )}

        {/* Peu en tres columnes: la revista, el contacte i la navegació. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <MetaTitle>La revista</MetaTitle>
            <ul className="font-mono text-2xs leading-[1.9] text-gray-500">
              <li>Xerrac! Revista d&rsquo;aclariment cultural</li>
              {issn && <li>ISSN: {issn}</li>}
              {periodicity && <li>Periodicitat: {periodicity}</li>}
              {address && <li>{address}</li>}
              {license && <li>{license}</li>}
            </ul>
          </div>

          <div>
            <MetaTitle>Contacte</MetaTitle>
            <a
              href={`mailto:${contactEmail}`}
              className="font-mono text-2xs text-gray-400 hover:text-white transition-colors break-all"
            >
              {contactEmail}
            </a>
            {socialLinks.length > 0 && (
              <ul className="mt-2 space-y-1">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-2xs uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <MetaTitle>Navegació</MetaTitle>
            <ul className="font-mono text-2xs leading-[1.9]">
              <li>
                <Link href="/arxiu" className="text-gray-400 hover:text-white transition-colors">
                  Arxiu d&rsquo;aclariments
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
                  La revista
                </Link>
              </li>
              <li>
                <Link href="/subscriu" className="text-gray-400 hover:text-white transition-colors">
                  Subscriu-te
                </Link>
              </li>
              <li>
                <Link href="/privacitat" className="text-gray-400 hover:text-white transition-colors">
                  Privacitat
                </Link>
              </li>
              <li>
                <a href="/api/feed" className="text-gray-400 hover:text-white transition-colors">
                  RSS
                </a>
              </li>
            </ul>

            {(prevIssue || nextIssue) && (
              <div className="flex gap-5 mt-4 text-2xs">
                {prevIssue ? (
                  <Link href={issuePath(prevIssue.number)} className="inline-block py-1 text-gray-500 hover:text-white transition-colors uppercase tracking-wider">
                    ← {String(prevIssue.number).padStart(2, '0')}
                  </Link>
                ) : (
                  <span />
                )}
                {nextIssue ? (
                  <Link href={issuePath(nextIssue.number)} className="inline-block py-1 text-gray-500 hover:text-white transition-colors uppercase tracking-wider">
                    {String(nextIssue.number).padStart(2, '0')} →
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Línia de colofó */}
        <div className="mt-10 pt-5 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xs text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
              Xerrac!
            </Link>
            <SawIcon className="w-3.5 h-3.5 opacity-40" />
          </div>
          <p className="font-mono text-2xs text-gray-600">
            {copyright || `© ${new Date().getFullYear()} Xerrac!`}
          </p>
        </div>
      </div>
    </footer>
  )
}
