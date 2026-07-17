import { getPublishedIssues } from '@/lib/actions'
import { getSiteUrl } from '@/lib/site'

export default async function sitemap() {
  const issues = await getPublishedIssues()
  const baseUrl = getSiteUrl()

  const issueUrls = issues.map((issue: any) => ({
    url: `${baseUrl}/?issue=${issue.id}`,
    lastModified: new Date(issue.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/arxiu`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...issueUrls,
  ]
}
