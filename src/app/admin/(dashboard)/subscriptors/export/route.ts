import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSubscribers, subscribersToCsv, SubscriberFilter } from '@/lib/subscribers'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('No autoritzat', { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const filter = (['all', 'confirmed', 'pending'].includes(searchParams.get('f') || '')
    ? searchParams.get('f')
    : 'all') as SubscriberFilter

  const rows = await getSubscribers(query, filter)
  const csv = subscribersToCsv(rows)

  const stamp = new Date().toISOString().slice(0, 10)

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscriptors-xerrac-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
