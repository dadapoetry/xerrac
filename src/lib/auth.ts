import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

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

        const result = await db.execute({
          sql: 'SELECT * FROM User WHERE email = ?',
          args: [credentials.email],
        })

        if (result.rows.length === 0) return null

        const user = result.rows[0]
        const isValid = await bcrypt.compare(credentials.password, user.password as string)
        if (!isValid) return null

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
        (session.user as any).id = token.sub as string
      }
      return session
    },
  },
}
