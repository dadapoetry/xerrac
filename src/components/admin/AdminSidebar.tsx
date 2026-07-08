'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16,18 L52,18
          L66,24 L52,30 L66,36 L52,42
          L66,48 L52,54 L66,60 L52,66
          L16,66 Z"
        fill="#ef4444"
      />
      <rect x="16" y="18" width="33" height="48" rx="1" fill="#000000" />
      <line x1="22" y1="30" x2="44" y2="30" stroke="#ef4444" strokeWidth="1" opacity="0.45" />
      <line x1="22" y1="39" x2="40" y2="39" stroke="#ef4444" strokeWidth="1" opacity="0.35" />
      <line x1="22" y1="48" x2="36" y2="48" stroke="#ef4444" strokeWidth="1" opacity="0.25" />
    </svg>
  )
}

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/numeros', label: 'Números' },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-900
      flex flex-col z-50">
      <div className="p-6 border-b border-gray-900">
        <Link href="/admin" className="flex items-center gap-3 no-underline group">
          <Mark className="w-7 h-7 shrink-0" />
          <div>
            <span className="text-base font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
              XERRAC<span className="text-red-500">!</span>
            </span>
            <p className="text-[10px] text-gray-600 tracking-wider uppercase mt-0.5">
              Admin
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
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
}
