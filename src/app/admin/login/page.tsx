import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Inici de sessió',
  robots: { index: false, follow: false },
}

// `LoginForm` llegeix `?callbackUrl` amb `useSearchParams`, i això exigeix una
// frontera de Suspense pròpia. Abans la posava el `loading.tsx` de l'arrel, que
// s'ha tret perquè no bloquegés el 308 de `/`.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  )
}
