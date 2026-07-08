import { createClient, Client } from '@libsql/client'

const globalForDb = globalThis as unknown as { db: Client | undefined }

function createDb() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  return createClient({
    url,
    ...(authToken ? { authToken } : {}),
  })
}

export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

export default db
