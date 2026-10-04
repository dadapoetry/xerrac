'use client'

import { useRef, useCallback, useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type ReactQuillType from 'react-quill'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }) as any

import 'react-quill/dist/quill.snow.css'

import { MAX_UPLOAD_MB, uploadImageToCloudinary } from '@/lib/cloudinary'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  minimal?: boolean
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Sense width/height la imatge ocupa zero alçada fins que carrega i provoca
// un salt de maquetació. Es mesuren abans d'inserir-les.
function readImageSize(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image()
    const finish = (value: { width: number; height: number } | null) => resolve(value)
    const timer = window.setTimeout(() => finish(null), 3000)
    img.onload = () => {
      window.clearTimeout(timer)
      finish(img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : null)
    }
    img.onerror = () => {
      window.clearTimeout(timer)
      finish(null)
    }
    img.src = src
  })
}

export function RichTextEditor({ value, onChange, minimal = false }: RichTextEditorProps) {
  const editorRef = useRef<ReactQuillType | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const caretRef = useRef<Range | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null)
  const [sizeDraft, setSizeDraft] = useState('')
  const [current, setCurrent] = useState(value)
  const lastEmittedRef = useRef(value)

  const handleChange = useCallback((html: string) => {
    lastEmittedRef.current = html
    setCurrent(html)
    onChange(html)
  }, [onChange])

  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value
      setCurrent(value)
    }
  }, [value])

  // Aquest insert no pot retorna silenciosament: el ref travessa next/dynamic
  // (asíncron) i pot arribar buit, i aleshores el diàleg es quedava obert en
  // estat "Pujant..." amb la imatge ja pujada i sense inserir. La imatge va on
  // hi ha el cursor: primer l'API de Quill, que és la que en manté el model i
  // l'historial, i si no hi ha instància, el cursor capturat en obrir el diàleg.
  const insertImage = useCallback(
    (url: string, width: string, alt: string, dims?: { width: number; height: number } | null) => {
      const ref = editorRef.current as any
      const quill = ref?.getEditor?.() || ref
      const maxWidth = width || '100%'
      const sizeAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : ''
      const html = `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}"${sizeAttrs} loading="lazy" decoding="async" style="max-width: ${escapeAttr(maxWidth)}; height: auto;" />`

      if (quill?.clipboard?.dangerouslyPasteHTML) {
        const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
        quill.clipboard.dangerouslyPasteHTML(range.index, html)
      } else {
        const editorEl = rootRef.current?.querySelector('.ql-editor') as HTMLElement | null
        if (!editorEl) throw new Error("No s'ha pogut accedir a l'editor de text.")
        const img = document.createElement('img')
        img.src = url
        img.alt = alt
        img.loading = 'lazy'
        img.decoding = 'async'
        if (dims) {
          img.width = dims.width
          img.height = dims.height
        }
        img.style.maxWidth = maxWidth
        img.style.height = 'auto'
        const caret = caretRef.current
        if (caret && editorEl.contains(caret.startContainer)) {
          caret.deleteContents()
          caret.insertNode(img)
          const after = document.createRange()
          after.setStartAfter(img)
          after.collapse(true)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(after)
        } else {
          editorEl.appendChild(img)
        }
        editorEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
      caretRef.current = null
      setShowImageDialog(false)
    },
    []
  )

  // Canviar la mida de la imatge ja inserida, sense tornar-la a pujar. Quill 1
  // desa width/height com a atributs de l'img; en percentatge es treu l'alçada
  // perquè conservi la proporció, i en píxels es calcula l'alçada corresponent
  // perquè la caixa quedi reservada i l'article no faci un salt.
  const applyImageWidth = useCallback(
    (value: string) => {
      const img = activeImage
      const raw = value.trim()
      if (!img || !raw) return
      const attrs: { width: string; height?: string } = { width: raw }
      const px = Number.parseFloat(raw)
      if (!raw.endsWith('%') && Number.isFinite(px) && px > 0 && img.naturalWidth) {
        attrs.height = String(Math.round((img.naturalHeight * px) / img.naturalWidth))
      }
      const ref = editorRef.current as any
      const quill = ref?.getEditor?.() || ref
      let applied = false
      if (quill?.formatText) {
        const blot = quill.find?.(img)
        const index = typeof blot?.index === 'function' ? blot.index() : null
        if (index != null) {
          quill.formatText({ index, length: 1 }, 'image', attrs, 'user')
          applied = img.getAttribute('width') === raw
        }
      }
      if (!applied) {
        img.setAttribute('width', attrs.width)
        if (attrs.height) img.setAttribute('height', attrs.height)
        else img.removeAttribute('height')
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
        rootRef.current?.querySelector('.ql-editor')?.dispatchEvent(new Event('input', { bubbles: true }))
      }
      setSizeDraft(raw)
    },
    [activeImage]
  )

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const editorEl = rootRef.current?.querySelector('.ql-editor')
    const target = e.target as HTMLElement
    if (!editorEl || !editorEl.contains(target)) return
    const img = target.tagName === 'IMG' ? (target as HTMLImageElement) : null
    setActiveImage(img)
    if (img) setSizeDraft(img.getAttribute('width') || '100%')
  }, [])

  // El cursor s'ha de llegir abans que el diàleg el robi el focus: en obrir-lo
  // es queda capturat i així la imatge aterra on elus estaves escrivint.
  const captureCaret = useCallback(() => {
    const host = rootRef.current
    const sel = window.getSelection()
    if (!host || !sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (host.contains(range.startContainer)) caretRef.current = range.cloneRange()
  }, [])

  const modules = useMemo(() => {
    const cfg = minimal
      ? [['bold', 'italic'], ['clean']]
      : [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link'],
          ['clean'],
        ]
    return { toolbar: cfg }
  }, [minimal])

  return (
    <div ref={rootRef} onClick={handleEditorClick}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Editor de text</span>
        <button
          type="button"
          onMouseDown={captureCaret}
          onClick={() => {
            captureCaret()
            setShowImageDialog(true)
          }}
          className="text-[11px] text-gray-400 hover:text-red-400 transition-colors uppercase tracking-wider"
        >
          + Inserir imatge
        </button>
      </div>

      <ReactQuill
        ref={(el: any) => { editorRef.current = el }}
        value={current}
        onChange={handleChange}
        className="bg-white text-black rounded text-sm"
        theme="snow"
        modules={modules}
      />

      {activeImage && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border border-gray-700 bg-gray-900 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Mida</span>
          {['25%', '50%', '75%', '100%'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyImageWidth(preset)}
              className={`border px-2 py-1 text-xs transition-colors ${
                sizeDraft === preset
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              {preset}
            </button>
          ))}
          <input
            type="text"
            value={sizeDraft}
            onChange={(e) => setSizeDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyImageWidth(sizeDraft)
              }
            }}
            placeholder="50% o 480"
            className="w-24 border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-white focus:border-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => applyImageWidth(sizeDraft)}
            className="border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:border-gray-500 transition-colors"
          >
            Aplicar
          </button>
          <span className="text-[10px] text-gray-500">
            {activeImage.naturalWidth ? `${activeImage.naturalWidth}×${activeImage.naturalHeight} px` : ''}
          </span>
        </div>
      )}

      {showImageDialog && (
        <ImageDialog
          onInsert={insertImage}
          onClose={() => setShowImageDialog(false)}
        />
      )}
    </div>
  )
}

function ImageDialog({ onInsert, onClose }: { onInsert: (url: string, width: string, alt: string, dims?: { width: number; height: number } | null) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'url' | 'file'>('file')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [width, setWidth] = useState('100%')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  // Sense <form>: aquest diàleg viu dins del <form> de SectionForm i els
  // <form> anidats no són HTML vàlid, de manera que el navegador descartava el
  // formulari intern i el botó acabava enviant el formulari de la secció, amb
  // recàrrega de la pàgina i sense pujar res.
  const handleSubmit = async () => {
    if (!url) return
    const dims = await readImageSize(url)
    onInsert(url, width, alt, dims)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setFile(null)
      setStatus('error')
      setErrorMsg('El fitxer no és una imatge (JPG, PNG, WebP o GIF).')
      return
    }
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setFile(null)
      setStatus('error')
      setErrorMsg(`La imatge supera els ${MAX_UPLOAD_MB} MB. Restringeix-la abans.`)
      return
    }
    setFile(f)
    setStatus('idle')
    setErrorMsg('')
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setErrorMsg('')
    const ctrl = new AbortController()
    abortRef.current = ctrl
    let inserted: string
    try {
      inserted = await uploadImageToCloudinary(file, undefined, undefined, ctrl.signal)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : "No s'ha pogut pujar la imatge. Torna-ho a provar.")
      return
    } finally {
      abortRef.current = null
    }
    // La pujada ja ha anat bé: en sortir de 'uploading' sempre, passi el que
    // passi amb la inserció, perquè el diàleg no es quedi penjat.
    setStatus('idle')
    try {
      const dims = await readImageSize(inserted)
      onInsert(inserted, width, alt, dims)
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err instanceof Error
          ? `${err.message} La imatge sí que s'ha pujat: ${inserted}`
          : `La imatge s'ha pujat però no s'ha inserit: ${inserted}`
      )
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-950 border border-gray-800 p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <h3 className="text-white font-bold text-lg mb-4">Inserir imatge</h3>
        <div className="flex gap-2 mb-4">
          {(['file', 'url'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                tab === t
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 border border-gray-700 hover:border-gray-500'
              }`}
            >
              {t === 'file' ? 'Pujar arxiu' : 'URL externa'}
            </button>
          ))}
        </div>
        {tab === 'file' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Arxiu (JPG, PNG, WebP o GIF — fins a {MAX_UPLOAD_MB} MB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-300 file:mr-4 file:px-4 file:py-2 file:bg-gray-800 file:text-gray-200 file:border file:border-gray-700 file:text-sm hover:file:border-gray-500 file:transition-colors"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Si repuges un arxiu amb el mateix nom d'un borrador, la imatge anterior se substitueix amb la mateixa URL.
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Descripció (alt)</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Descripció de la imatge per a accessibilitat"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Amplada màxima</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="100%, 400px, 50%"
              />
            </div>
            {status === 'error' && <p className="text-red-400 text-sm">{errorMsg}</p>}
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-700 text-gray-400 text-sm hover:border-gray-500 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
                className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {status === 'uploading' ? 'Pujant...' : 'Pujar i inserir'}
              </button>
              {status === 'uploading' && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="px-4 py-2 border border-gray-700 text-gray-400 text-sm hover:border-gray-500 transition-colors"
                >
                  Cancel·lar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">URL de la imatge</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="https://exemple.cat/imatge.jpg"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Descripció (alt)</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Descripció de la imatge per a accessibilitat"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Amplada màxima</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="100%, 400px, 50%"
              />
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-700 text-gray-400 text-sm hover:border-gray-500 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Inserir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
