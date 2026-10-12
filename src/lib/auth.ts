import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { checkRateLimit, resetRateLimit } from './rate-limit'
import { authSecretWarning, isAuthSecretSecure } from './auth-secret'

const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

const secretWarning = authSecretWarning()
if (secretWarning) {
  console.error(secretWarning)
}

function clientIp(req: unknown): string {
  // next-auth transforms the incoming request into an internal one i, segons la
  // versio, `headers` pot ser un Headers (te .get) o un objecte pla (no en te).
  const headers = (req as { headers?: unknown } | undefined)?.headers
  let forwarded: string | null = null
  if (headers) {
    if (typeof (headers as Headers).get === 'function') {
      const h = headers as Headers
      forwarded = h.get('x-forwarded-for') || h.get('x-real-ip')
    } else {
      const h = headers as Record<string, string | string[] | undefined>
      const value = h['x-forwarded-for'] ?? h['x-real-ip']
      forwarded = Array.isArray(value) ? value[0] ?? null : value ?? null
    }
  }
  const ip = (forwarded || '').split(',')[0].trim()
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
        if (!isAuthSecretSecure()) {
          throw new Error('Configuració de seguretat incorrecta. Consulta el registre del servidor.')
        }

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
