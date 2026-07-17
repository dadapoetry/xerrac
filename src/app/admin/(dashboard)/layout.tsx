import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar user={session.user || {}} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-14 md:pt-8">
        {children}
      </main>
    </div>
  )
}
