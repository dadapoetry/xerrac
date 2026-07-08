'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Credencials incorrectes')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm p-8 border border-gray-900">
        <div className="flex items-center gap-3 mb-2">
          <Mark className="w-8 h-8 shrink-0" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              XERRAC<span className="text-red-500">!</span>
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-8">Panel d&apos;administració</p>

        <div className="w-8 h-px bg-red-500/50 mb-8" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-800 px-4 py-2.5 text-white
                text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
              Contrasenya
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-800 px-4 py-2.5 text-white
                text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white text-sm uppercase tracking-wider
              hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrant...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
