'use server'

import { db } from './db'

export async function getSetting(key: string): Promise<string> {
  const result = await db.execute({
    sql: 'SELECT value FROM Settings WHERE key = ?',
    args: [key],
  })
  return (result.rows[0]?.value as string) ?? ''
}

export async function setSetting(key: string, value: string) {
  await db.execute({
    sql: 'INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)',
    args: [key, value],
  })
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const result = await db.execute('SELECT key, value FROM Settings')
  const settings: Record<string, string> = {}
  for (const row of result.rows) {
    settings[row.key as string] = row.value as string
  }
  return settings
}

export async function updateSettings(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    await setSetting(key, value)
  }
}
