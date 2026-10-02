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
  filter: SubscriberFilter = 'all'
): Promise<SubscriberRow[]> {
  const conditions: string[] = []
  const args: (string | number)[] = []

  if (search.trim()) {
    conditions.push('email LIKE ?')
    args.push(`%${search.trim()}%`)
  }

  if (filter === 'confirmed') conditions.push('confirmed = 1')
  if (filter === 'pending') conditions.push('confirmed = 0')

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await db.execute({
    sql: `SELECT id, email, confirmed FROM Subscriber ${where} ORDER BY email ASC`,
    args,
  })

  return result.rows.map((row: any) => ({
    id: String(row.id),
    email: String(row.email),
    confirmed: Boolean(row.confirmed),
  }))
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
  return `"${value.replace(/"/g, '""')}"`
}

export function subscribersToCsv(rows: SubscriberRow[]): string {
  const header = ['email', 'estat']
  const lines = rows.map((r) =>
    [csvCell(r.email), csvCell(r.confirmed ? 'confirmat' : 'pendent')].join(',')
  )
  return [header.join(','), ...lines].join('\r\n')
}
