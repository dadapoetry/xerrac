'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const configError = searchParams.get('error') === 'config'

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
      setError(
        configError
          ? 'Configuració de seguretat incorrecta: el secret de la sessió no és vàlid. Consulta el registre del servidor.'
          : 'Credencials incorrectes',
      )
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm p-8 border border-gray-900">
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          XERRAC<span className="text-red-500">!</span>
        </h1>
        <div className="h-px w-12 bg-red-500/50 mb-6" />
        <p className="text-sm text-gray-600 mb-8">Panel d&apos;administració</p>

        {configError && (
          <p className="mb-6 border border-red-900/60 bg-red-950/20 p-3 text-xs leading-relaxed text-red-300">
            Configuració de seguretat incorrecta: el secret de la sessió ({'NEXTAUTH_SECRET'}) no
            està definit o és massa feble. L&apos;administració queda tancada fins que es configuri.
          </p>
        )}

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
