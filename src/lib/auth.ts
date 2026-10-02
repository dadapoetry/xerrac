import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { checkRateLimit, resetRateLimit } from './rate-limit'

const DEV_SECRET = 'xerrac-secret-change-in-production'
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

if (process.env.NEXTAUTH_SECRET === DEV_SECRET) {
  console.error('CRITICAL: NEXTAUTH_SECRET is the weak default value. Set a strong random value in environment variables.')
}

function clientIp(req: unknown): string {
  const headers = (req as { headers?: { get(name: string): string | null } } | undefined)?.headers
  const forwarded = headers?.get('x-forwarded-for')
  const ip = (forwarded || headers?.get('x-real-ip') || '').split(',')[0].trim()
  return ip || 'unknown'
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contrasenya', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) return null

        const email = credentials.email.toLowerCase().trim()
        const ip = clientIp(req)

        const ipAllowed = await checkRateLimit(`login-ip:${ip}`, 30, 900000)
        if (!ipAllowed) {
          throw new Error('Massa intents des d\'aquesta connexió. Prova-ho en 15 minuts.')
        }

        const allowed = await checkRateLimit(`login:${email}:${ip}`, 5, 900000)
        if (!allowed) {
          throw new Error('Massa intents. Prova-ho en 15 minuts.')
        }

        const result = await db.execute({
          sql: 'SELECT * FROM User WHERE email = ?',
          args: [email],
        })

        if (result.rows.length === 0) {
          await bcrypt.compare(credentials.password, DUMMY_HASH)
          return null
        }

        const user = result.rows[0]
        const isValid = await bcrypt.compare(credentials.password, user.password as string)
        if (!isValid) return null

        await resetRateLimit(`login:${email}:${ip}`)
        await resetRateLimit(`login-ip:${ip}`)
        return { id: user.id as string, name: user.name as string, email: user.email as string }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.sub as string
      }
      return session
    },
  },
}
