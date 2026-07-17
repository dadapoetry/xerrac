import { NextRequest, NextResponse } from 'next/server'
import { confirmSubscription } from '@/lib/actions'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing-token', req.url))
  }

  try {
    const result = await confirmSubscription(token)
    const dest = new URL('/', req.url)
    dest.searchParams.set('subscribed', result.ok ? 'ok' : 'error')
    return NextResponse.redirect(dest)
  } catch {
    return NextResponse.redirect(new URL('/?subscribed=error', req.url))
  }
}
