'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createIssue, updateIssue } from '@/lib/actions'

interface IssueFormProps {
  initial?: {
    id: string
    number: number
    title: string
    date: string
    published: boolean
  }
}

export function IssueForm({ initial }: IssueFormProps) {
  const router = useRouter()
  const [number, setNumber] = useState(initial?.number || 1)
  const [title, setTitle] = useState(initial?.title || '')
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split('T')[0])
  const [published, setPublished] = useState(initial?.published ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (initial) {
        await updateIssue(initial.id, { number, title, date, published })
      } else {
        await createIssue({ number, title, date })
      }
      router.push('/admin/numeros')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en desar el número')
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
          onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
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
          onChange={(e) => setTitle(e.target.value)}
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
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
          required
        />
      </div>

      {initial && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-red-500"
          />
          <label htmlFor="published" className="text-sm text-gray-400">
            Publicat (visible al web)
          </label>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-900 px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Desant...' : initial ? 'Actualitzar' : 'Crear número'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-700 text-gray-400 text-sm uppercase tracking-wider
            hover:border-gray-500 transition-colors"
        >
          Cancel·lar
        </button>
      </div>
    </form>
  )
}
