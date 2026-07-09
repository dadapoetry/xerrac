'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { db } from './db'
import { v4 as uuid } from 'uuid'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autoritzat')
}

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
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
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
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }
}

export async function getIssues() {
  const result = await db.execute(
    'SELECT * FROM Issue ORDER BY number DESC'
  )
  const issues = result.rows.map(mapIssue)

  for (const issue of issues) {
    const secResult = await db.execute({
      sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
      args: [issue.id],
    })
    issue.sections = secResult.rows.map(mapSection)
  }

  return issues as any[]
}

export async function getPublishedIssues() {
  const result = await db.execute(
    'SELECT * FROM Issue WHERE published = 1 ORDER BY number DESC'
  )
  const issues = result.rows.map(mapIssue)

  for (const issue of issues) {
    const secResult = await db.execute({
      sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
      args: [issue.id],
    })
    issue.sections = secResult.rows.map(mapSection)
  }

  return issues as any[]
}

export async function getIssue(id: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM Issue WHERE id = ?',
    args: [id],
  })
  if (result.rows.length === 0) return null

  const issue = mapIssue(result.rows[0])
  const secResult = await db.execute({
    sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
    args: [id],
  })
  issue.sections = secResult.rows.map(mapSection)

  return issue as any
}

export async function getLatestIssue() {
  const result = await db.execute(
    'SELECT * FROM Issue WHERE published = 1 ORDER BY number DESC LIMIT 1'
  )
  if (result.rows.length === 0) return null

  const issue = mapIssue(result.rows[0])
  const secResult = await db.execute({
    sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
    args: [issue.id],
  })
  issue.sections = secResult.rows.map(mapSection)

  return issue as any
}

export async function createIssue(data: { number: number; title: string; date: string }) {
  await checkAuth()
  const id = uuid()
  await db.execute({
    sql: 'INSERT INTO Issue (id, number, title, date) VALUES (?, ?, ?, ?)',
    args: [id, data.number, data.title, data.date],
  })
  revalidatePath('/admin')
  revalidatePath('/')
  return { id, ...data }
}

export async function updateIssue(id: string, data: { title?: string; number?: number; date?: string; published?: boolean }) {
  await checkAuth()
  const sets: string[] = []
  const args: any[] = []

  if (data.title !== undefined) { sets.push('title = ?'); args.push(data.title) }
  if (data.number !== undefined) { sets.push('number = ?'); args.push(data.number) }
  if (data.date !== undefined) { sets.push('date = ?'); args.push(data.date) }
  if (data.published !== undefined) { sets.push('published = ?'); args.push(data.published ? 1 : 0) }

  if (sets.length > 0) {
    args.push(id)
    await db.execute({
      sql: `UPDATE Issue SET ${sets.join(', ')}, updatedAt = datetime('now') WHERE id = ?`,
      args,
    })
  }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteIssue(id: string) {
  await checkAuth()
  await db.execute({ sql: 'DELETE FROM Section WHERE issueId = ?', args: [id] })
  await db.execute({ sql: 'DELETE FROM Issue WHERE id = ?', args: [id] })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function createSection(data: {
  issueId: string
  type: string
  order: number
  title: string
  content: string
  backgroundImage?: string
}) {
  await checkAuth()
  const id = uuid()
  await db.execute({
    sql: 'INSERT INTO Section (id, issueId, type, "order", title, content, backgroundImage) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, data.issueId, data.type, data.order, data.title, data.content, data.backgroundImage || ''],
  })
  revalidatePath('/admin')
  revalidatePath('/')
  return { id, ...data }
}

export async function updateSection(id: string, data: {
  title?: string
  content?: string
  backgroundImage?: string
  order?: number
  type?: string
}) {
  await checkAuth()
  const sets: string[] = []
  const args: any[] = []

  if (data.title !== undefined) { sets.push('title = ?'); args.push(data.title) }
  if (data.content !== undefined) { sets.push('content = ?'); args.push(data.content) }
  if (data.backgroundImage !== undefined) { sets.push('backgroundImage = ?'); args.push(data.backgroundImage) }
  if (data.order !== undefined) { sets.push('"order" = ?'); args.push(data.order) }
  if (data.type !== undefined) { sets.push('type = ?'); args.push(data.type) }

  if (sets.length > 0) {
    args.push(id)
    await db.execute({
      sql: `UPDATE Section SET ${sets.join(', ')}, updatedAt = datetime('now') WHERE id = ?`,
      args,
    })
  }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteSection(id: string) {
  await checkAuth()
  await db.execute({ sql: 'DELETE FROM Section WHERE id = ?', args: [id] })
  revalidatePath('/admin')
}
