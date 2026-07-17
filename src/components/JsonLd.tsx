import { getSiteUrl } from '@/lib/site'

export function JsonLd() {
  const siteUrl = getSiteUrl()

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Xerrac!',
    url: siteUrl,
    description: "Revista d'aclariment cultural",
    logo: `${siteUrl}/favicon.svg`,
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
      logo: `${siteUrl}/favicon.svg`,
    },
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
    </>
  )
}
