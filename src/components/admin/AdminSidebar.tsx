'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/numeros', label: 'Números' },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-950 border-r border-gray-800
      flex flex-col z-50">
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="text-xl font-bold text-red-500 tracking-tight">
          XERRAC!
        </Link>
        <p className="text-xs text-gray-600 mt-1">Panel d&apos;administració</p>
      </div>

      <nav className="flex-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 text-sm rounded transition-colors mb-1
              ${pathname === link.href
                ? 'bg-red-900/30 text-red-400 border-l-2 border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 mb-2">{user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider"
        >
          Tancar sessió
        </button>
      </div>
    </div>
  )
}
