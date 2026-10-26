import { db } from './db'

export interface SubscriberRow {
  id: string
  email: string
  confirmed: boolean
}

export interface SubscriberStats {
  total: number
  confirmed: number
  pending: number
}

export type SubscriberFilter = 'all' | 'confirmed' | 'pending'

export async function getSubscribers(
  search: string = '',
  filter: SubscriberFilter = 'all',
  page: number = 1,
  perPage: number = 50
): Promise<{ rows: SubscriberRow[]; total: number }> {
  const conditions: string[] = []
  const args: (string | number)[] = []

  if (search.trim()) {
    conditions.push('email LIKE ?')
    args.push(`%${search.trim()}%`)
  }

  if (filter === 'confirmed') conditions.push('confirmed = 1')
  if (filter === 'pending') conditions.push('confirmed = 0')

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM Subscriber ${where}`,
    args,
  })
  const total = Number(countResult.rows[0]?.total ?? 0)

  const offset = (page - 1) * perPage
  const result = await db.execute({
    sql: `SELECT id, email, confirmed FROM Subscriber ${where} ORDER BY email ASC LIMIT ? OFFSET ?`,
    args: [...args, perPage, offset],
  })

  return {
    rows: result.rows.map((r) => ({
      id: String(r.id),
      email: String(r.email),
      confirmed: Boolean(r.confirmed),
    })),
    total,
  }
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const result = await db.execute(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN confirmed = 1 THEN 1 ELSE 0 END) AS confirmed
     FROM Subscriber`
  )
  const row: any = result.rows[0] || {}
  const total = Number(row.total) || 0
  const confirmed = Number(row.confirmed) || 0
  return { total, confirmed, pending: total - confirmed }
}

function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function subscribersToCsv(rows: SubscriberRow[]): string {
  const header = ['email', 'estat']
  const lines = rows.map((r) =>
    [csvCell(r.email), csvCell(r.confirmed ? 'confirmat' : 'pendent')].join(',')
  )
  return [header.join(','), ...lines].join('\r\n')
}
