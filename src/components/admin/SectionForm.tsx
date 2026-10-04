'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSection, updateSection } from '@/lib/actions'
import { SECTION_TYPES, SECTION_LABELS, SectionData } from '@/types'
import { SectionContentEditor } from './SectionContentEditor'
import { CloudinaryUploadButton } from './CloudinaryUploadButton'
import { useToast } from './Toast'
import { useUnsavedGuard } from './UnsavedGuard'
import { SectionPreview } from './SectionPreview'

interface SectionFormProps {
  issueId: string
  initial?: SectionData
  nextOrder: number
}

export function SectionForm({ issueId, initial, nextOrder }: SectionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { setDirty: setGuardDirty, guardLeave } = useUnsavedGuard()
  const [type, setType] = useState(initial?.type || SECTION_TYPES[0])
  const [title, setTitle] = useState(initial?.title || '')
  const [order] = useState(initial?.order ?? nextOrder)
  const [bgImage, setBgImage] = useState(initial?.backgroundImage || '')
  const [bgImageMobile, setBgImageMobile] = useState(initial?.backgroundImageMobile || '')
  const [content, setContent] = useState<string>(
    initial ? JSON.stringify(initial.content) : '{}'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const markDirty = useCallback(() => setDirty(true), [])

  // L'editor reenvia el contingut i el flag "dirty" es pot activar sol. Després
  // de desar, doncs, el banner només ha de sortir si el text ha tornat a
  // canviar de veritat respecte del que hem desat.
  const savedContentRef = useRef<string | null>(initial ? JSON.stringify(initial.content) : null)

  // En muntar, Quill emet un text-change en normalitzar l'HTML que arriba del
  // servidor. No és un canvi de l'usuari, però arriba per on arriba i arriba
  // sol: si el prenem com a canvi, el banner ja hi és quan obres la pàgina. El
  // primer valor que rep l'editor sense que l'usuari hagi tocat res es pren com
  // a base; en qualsevol altre cas és un canvi de debò.
  const editorBaselineRef = useRef(true)

  useEffect(() => { setGuardDirty(dirty) }, [dirty, setGuardDirty])

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
          backgroundImageMobile: bgImageMobile,
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
          backgroundImageMobile: bgImageMobile,
        })
        toast('Secció creada', 'success')
      }
      setDirty(false)
      savedContentRef.current = content
      if (!initial) {
        router.push(`/admin/numeros/${issueId}`)
        router.refresh()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en desar la secció'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 max-w-3xl">
        <p className="text-xs text-gray-600">
          Previsualització en viu: el que veus és el que quedarà desat, sense haver-ho publicat.
        </p>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          aria-pressed={showPreview}
          className={`text-xs uppercase tracking-wider px-3 py-2 border transition-colors flex-shrink-0
            ${showPreview
              ? 'border-red-500 text-red-400 bg-red-950/20'
              : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}
        >
          {showPreview ? 'Amagar previsualització' : 'Previsualitzar'}
        </button>
      </div>

      <div className={showPreview ? 'grid grid-cols-1 xl:grid-cols-2 gap-8 items-start' : ''}>
      <form onSubmit={handleSubmit} onPointerDown={() => { editorBaselineRef.current = false }} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="section-type" className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Tipus de secció
          </label>
          <select
            id="section-type"
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
          <label htmlFor="section-order" className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Ordre
          </label>
          <input
            id="section-order"
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
        <label htmlFor="section-title" className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Títol de la secció
        </label>
        <input
          id="section-title"
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty() }}
          className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>

      {type !== 'scrolly' && (
        <>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="section-bg" className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            URL de la imatge de fons
          </label>
          <CloudinaryUploadButton
            onUploaded={(url) => { setBgImage(url); markDirty() }}
            label="pujar"
            transforms="f_auto,q_auto,w_2560"
            overwriteFrom={bgImage}
          />
        </div>
        <div className="flex gap-3">
          {bgImage && (
            <img
              src={bgImage}
              alt=""
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
              className="w-24 h-24 object-cover border border-gray-700 flex-shrink-0"
            />
          )}
          <input
            id="section-bg"
            type="text"
            value={bgImage}
            onChange={(e) => { setBgImage(e.target.value); markDirty() }}
            placeholder="/uploads/imatge.jpg"
            className="flex-1 min-w-0 bg-gray-900 border border-gray-700 px-4 py-2 text-white
              text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
        </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="section-bg-mobile" className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Imatge de fons en mòbil (opcional) · 1080×2400
          </label>
          <CloudinaryUploadButton
            onUploaded={(url) => { setBgImageMobile(url); markDirty() }}
            label="pujar"
            transforms="f_auto,q_auto,w_1080"
            overwriteFrom={bgImageMobile}
          />
        </div>
        <div className="flex gap-3">
          {bgImageMobile && (
            <img
              src={bgImageMobile}
              alt=""
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
              className="w-24 h-24 object-cover border border-gray-700 flex-shrink-0"
            />
          )}
          <input
            id="section-bg-mobile"
            type="text"
            value={bgImageMobile}
            onChange={(e) => { setBgImageMobile(e.target.value); markDirty() }}
            placeholder="Deixa-ho buit per reutilitzar la imatge d'escriptori"
            className="flex-1 min-w-0 bg-gray-900 border border-gray-700 px-4 py-2 text-white
              text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <p className="text-[10px] text-gray-600 mt-1">
          Recomanat 1080×2400 px (20:9). Si es deixa buit, el mòbil retalla la imatge d'escriptori.
        </p>
      </div>
      </>
      )}

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
          Contingut
        </label>
        <div className="border border-gray-700 bg-gray-900 p-4">
          <SectionContentEditor
            type={type}
            content={content}
            onChange={(v) => {
              setContent(v)
              if (editorBaselineRef.current) {
                editorBaselineRef.current = false
                savedContentRef.current = v
                return
              }
              if (v !== savedContentRef.current) markDirty()
            }}
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
          onClick={() => guardLeave(() => router.back())}
          className="px-6 py-3 border border-gray-700 text-gray-400 text-sm uppercase tracking-wider
            hover:border-gray-500 transition-colors"
        >
          Cancel·lar
        </button>
        {dirty && (
          <span className="self-center text-xs text-amber-500/90">
            Canvis no desats ·{' '}
            <span className="hidden sm:inline">Ctrl/Cmd + S per desar</span>
          </span>
        )}
      </div>
    </form>

      {showPreview && (
        <aside className="xl:sticky xl:top-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-500">
              {SECTION_LABELS[type] || type}
            </span>
            <span className="text-[10px] text-gray-700">sense desar</span>
          </div>
          <div className="border border-gray-800 h-[70vh] overflow-y-auto overscroll-contain">
            <SectionPreview
              type={type}
              title={title}
              bgImage={bgImage}
              bgImageMobile={bgImageMobile}
              content={content}
            />
          </div>
          <p className="text-[10px] text-gray-700 mt-2">
            Les mides són les del lloc real; aquí hi ha espai per veure-ho sencer.
          </p>
        </aside>
      )}
      </div>
    </>
  )
}
