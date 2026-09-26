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

function revalidatePublic() {
  revalidatePath('/')
  revalidatePath('/arxiu')
  revalidatePath('/api/feed')
  revalidatePath('/sitemap.xml')
}

export async function createIssue(data: { number: number; title: string; date: string }) {
  await checkAuth()
  const id = uuid()
  await db.execute({
    sql: 'INSERT INTO Issue (id, number, title, date, accentColor, published) VALUES (?, ?, ?, ?, ?, 0)',
    args: [id, data.number, data.title, data.date, '#ef4444'],
  })
  revalidatePublic()
  return { id, ...data }
}

export async function updateIssue(id: string, data: { title?: string; number?: number; date?: string; published?: boolean; accentColor?: string; showPdfButton?: boolean }) {
  await checkAuth()
  const sets: string[] = []
  const args: any[] = []

  if (data.title !== undefined) { sets.push('title = ?'); args.push(data.title) }
  if (data.number !== undefined) { sets.push('number = ?'); args.push(data.number) }
  if (data.date !== undefined) { sets.push('date = ?'); args.push(data.date) }
  if (data.published !== undefined) { sets.push('published = ?'); args.push(data.published ? 1 : 0) }
  if (data.accentColor !== undefined) { sets.push('accentColor = ?'); args.push(data.accentColor) }
  if (data.showPdfButton !== undefined) { sets.push('showPdfButton = ?'); args.push(data.showPdfButton ? 1 : 0) }

  if (sets.length > 0) {
    args.push(id)
    await db.execute({
      sql: `UPDATE Issue SET ${sets.join(', ')}, updatedAt = datetime('now') WHERE id = ?`,
      args,
    })
  }

  if (data.published && data.showPdfButton !== false) {
    const baseUrl = getSiteUrl()
    fetch(`${baseUrl}/api/pdf/${id}`).catch((err) => {
      console.error('[actions] PDF generation failed for', id, err)
    })
  }

  revalidatePublic()
}

export async function deleteIssue(id: string) {
  await checkAuth()
  await db.execute({ sql: 'DELETE FROM Section WHERE issueId = ?', args: [id] })
  await db.execute({ sql: 'DELETE FROM Issue WHERE id = ?', args: [id] })
  revalidatePublic()
}

export async function batchUpdateIssues(updates: { id: string; published: boolean }[]) {
  await checkAuth()
  await db.batch(
    updates.map((u) => ({
      sql: 'UPDATE Issue SET published = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      args: [u.published ? 1 : 0, u.id],
    })),
  )
  revalidatePublic()
}

export async function createSection(data: {
  issueId: string
  type: string
  order: number
  title: string
  content: string
  backgroundImage?: string
  backgroundImageMobile?: string
}) {
  await checkAuth()
  const id = uuid()
  await db.execute({
    sql: 'INSERT INTO Section (id, issueId, type, "order", title, content, backgroundImage, backgroundImageMobile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, data.issueId, data.type, data.order, data.title, data.content, data.backgroundImage || '', data.backgroundImageMobile || ''],
  })
  revalidatePublic()
  return { id, ...data }
}

export async function updateSection(id: string, data: {
  title?: string
  content?: string
  backgroundImage?: string
  backgroundImageMobile?: string
  order?: number
  type?: string
}) {
  await checkAuth()
  const sets: string[] = []
  const args: any[] = []

  if (data.title !== undefined) { sets.push('title = ?'); args.push(data.title) }
  if (data.content !== undefined) { sets.push('content = ?'); args.push(data.content) }
  if (data.backgroundImage !== undefined) { sets.push('backgroundImage = ?'); args.push(data.backgroundImage) }
  if (data.backgroundImageMobile !== undefined) { sets.push('backgroundImageMobile = ?'); args.push(data.backgroundImageMobile) }
  if (data.order !== undefined) { sets.push('"order" = ?'); args.push(data.order) }
  if (data.type !== undefined) { sets.push('type = ?'); args.push(data.type) }

  if (sets.length > 0) {
    args.push(id)
    await db.execute({
      sql: `UPDATE Section SET ${sets.join(', ')}, updatedAt = datetime('now') WHERE id = ?`,
      args,
    })
  }

  revalidatePublic()
}

export async function reorderSections(swaps: { id: string; order: number }[]) {
  await checkAuth()
  await db.batch(
    swaps.map((s) => ({
      sql: 'UPDATE Section SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      args: [s.order, s.id],
    })),
  )
  revalidatePublic()
}

export async function deleteSection(id: string) {
  await checkAuth()
  const secResult = await db.execute({
    sql: 'SELECT issueId FROM Section WHERE id = ?',
    args: [id],
  })
  const row = secResult.rows[0]
  if (!row) return

  const issueId = row.issueId as string
  const remaining = await db.execute({
    sql: 'SELECT id FROM Section WHERE issueId = ? AND id <> ? ORDER BY "order" ASC, rowid ASC',
    args: [issueId, id],
  })

  const statements: any[] = [{ sql: 'DELETE FROM Section WHERE id = ?', args: [id] }]
  remaining.rows.forEach((r, i) => {
    statements.push({
      sql: 'UPDATE Section SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      args: [i, r.id],
    })
  })

  await db.batch(statements)
  revalidatePublic()
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

  const { sendNewsletterBatch } = await import('./newsletter')
  const recipients = subscribers.map((sub) => ({
    email: sub.email,
    token: sub.token,
  }))
  const issueMeta = {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    date: new Date(issue.date),
  }
  let sent = 0
  const CHUNK = 100
  for (let i = 0; i < recipients.length; i += CHUNK) {
    const chunk = recipients.slice(i, i + CHUNK)
    try {
      const n = await sendNewsletterBatch(chunk, issueMeta, summaries, coverImage)
      sent += n
    } catch (err) {
      console.error('[actions] Newsletter batch failed:', err)
    }
  }

  return { ok: true, sent, message: `Butlletí enviat a ${sent} subscriptor(s).` }
}
