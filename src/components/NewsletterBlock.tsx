'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import { subscribe } from '@/lib/actions'
import { PrivacyNote } from './PrivacyNote'
import { SawIcon } from './SawIcon'

/**
 * El butlletí, en flux.
 *
 * Abans era un panell absolut dins de la capçalera sticky: s'obria sol en
 * arribar a la secció 03 i tapava la primera línia de text de cada pantalla.
 * Ara és una banda quieta al final de l'editorial, amplada de columna, sense
 * overlay ni tancament: no interromp res perquè no apareix fins que s'ha
 * acabat de llegir la primera peça.
 */
export function NewsletterBlock() {
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
      track('subscripcio')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Error en subscriure\'t')
    }
  }

  return (
    <div className="px-4 md:px-6 py-12">
      <div className="max-w-prose w-full mx-auto border-t border-gray-800 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <SawIcon className="w-4 h-4" />
          <span className="text-2xs text-gray-500 font-mono tracking-[0.3em] uppercase">
            Butlletí
          </span>
          <div className="h-px w-12" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.4)' }} />
        </div>

        {status === 'success' ? (
          <p className="text-md text-green-400" role="status">{message}</p>
        ) : (
          <>
            <p className="text-md text-gray-300 leading-relaxed mb-5">
              Cada número, al teu correu. Semestral, en català, sense soroll.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="newsletter-block-email" className="sr-only">
                El teu correu electrònic
              </label>
              <input
                id="newsletter-block-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="El teu correu"
                required
                disabled={status === 'loading'}
                className="flex-1 bg-gray-950 border border-gray-500 px-3 py-2.5 text-sm text-white
                  placeholder:text-[var(--meta)] focus:outline-none focus:border-[var(--accent-text)] transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="text-xs px-6 py-3 uppercase tracking-widest transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent, #dc2626)', color: 'var(--accent-on, #0a0a0a)' }}
              >
                {status === 'loading' ? 'Enviant...' : 'Subscriure\'m'}
              </button>
            </form>

            {status === 'error' && (
              <p className="text-xs text-red-400 mt-2" role="alert">{message}</p>
            )}

            <PrivacyNote className="mt-3" />
          </>
        )}
      </div>
    </div>
  )
}
