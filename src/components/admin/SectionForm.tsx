'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSection, updateSection } from '@/lib/actions'
import { SECTION_TYPES, SECTION_LABELS, SectionData } from '@/types'
import { SectionContentEditor } from './SectionContentEditor'
import dynamic from 'next/dynamic'

interface SectionFormProps {
  issueId: string
  initial?: SectionData
  nextOrder: number
}

export function SectionForm({ issueId, initial, nextOrder }: SectionFormProps) {
  const router = useRouter()
  const [type, setType] = useState(initial?.type || SECTION_TYPES[0])
  const [title, setTitle] = useState(initial?.title || '')
  const [order, setOrder] = useState(initial?.order ?? nextOrder)
  const [bgImage, setBgImage] = useState(initial?.backgroundImage || '')
  const [content, setContent] = useState<string>(
    initial ? JSON.stringify(initial.content) : '{}'
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (initial) {
        await updateSection(initial.id, {
          title,
          type,
          order,
          content,
          backgroundImage: bgImage,
        })
      } else {
        await createSection({
          issueId,
          type,
          order,
          title,
          content,
          backgroundImage: bgImage,
        })
      }
      router.push(`/admin/numeros/${issueId}`)
      router.refresh()
    } catch (error) {
      alert('Error en desar la secció')
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
            onChange={(e) => setType(e.target.value)}
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
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
              text-sm focus:outline-none focus:border-red-500 transition-colors"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Títol de la secció
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          onChange={(e) => setBgImage(e.target.value)}
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
            onChange={setContent}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Desant...' : initial ? 'Actualitzar secció' : 'Crear secció'}
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
