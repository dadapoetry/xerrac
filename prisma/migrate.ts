import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

async function migrate() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  const db = createClient({ url, ...(authToken ? { authToken } : {}) })
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')

  const statements = sql.split(';').filter(s => s.trim())
  for (const stmt of statements) {
    await db.execute(stmt)
  }

  const alterStatements = [
    `ALTER TABLE Issue ADD COLUMN accentColor TEXT NOT NULL DEFAULT '#ef4444'`,
  ]

  for (const stmt of alterStatements) {
    try {
      await db.execute(stmt)
    } catch {
      // column already exists — safe to ignore
    }
  }

  console.log('Migration completed!')
  db.close()
}

migrate().catch(console.error)
