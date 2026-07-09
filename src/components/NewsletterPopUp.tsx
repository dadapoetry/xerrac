'use client'

import { useState, useEffect, useRef } from 'react'
import { subscribe } from '@/lib/actions'

const STORAGE_KEY = 'xerrac-newsletter-dismissed'

export function NewsletterPopUp({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [dismissed, setDismissed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (visible && !dismissed) {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored === '1') setDismissed(true)
    }
  }, [visible, dismissed])

  useEffect(() => {
    if (visible && !dismissed && status === 'idle') {
      const timer = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(timer)
    }
  }, [visible, dismissed, status])

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss()
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const result = await subscribe(email.trim())
      setStatus('success')
      setMessage(result.message)
      handleDismiss()
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'Error en subscriure\'t')
    }
  }

  if (!visible || dismissed) return null

  return (
    <div className="absolute top-full right-0 z-50 w-72 animate-fade-in mr-0 mt-0">
      <div className="bg-black border border-red-900/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative">
        <div className="h-[2px] bg-red-600" />
        <div className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
            aria-label="Tancar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>

          <p className="text-sm text-gray-300 mb-3 pr-5 leading-relaxed">
            Encara no t&apos;has subscrit?<br />
            <span className="text-red-400 font-semibold tracking-wide">Aclareix-te</span>!
          </p>

          {status === 'success' ? (
            <p className="text-xs text-green-400">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="El teu correu"
                className="w-full bg-gray-950 border border-gray-800 px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500/60 transition-colors"
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs py-2.5 uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Enviant...' : 'Subscriure\'m'}
              </button>
              {status === 'error' && (
                <p className="text-xs text-red-400">{message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
