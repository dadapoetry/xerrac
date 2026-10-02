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
    `ALTER TABLE Issue ADD COLUMN showPdfButton INTEGER NOT NULL DEFAULT 1`,
    `ALTER TABLE Section ADD COLUMN backgroundImageMobile TEXT NOT NULL DEFAULT ''`,
  ]

  for (const stmt of alterStatements) {
    try {
      await db.execute(stmt)
    } catch {
      // column already exists — safe to ignore
    }
  }

  // pendingSince només existeix fins que la subscripció es confirma.
  try {
    await db.execute('ALTER TABLE Subscriber ADD COLUMN pendingSince INTEGER')
  } catch {
    // column already exists — safe to ignore
  }

  // Subscriber: no emmagatzemem cap data ni hora d'alta (minimització de dades).
  // Reconstrueix la taula només si encara hi ha la columna createdAt.
  // Es fa abans dels ALTER perquè la taula nova ja surti amb la forma final.
  const subCols = await db.execute('PRAGMA table_info(Subscriber)')
  if (subCols.rows.some((r: any) => r.name === 'createdAt')) {
    await db.execute(`CREATE TABLE Subscriber_new (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL,
      confirmed INTEGER NOT NULL DEFAULT 0,
      pendingSince INTEGER
    )`)
    await db.execute(
      'INSERT INTO Subscriber_new (id, email, token, confirmed) SELECT id, email, token, confirmed FROM Subscriber'
    )
    await db.execute('DROP TABLE Subscriber')
    await db.execute('ALTER TABLE Subscriber_new RENAME TO Subscriber')
    console.log('Subscriber: columna createdAt eliminada')
  }

  console.log('Migration completed!')
  db.close()
}

migrate().catch(console.error)
