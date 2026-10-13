import { getSiteUrl } from '@/lib/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/api/og', '/api/feed'],
        disallow: ['/admin/', '/api/', '/compilar/'],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
