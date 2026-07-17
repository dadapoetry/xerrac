import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/actions'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    await unsubscribeByToken(token)
    const dest = new URL('/', req.url)
    dest.searchParams.set('unsubscribed', 'ok')
    return NextResponse.redirect(dest)
  } catch {
    return NextResponse.redirect(new URL('/', req.url))
  }
}
