'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: ToastItem['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

const TOAST_MS = 5000

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const remove = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id)
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, TOAST_MS)
    )
  }, [])

  // Passar el cursor o arribar amb el Tab atura el compte enrere perquè el
  // missatge es pugui llegir i tancar amb Enter o clic.
  const pause = (id: string) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
  }

  const resume = (id: string) => {
    if (timers.current.has(id)) return
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id)
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 2500)
    )
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
        role="region"
        aria-label="Notificacions"
      >
        <div aria-live="polite" aria-atomic="false" className="flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              tabIndex={0}
              onClick={() => remove(t.id)}
              onMouseEnter={() => pause(t.id)}
              onMouseLeave={() => resume(t.id)}
              onFocus={() => pause(t.id)}
              onBlur={() => resume(t.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') remove(t.id) }}
              title="Fes clic per tancar"
              className={`px-4 py-3 text-sm cursor-pointer shadow-lg border transition-all animate-slide-up
                focus:outline-none focus:ring-1 focus:ring-white/40
                ${t.type === 'success' ? 'bg-green-900/90 border-green-700 text-green-200' : ''}
                ${t.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-200' : ''}
                ${t.type === 'info' ? 'bg-gray-900/90 border-gray-700 text-gray-200' : ''}
              `}
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}