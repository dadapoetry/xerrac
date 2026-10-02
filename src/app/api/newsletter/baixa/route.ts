import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/actions'
import { getSiteUrl } from '@/lib/site'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/', getSiteUrl()))
  }

  try {
    const result = await unsubscribeByToken(token)
    const dest = new URL('/', getSiteUrl())
    dest.searchParams.set('unsubscribed', result.removed ? 'ok' : 'invalid')
    return NextResponse.redirect(dest)
  } catch {
    return NextResponse.redirect(new URL('/', getSiteUrl()))
  }
}
