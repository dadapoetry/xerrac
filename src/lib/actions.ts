'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { db } from './db'
import { v4 as uuid } from 'uuid'
import { safeParse } from '@/lib/utils'
import { getSiteUrl } from './site'
import { checkRateLimit } from './rate-limit'

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
    accentColor: row.accentColor || '#ef4444',
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

export async function getIssues() {
  const result = await db.execute(
    'SELECT * FROM Issue ORDER BY number DESC'
  )
  const issues = result.rows.map(mapIssue)
  await attachSections(issues)
  return issues as any[]
}

export async function getPublishedIssues() {
  const result = await db.execute(
    'SELECT * FROM Issue WHERE published = 1 ORDER BY number DESC'
  )
  const issues = result.rows.map(mapIssue)
  await attachSections(issues)
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
    sql: 'INSERT INTO Issue (id, number, title, date, accentColor) VALUES (?, ?, ?, ?, ?)',
    args: [id, data.number, data.title, data.date, '#ef4444'],
  })
  revalidatePath('/admin')
  revalidatePath('/')
  return { id, ...data }
}

export async function updateIssue(id: string, data: { title?: string; number?: number; date?: string; published?: boolean; accentColor?: string }) {
  await checkAuth()
  const sets: string[] = []
  const args: any[] = []

  if (data.title !== undefined) { sets.push('title = ?'); args.push(data.title) }
  if (data.number !== undefined) { sets.push('number = ?'); args.push(data.number) }
  if (data.date !== undefined) { sets.push('date = ?'); args.push(data.date) }
  if (data.published !== undefined) { sets.push('published = ?'); args.push(data.published ? 1 : 0) }
  if (data.accentColor !== undefined) { sets.push('accentColor = ?'); args.push(data.accentColor) }

  if (sets.length > 0) {
    args.push(id)
    await db.execute({
      sql: `UPDATE Issue SET ${sets.join(', ')}, updatedAt = datetime('now') WHERE id = ?`,
      args,
    })
  }

  if (data.published) {
    const baseUrl = getSiteUrl()
    fetch(`${baseUrl}/api/pdf/${id}`).catch((err) => {
      console.error('[actions] PDF generation failed for', id, err)
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

export async function batchUpdateIssues(updates: { id: string; published: boolean }[]) {
  await checkAuth()
  for (const u of updates) {
    await db.execute({
      sql: 'UPDATE Issue SET published = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      args: [u.published ? 1 : 0, u.id],
    })
  }
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

export async function reorderSections(swaps: { id: string; order: number }[]) {
  await checkAuth()
  for (const s of swaps) {
    await db.execute({
      sql: 'UPDATE Section SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      args: [s.order, s.id],
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

/* Newsletter */

export async function subscribe(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Correu no vàlid')
  }

  const allowed = await checkRateLimit(`subscribe:${email}`, 3, 3600000)
  if (!allowed) {
    throw new Error('Massa intents. Prova-ho més tard.')
  }

  const existing = await db.execute({
    sql: 'SELECT id FROM Subscriber WHERE email = ?',
    args: [email],
  })

  if (existing.rows.length > 0) {
    return { ok: true, message: 'Ja estàs subscrit!' }
  }

  const id = uuid()
  const token = uuid().replace(/-/g, '') + uuid().replace(/-/g, '')

  await db.execute({
    sql: 'INSERT INTO Subscriber (id, email, token, confirmed) VALUES (?, ?, ?, 0)',
    args: [id, email, token],
  })

  try {
    const { sendConfirmation } = await import('./newsletter')
    await sendConfirmation(email, token)
  } catch (err) {
    await db.execute({
      sql: 'DELETE FROM Subscriber WHERE id = ?',
      args: [id],
    })
    console.error('[actions] Failed to send confirmation email to', email, err)
    throw new Error('No s\'ha pogut enviar el correu de confirmació. Prova-ho més tard.')
  }

  return { ok: true, message: 'Revisa el teu correu per confirmar la subscripció.' }
}

export async function confirmSubscription(token: string) {
  const result = await db.execute({
    sql: 'SELECT id FROM Subscriber WHERE token = ? AND confirmed = 0',
    args: [token],
  })
  if (result.rows.length === 0) return { ok: false, message: 'Enllaç invàlid o ja confirmat.' }

  await db.execute({
    sql: 'UPDATE Subscriber SET confirmed = 1 WHERE token = ?',
    args: [token],
  })
  return { ok: true, message: 'Subscripció confirmada!' }
}

export async function unsubscribeByToken(token: string) {
  await db.execute({
    sql: 'DELETE FROM Subscriber WHERE token = ?',
    args: [token],
  })
  return { ok: true }
}

export async function sendIssueNewsletter(issueId: string) {
  await checkAuth()

  const issueResult = await db.execute({
    sql: 'SELECT * FROM Issue WHERE id = ?',
    args: [issueId],
  })
  if (issueResult.rows.length === 0) throw new Error('Número no trobat')
  const issue = issueResult.rows[0] as any

  const sectionsResult = await db.execute({
    sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
    args: [issueId],
  })
  const sections = sectionsResult.rows as any[]

  const subscribersResult = await db.execute({
    sql: 'SELECT email, token FROM Subscriber WHERE confirmed = 1',
    args: [],
  })
  const subscribers = subscribersResult.rows as any[]

  if (subscribers.length === 0) {
    return { ok: true, sent: 0, message: 'No hi ha subscriptors confirmats.' }
  }

  const portada = sections.find((s: any) => s.type === 'portada')
  const coverImage = portada?.backgroundImage || ''

  const summaries = sections
    .filter((s: any) => s.type !== 'portada')
    .map((s: any) => {
    const origIndex = sections.findIndex((sec: any) => sec.id === s.id)
    const content = safeParse(s.content)
    let summary = ''
    let image = ''
    if (typeof content === 'object' && content) {
      if (content.body) {
        summary = content.body.replace(/<[^>]+>/g, '').slice(0, 250)
      } else if (content.topic) {
        summary = content.topic
      } else if (content.entries) {
        summary = content.entries
          .filter((e: any) => e.body)
          .map((e: any) => e.body.replace(/<[^>]+>/g, ''))
          .join(' ').slice(0, 250)
      } else if (content.proverbs) {
        summary = content.proverbs
          .filter((e: any) => e.text)
          .map((e: any) => e.text)
          .join(' · ').slice(0, 250)
      } else if (content.interviews) {
        summary = content.interviews
          .filter((e: any) => e.body)
          .map((e: any) => e.body.replace(/<[^>]+>/g, ''))
          .join(' ').slice(0, 250)
      } else if (content.reviews) {
        summary = content.reviews
          .filter((e: any) => e.body)
          .map((e: any) => e.body.replace(/<[^>]+>/g, ''))
          .join(' ').slice(0, 250)
      } else if (content.investigacio) {
        summary = content.investigacio
          .filter((e: any) => e.body)
          .map((e: any) => e.body.replace(/<[^>]+>/g, ''))
          .join(' ').slice(0, 250)
      } else if (content.source) {
        summary = `Entrevista a ${content.source}`
      } else if (content.collages) {
        summary = content.collages
          .filter((e: any) => e.description)
          .map((e: any) => e.description)
          .join(' ').slice(0, 250)
        const img = content.collages.find((e: any) => e.image)
        if (img) image = img.image
      } else if (content.crossword) {
        const clues: string[] = []
        const across = content.crossword.clues?.across || {}
        const down = content.crossword.clues?.down || {}
        for (const key of Object.keys(across).slice(0, 2)) {
          clues.push(`${across[key].clue} (${across[key].answer.length})`)
        }
        for (const key of Object.keys(down).slice(0, 2)) {
          clues.push(`${down[key].clue} (${down[key].answer.length})`)
        }
        summary = clues.slice(0, 3).join(' · ')
      }
      if (!image) image = content.backgroundImage || content.image || ''
    }
    return {
      title: s.title || s.type,
      summary,
      image,
      origIndex,
    }
  })

  const { sendNewsletterEmail } = await import('./newsletter')
  let sent = 0
  const CHUNK_SIZE = 20
  for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
    const chunk = subscribers.slice(i, i + CHUNK_SIZE)
    const results = await Promise.allSettled(
      chunk.map((sub) =>
        sendNewsletterEmail(sub.email, sub.token, {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          date: new Date(issue.date),
        }, summaries, coverImage)
      )
    )
    for (const r of results) {
      if (r.status === 'fulfilled') sent++
      else console.error('[actions] Newsletter send failed:', r.reason)
    }
  }

  return { ok: true, sent, message: `Butlletí enviat a ${sent} subscriptor(s).` }
}
