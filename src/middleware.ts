import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthSecretSecure } from '@/lib/auth-secret'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow unauthenticated access to the login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Amb un secret weak o absent no es pot garantir que la cookie de sessió
  // sigui autèntica, així que l'admin queda tancat fins que es configuri.
  if (!isAuthSecretSecure()) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('error', 'config')
    return NextResponse.redirect(loginUrl)
  }

  const token = await getToken({ req })

  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/api/upload'))) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/upload/:path*'],
}
