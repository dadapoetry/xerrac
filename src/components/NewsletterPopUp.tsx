'use client'

import { useState, useEffect, useRef } from 'react'
import { SawIcon } from './SawIcon'
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
      setTimeout(() => handleDismiss(), 1500)
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'Error en subscriure\'t')
    }
  }

  if (!visible || dismissed) return null

  return (
    <div className="absolute top-full right-0 z-50 w-72 mt-2 animate-fade-in">
      <div className="bg-black border border-gray-800 rounded overflow-hidden relative">
        <div className="h-[3px] bg-red-600" />
        <div className="p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-5 h-5 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
            aria-label="Tancar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>

          <div className="flex items-center gap-2 mb-3">
            <SawIcon className="w-4 h-4" />
            <span className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase">
              Butlletí
            </span>
            <div className="h-px w-12 bg-red-500/40" />
          </div>

          <p className="text-base font-black tracking-tight text-white leading-tight mb-1">
            Encara no t&apos;has subscrit?
          </p>
          <p className="text-lg font-black tracking-tight text-red-500 leading-none mb-4">
            Aclareix-te!
          </p>

          {status === 'success' ? (
            <p className="text-xs text-green-400">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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
