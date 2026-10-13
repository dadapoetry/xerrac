import { getSiteUrl, DEFAULT_CONTACT_EMAIL } from '@/lib/site'
import { getAllSettings } from '@/lib/settings'

export async function JsonLd() {
  const siteUrl = getSiteUrl()

  let settings: Record<string, string> = {}
  try {
    settings = await getAllSettings()
  } catch {
    settings = {}
  }

  const email = settings.contact_email?.trim() || DEFAULT_CONTACT_EMAIL
  const issn = settings.footer_issn?.trim() || ''

  let sameAs: string[] = []
  try {
    const parsed = JSON.parse(settings.footer_social_links || '[]')
    if (Array.isArray(parsed)) {
      sameAs = parsed.map((l: any) => l?.url).filter(Boolean)
    }
  } catch {
    sameAs = []
  }

  const logo = {
    '@type': 'ImageObject',
    url: `${siteUrl}/icon-512.png`,
    width: 512,
    height: 512,
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Xerrac!',
    url: siteUrl,
    description: "Revista d'aclariment cultural",
    logo,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email,
        availableLanguage: ['ca', 'es'],
      },
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Xerrac!',
    url: siteUrl,
    description: "Revista d'aclariment cultural",
    inLanguage: 'ca',
    publisher: {
      '@type': 'Organization',
      name: 'Xerrac!',
      logo,
    },
  }

  const periodical = {
    '@context': 'https://schema.org',
    '@type': 'Periodical',
    name: 'Xerrac!',
    url: siteUrl,
    description: "Revista d'aclariment cultural",
    inLanguage: 'ca',
    publisher: {
      '@type': 'Organization',
      name: 'Xerrac!',
      logo,
    },
    ...(issn ? { issn } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(periodical),
        }}
      />
    </>
  )
}
