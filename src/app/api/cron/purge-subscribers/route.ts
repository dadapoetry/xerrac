import { NextRequest, NextResponse } from 'next/server'
import { purgeStalePendingSubscribers } from '@/lib/pending'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const removed = await purgeStalePendingSubscribers(true)
  return NextResponse.json({ ok: true, removed })
}
