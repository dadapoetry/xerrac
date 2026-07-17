import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(q: string): Promise<string> {
  return new Promise(resolve => rl.question(q, resolve))
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  const db = createClient({ url, ...(authToken ? { authToken } : {}) })

  const email = await ask('Email admin: ')
  const password = await ask('Contrasenya: ')
  rl.close()

  const hash = await bcrypt.hash(password, 12)
  const id = randomUUID()

  await db.execute({
    sql: 'INSERT INTO User (id, name, email, password) VALUES (?, ?, ?, ?)',
    args: [id, 'Admin', email, hash],
  })

  console.log('Usuari creat correctament!')
  db.close()
}

main().catch(console.error)
