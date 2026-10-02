'use client'

import { useState } from 'react'
import { subscribe } from '@/lib/actions'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const result = await subscribe(email.trim())
      setStatus('success')
      setMessage(result.message)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Error en subscriure\'t')
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-gray-800 bg-gray-950 p-6">
        <p className="text-sm text-green-400">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="El teu correu"
        autoFocus
        required
        disabled={status === 'loading'}
        className="w-full bg-gray-950 border border-gray-800 px-4 py-3.5 text-base text-white
          placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full text-white text-sm py-3.5 uppercase tracking-[0.2em] transition-colors
          disabled:opacity-50"
        style={{ backgroundColor: 'var(--accent, #dc2626)' }}
      >
        {status === 'loading' ? 'Enviant...' : 'Subscriure\'m'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-400">{message}</p>
      )}
      <p className="text-[11px] text-gray-600 leading-relaxed">
        Subscripció de doble confirmació: rebràs un correu per confirmar. També et pots
        donar de baixa amb un clic.
      </p>
    </form>
  )
}
