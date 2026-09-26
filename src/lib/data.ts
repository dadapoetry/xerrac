import { cache } from 'react'
import { db } from './db'

function toDate(val: string | null | undefined): Date {
  if (!val) return new Date()
  const d = new Date(val + 'Z')
  return isNaN(d.getTime()) ? new Date() : d
}

function mapIssue(row: any) {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    date: toDate(row.date),
    published: Boolean(row.published),
    showPdfButton: row.showPdfButton === undefined ? true : Boolean(row.showPdfButton),
    accentColor: row.accentColor || '#ef4444',
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
    sectionCount: Number(row.sectionCount) || 0,
    sections: [] as any[],
  }
}

function mapSection(row: any) {
  return {
    id: row.id,
    issueId: row.issueId,
    type: row.type,
    order: row.order,
    title: row.title,
    content: row.content,
    backgroundImage: row.backgroundImage,
    backgroundImageMobile: row.backgroundImageMobile || '',
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }
}

async function attachSections(issues: any[]): Promise<void> {
  if (issues.length === 0) return
  const ids = issues.map(i => i.id)
  const placeholders = ids.map(() => '?').join(',')
  const secResult = await db.execute({
    sql: `SELECT * FROM Section WHERE issueId IN (${placeholders}) ORDER BY "order" ASC`,
    args: ids,
  })
  const sections = secResult.rows.map(mapSection)
  const byIssue = new Map<string, any[]>()
  for (const s of sections) {
    if (!byIssue.has(s.issueId)) byIssue.set(s.issueId, [])
    byIssue.get(s.issueId)!.push(s)
  }
  for (const issue of issues) {
    issue.sections = byIssue.get(issue.id) || []
  }
}

async function loadIssueSections(issue: any): Promise<void> {
  const secResult = await db.execute({
    sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
    args: [issue.id],
  })
  issue.sections = secResult.rows.map(mapSection)
}

export const getIssues = cache(async () => {
  const result = await db.execute(
    `SELECT i.*, (SELECT COUNT(*) FROM Section s WHERE s.issueId = i.id) AS sectionCount
     FROM Issue i ORDER BY number DESC`
  )
  return result.rows.map(mapIssue) as any[]
})

export const getPublishedIssues = cache(async () => {
  const result = await db.execute(
    'SELECT * FROM Issue WHERE published = 1 ORDER BY number DESC'
  )
  const issues = result.rows.map(mapIssue)
  await attachSections(issues)
  return issues as any[]
})

export const getIssue = cache(async (id: string) => {
  const result = await db.execute({
    sql: 'SELECT * FROM Issue WHERE id = ?',
    args: [id],
  })
  if (result.rows.length === 0) return null

  const issue = mapIssue(result.rows[0])
  await loadIssueSections(issue)
  return issue as any
})

export const getLatestIssue = cache(async () => {
  const result = await db.execute(
    'SELECT * FROM Issue WHERE published = 1 ORDER BY number DESC LIMIT 1'
  )
  if (result.rows.length === 0) return null

  const issue = mapIssue(result.rows[0])
  await loadIssueSections(issue)
  return issue as any
})