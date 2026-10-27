import { getSiteUrl } from '@/lib/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        // `/api/og` es deixa rastrejar expressament: les imatges OG es treuen de
        // l'índex amb `X-Robots-Tag: noindex` (next.config.js), i un Disallow
        // aquí impediria que Google llegís aquesta capçalera.
        allow: ['/api/og', '/api/feed', '/feed.xml', '/feed', '/rss.xml', '/rss'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
