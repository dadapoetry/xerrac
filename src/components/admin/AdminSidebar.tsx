'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { getSiteUrl } from '@/lib/site'

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/numeros', label: 'Números' },
    { href: '/admin/config', label: 'Configuració' },
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

      <div className="p-4 border-t border-gray-900 space-y-2">
        <a
          href={getSiteUrl()}
          target="_blank"
          className="block text-[11px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider"
        >
          Veure lloc →
        </a>
        <p className="text-xs text-gray-700 truncate">{user?.email}</p>
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
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-3 left-3 z-50 md:hidden w-8 h-8 flex items-center justify-center text-sm transition-all ${
          open ? 'bg-transparent text-white' : 'bg-black/80 border border-gray-800 text-gray-400'
        }`}
        aria-label={open ? 'Tancar menú' : 'Obrir menú'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          {open ? (
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          ) : (
            <path d="M3 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5Zm0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 15Z" />
          )}
        </svg>
      </button>

      <div className={`hidden md:block fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-200 ${open ? 'translate-x-0' : ''}`}>
        {sidebar}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 animate-slide-right">
            {sidebar}
          </div>
        </div>
      )}
    </>
  )
}
