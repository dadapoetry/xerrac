import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Inici de sessió',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <LoginForm />
}
