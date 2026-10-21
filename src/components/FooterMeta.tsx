import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { DEFAULT_CONTACT_EMAIL } from '@/lib/site'
import { getLatestPublishedIssue } from '@/lib/data'
import { accentStyle } from '@/lib/color'

/** Títol de grup de metadades. El color el posa el bloc que l'envolta. */
export function MetaTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-2xs tracking-[0.2em] uppercase font-semibold mb-3" style={{ color: 'var(--accent-text)' }}>
      {children}
    </div>
  )
}

/**
 * Dades de la publicació, en columna estreta. S'usa com a vora esquerra
 * de les pàgines soltes (/sobre, /subscriu, /privacitat, /arxiu) i com a
 * columnes del peu.
 *
 * Les pàgines soltes no tenen número propi: adopten l'accent del darrer
 * número publicat.
 */
export async function FooterMeta() {
  const settings = await getAllSettings()
  const email = settings.contact_email?.trim() || DEFAULT_CONTACT_EMAIL
  const issn = settings.footer_issn?.trim() || ''
  const periodicity = settings.footer_periodicity?.trim() || ''
  const address = settings.footer_address?.trim() || ''
  const license = settings.footer_license?.trim() || ''

  let socialLinks: { name: string; url: string }[] = []
  try {
    const parsed = JSON.parse(settings.footer_social_links || '[]')
    if (Array.isArray(parsed)) socialLinks = parsed.filter((l: any) => l?.url)
  } catch {
    socialLinks = []
  }

  let latest: any = null
  try {
    latest = await getLatestPublishedIssue()
  } catch {
    latest = null
  }
  const accent = latest?.accentColor || '#ef4444'

  return (
    <div style={accentStyle(accent)}>
      <MetaTitle>Publicació</MetaTitle>
      <ul className="font-mono text-2xs leading-[1.9] text-gray-500">
        <li>Xerrac! Revista d&rsquo;aclariment cultural</li>
        {issn && <li>ISSN: {issn}</li>}
        {periodicity && <li>Periodicitat: {periodicity}</li>}
        {address && <li>{address}</li>}
        {license && <li>{license}</li>}
      </ul>

      <div className="mt-6">
        <MetaTitle>Contacte</MetaTitle>
        <a
          href={`mailto:${email}`}
          className="font-mono text-2xs text-gray-400 hover:text-white transition-colors break-all"
        >
          {email}
        </a>
        {socialLinks.length > 0 && (
          <ul className="mt-2 space-y-1">
            {socialLinks.map((l) => (
              <li key={l.name}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-2xs uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
                >
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
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
      </div>
    </div>
  )
}
