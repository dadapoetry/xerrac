import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { SawIcon } from '@/components/SawIcon'

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
    <footer className="border-t border-gray-800 py-16 px-4 no-print">
      <div className="max-w-lg mx-auto text-center">
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

        <div className="flex justify-center gap-4 mt-6 text-[11px]">
          <Link href="/arxiu" className="text-gray-500 hover:text-white transition-colors uppercase tracking-wider">Arxiu</Link>
          <span className="text-gray-700">·</span>
          <a href="/api/feed" className="text-gray-500 hover:text-white transition-colors uppercase tracking-wider">RSS</a>
        </div>
      </div>
    </footer>
  )
}
