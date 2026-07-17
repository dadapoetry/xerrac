'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createIssue, updateIssue } from '@/lib/actions'
import { useToast } from './Toast'

interface IssueFormProps {
  initial?: {
    id: string
    number: number
    title: string
    date: string
    published: boolean
    accentColor?: string
  }
  nextNumber?: number
}

export function IssueForm({ initial, nextNumber }: IssueFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [number, setNumber] = useState(initial?.number || nextNumber || 1)
  const [title, setTitle] = useState(initial?.title || '')
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split('T')[0])
  const [published, setPublished] = useState(initial?.published ?? false)
  const [accentColor, setAccentColor] = useState(initial?.accentColor || '#ef4444')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)

  const markDirty = useCallback(() => setDirty(true), [])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        document.getElementById('issue-form-submit')?.click()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (initial) {
        await updateIssue(initial.id, { number, title, date, published, accentColor })
        toast('Número actualitzat', 'success')
      } else {
        await createIssue({ number, title, date })
        toast('Número creat', 'success')
      }
      setDirty(false)
      router.push('/admin/numeros')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en desar el número'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Número
        </label>
        <input
          type="number"
          value={number}
          onChange={(e) => { setNumber(parseInt(e.target.value) || 0); markDirty() }}
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
          required
          min="1"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Títol
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty() }}
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Data de publicació
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); markDirty() }}
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
          required
        />
      </div>

      {initial && (
        <>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
              Color d'accent
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => { setAccentColor(e.target.value); markDirty() }}
                className="w-10 h-10 border border-gray-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => { setAccentColor(e.target.value); markDirty() }}
                className="w-28 bg-gray-900 border border-gray-700 px-3 py-2 text-white
                  text-sm font-mono focus:outline-none focus:border-gray-500 transition-colors"
              />
              <span
                className="w-6 h-6 rounded-full border border-gray-700"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => { setPublished(e.target.checked); markDirty() }}
              className="accent-red-500"
            />
            <label htmlFor="published" className="text-sm text-gray-400">
              Publicat (visible al web)
            </label>
          </div>
        </>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-900 px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          id="issue-form-submit"
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Desant...' : initial ? 'Actualitzar' : 'Crear número'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (dirty && !confirm('Tens canvis no desats. Vols sortir de totes maneres?')) return
            router.back()
          }}
          className="px-6 py-3 border border-gray-700 text-gray-400 text-sm uppercase tracking-wider
            hover:border-gray-500 transition-colors"
        >
          Cancel·lar
        </button>
      </div>
    </form>
  )
}
