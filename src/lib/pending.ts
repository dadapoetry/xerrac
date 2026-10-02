import { db } from './db'

// Limitació de l'emmagatzematge (RGPD art. 5.1.e): una subscripció que no
// s'ha confirmat no té cap finalitat pendent passats aquests dies.
export const PENDING_TTL_DAYS = 30
const PURGE_INTERVAL_MS = 60 * 60 * 1000
let lastPurge = 0

export async function purgeStalePendingSubscribers(force = false): Promise<number> {
  const now = Date.now()
  if (!force && now - lastPurge < PURGE_INTERVAL_MS) return 0
  lastPurge = now

  try {
    const res = await db.execute({
      sql: 'DELETE FROM Subscriber WHERE confirmed = 0 AND pendingSince IS NOT NULL AND pendingSince < ?',
      args: [now - PENDING_TTL_DAYS * 24 * 60 * 60 * 1000],
    })
    const removed = Number(res.rowsAffected) || 0
    if (removed > 0) {
      console.log(`[subscribers] ${removed} subscripció(ns) pendent(s) eliminada(es) per caducitat`)
    }
    return removed
  } catch (err) {
    console.error('[subscribers] no s\'ha pogut netejar les subscripcions pendents', err)
    return 0
  }
}
