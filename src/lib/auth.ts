import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { checkRateLimit, resetRateLimit } from './rate-limit'

const DEV_SECRET = 'xerrac-secret-change-in-production'

if (process.env.NEXTAUTH_SECRET === DEV_SECRET) {
  console.error('CRITICAL: NEXTAUTH_SECRET is the weak default value. Set a strong random value in environment variables.')
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

        const allowed = await checkRateLimit(`login:${credentials.email}`, 5, 900000)
        if (!allowed) {
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

        await resetRateLimit(`login:${credentials.email}`)
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
