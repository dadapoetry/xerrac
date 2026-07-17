'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSection, updateSection } from '@/lib/actions'
import { SECTION_TYPES, SECTION_LABELS, SectionData } from '@/types'
import { SectionContentEditor } from './SectionContentEditor'
import { useToast } from './Toast'

interface SectionFormProps {
  issueId: string
  initial?: SectionData
  nextOrder: number
}

export function SectionForm({ issueId, initial, nextOrder }: SectionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [type, setType] = useState(initial?.type || SECTION_TYPES[0])
  const [title, setTitle] = useState(initial?.title || '')
  const [order] = useState(initial?.order ?? nextOrder)
  const [bgImage, setBgImage] = useState(initial?.backgroundImage || '')
  const [content, setContent] = useState<string>(
    initial ? JSON.stringify(initial.content) : '{}'
  )
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
        document.getElementById('section-form-submit')?.click()
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
        await updateSection(initial.id, {
          title,
          type,
          order,
          content,
          backgroundImage: bgImage,
        })
        toast('Secció actualitzada', 'success')
      } else {
        await createSection({
          issueId,
          type,
          order,
          title,
          content,
          backgroundImage: bgImage,
        })
        toast('Secció creada', 'success')
      }
      setDirty(false)
      router.push(`/admin/numeros/${issueId}`)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en desar la secció'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Tipus de secció
          </label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); markDirty() }}
            className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
              text-sm focus:outline-none focus:border-red-500 transition-colors"
            disabled={!!initial}
          >
            {SECTION_TYPES.map((t) => (
              <option key={t} value={t}>{SECTION_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Ordre
          </label>
          <input
            type="number"
            value={order}
            disabled
            className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
              text-sm focus:outline-none focus:border-red-500 transition-colors opacity-60 cursor-not-allowed"
            min="0"
            title="L'ordre es canvia des de la llista de seccions amb els botons de moure"
          />
          <p className="text-[10px] text-gray-600 mt-1">Canvia l'ordre des de la llista de seccions</p>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Títol de la secció
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty() }}
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          URL de la imatge de fons
        </label>
        <input
          type="text"
          value={bgImage}
          onChange={(e) => { setBgImage(e.target.value); markDirty() }}
          placeholder="/uploads/imatge.jpg"
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
        />
        {bgImage && (
          <div className="mt-2 w-32 h-20 bg-gray-900 rounded overflow-hidden border border-gray-700">
            <img src={bgImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Contingut
        </label>
        <div className="border border-gray-700 bg-gray-900 p-4">
          <SectionContentEditor
            type={type}
            content={content}
            onChange={(v) => { setContent(v); markDirty() }}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-900 px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          id="section-form-submit"
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Desant...' : initial ? 'Actualitzar secció' : 'Crear secció'}
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
