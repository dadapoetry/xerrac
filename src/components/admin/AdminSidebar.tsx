'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/numeros', label: 'Números' },
  ]

  const sidebar = (
    <div className="h-full w-64 bg-black border-r border-gray-900 flex flex-col">
      <div className="p-6 border-b border-gray-900">
        <Link href="/admin" className="no-underline group" onClick={() => setOpen(false)}>
          <span className="text-base font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
            XERRAC<span className="text-red-500">!</span>
          </span>
          <p className="text-[10px] text-gray-600 tracking-wider uppercase mt-0.5">
            Admin
          </p>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`block px-4 py-2.5 text-sm transition-colors mb-1 border-l-2
              ${pathname === link.href
                ? 'border-red-500 text-red-400 bg-red-900/10'
                : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-900">
        <p className="text-xs text-gray-700 mb-2 truncate">{user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-[11px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider"
        >
          Tancar sessió
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 md:hidden w-8 h-8 bg-black/80 border border-gray-800 text-gray-400 flex items-center justify-center text-sm"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 z-50">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            {sidebar}
          </div>
        </div>
      )}
    </>
  )
}
