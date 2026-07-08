import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'

interface SocialLink {
  name: string
  url: string
}

export async function Footer() {
  const settings = await getAllSettings()

  let socialLinks: SocialLink[] = []
  try {
    socialLinks = JSON.parse(settings.footer_social_links || '[]')
  } catch {
    socialLinks = []
  }

  const copyright = settings.footer_copyright || ''
  const issn = settings.footer_issn || ''

  return (
    <footer className="border-t border-gray-700 py-8 px-4 no-print">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link
          href="/arxiu"
          className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
        >
          ↪ Arxiu
        </Link>

        {socialLinks.length > 0 && (
          <div className="flex gap-4 text-sm text-gray-400">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-col items-end gap-1">
          {issn && <span className="text-xs text-gray-500">{issn}</span>}
          {copyright && <span className="text-xs text-gray-500">{copyright}</span>}
        </div>
      </div>
    </footer>
  )
}
