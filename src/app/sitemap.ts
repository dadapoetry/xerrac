import { getPublishedIssues } from '@/lib/data'
import { getSiteUrl } from '@/lib/site'
import { buildSectionSlugMap, issuePath, articlePath } from '@/lib/slugs'

export default async function sitemap() {
  const issues = await getPublishedIssues()
  const baseUrl = getSiteUrl()

  const issueEntries = issues.map((issue: any) => ({
    url: `${baseUrl}${issuePath(issue.number)}`,
    lastModified: new Date(issue.updatedAt || issue.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const articleEntries = issues.flatMap((issue: any) => {
    const sections = (issue.sections as any[]) || []
    const slugMap = buildSectionSlugMap(sections)
    return sections
      .filter((s: any) => s.type !== 'portada')
      .map((s: any) => ({
        url: `${baseUrl}${articlePath(issue.number, slugMap.get(s.id) || s.type)}`,
        lastModified: new Date(s.updatedAt || issue.updatedAt || issue.date),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
  })

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
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/subscriu`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacitat`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    ...issueEntries,
    ...articleEntries,
  ]
}
