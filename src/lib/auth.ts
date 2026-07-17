import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

const DEV_SECRET = 'xerrac-secret-change-in-production'

if (process.env.NEXTAUTH_SECRET === DEV_SECRET && process.env.VERCEL) {
  console.error('CRITICAL: NEXTAUTH_SECRET is the weak default value. Set a strong random value in Vercel environment variables.')
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(email)
  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) return false
    entry.count++
  } else {
    loginAttempts.set(email, { count: 1, resetAt: now + 900000 })
  }
  return true
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contrasenya', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        if (!checkRateLimit(credentials.email)) {
          throw new Error('Massa intents. Prova-ho en 15 minuts.')
        }

        const result = await db.execute({
          sql: 'SELECT * FROM User WHERE email = ?',
          args: [credentials.email],
        })

        if (result.rows.length === 0) return null

        const user = result.rows[0]
        const isValid = await bcrypt.compare(credentials.password, user.password as string)
        if (!isValid) return null

        loginAttempts.delete(credentials.email)
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
