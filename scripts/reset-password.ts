import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  const db = createClient({ url, ...(authToken ? { authToken } : {}) })

  const email = 'admin@laxerrac.cat'
  const newPassword = process.argv[2]

  if (!newPassword) {
    console.error('Usage: npx tsx scripts/reset-password.ts <new-password>')
    process.exit(1)
  }

  const hashed = await bcrypt.hash(newPassword, 12)

  // Check if user exists with this email
  const existing = await db.execute({
    sql: 'SELECT id, email FROM User WHERE email = ?',
    args: [email],
  })

  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'UPDATE User SET password = ? WHERE email = ?',
      args: [hashed, email],
    })
    console.log(`Password updated for ${email}`)
  } else {
    // Try the old email
    const old = await db.execute({
      sql: 'SELECT id, email FROM User WHERE email = ?',
      args: ['admin@xerrac.cat'],
    })
    if (old.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE User SET password = ?, email = ? WHERE email = ?',
        args: [hashed, email, 'admin@xerrac.cat'],
      })
      console.log(`User updated: email set to ${email}, password changed`)
    } else {
      console.error(`No user found with email ${email} or admin@xerrac.cat`)
      process.exit(1)
    }
  }

  db.close()
}

main().catch(console.error)
