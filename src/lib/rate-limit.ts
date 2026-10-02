import { db } from './db'

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000
const CLEANUP_MAX_AGE_MS = 24 * 60 * 60 * 1000
let lastCleanup = 0

async function cleanupStaleEntries(now: number): Promise<void> {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  try {
    await db.execute({
      sql: 'DELETE FROM RateLimit WHERE window_start < ?',
      args: [now - CLEANUP_MAX_AGE_MS],
    })
  } catch {
    // silent
  }
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now()
  const cutoff = now - windowMs
  await cleanupStaleEntries(now)

  try {
    const result = await db.execute({
      sql: 'SELECT attempts, window_start FROM RateLimit WHERE key = ?',
      args: [key],
    })

    if (result.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO RateLimit (key, attempts, window_start) VALUES (?, 1, ?)',
        args: [key, now],
      })
      return true
    }

    const row = result.rows[0] as any

    if (row.window_start < cutoff) {
      await db.execute({
        sql: 'UPDATE RateLimit SET attempts = 1, window_start = ? WHERE key = ?',
        args: [now, key],
      })
      return true
    }

    if (row.attempts >= maxAttempts) return false

    await db.execute({
      sql: 'UPDATE RateLimit SET attempts = attempts + 1 WHERE key = ?',
      args: [key],
    })
    return true
  } catch (err) {
    console.error('[rate-limit] DB error, allowing request:', err)
    return true
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM RateLimit WHERE key = ?',
      args: [key],
    })
  } catch {
    // silent
  }
}
