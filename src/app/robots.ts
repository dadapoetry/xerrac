import { getSiteUrl } from '@/lib/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/admin/', '/api/', '/compilar/'],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
