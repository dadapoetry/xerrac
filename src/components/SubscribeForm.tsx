'use client'

import { useState } from 'react'
import { subscribe } from '@/lib/actions'
import { PrivacyNote } from '@/components/PrivacyNote'

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
      <div className="border border-gray-800 bg-gray-950 p-6" role="status">
        <p className="text-sm text-green-400">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="subscribe-email" className="sr-only">El teu correu electrònic</label>
      <input
        id="subscribe-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="El teu correu"
        required
        disabled={status === 'loading'}
        className="w-full bg-gray-950 border border-gray-500 px-4 py-3.5 text-md text-white
          placeholder:text-[var(--meta)] focus:outline-none focus:border-[var(--accent-text)] transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full text-sm py-3.5 uppercase tracking-[0.2em] transition-colors
          disabled:opacity-50"
        style={{ backgroundColor: 'var(--accent, #dc2626)', color: 'var(--accent-on, #ffffff)' }}
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enviant...
          </span>
        ) : 'Subscriure\'m'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-400" role="alert">{message}</p>
      )}

      <PrivacyNote className="mt-3" />
    </form>
  )
}
