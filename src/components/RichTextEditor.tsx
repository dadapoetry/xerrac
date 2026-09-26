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

export function RichTextEditor({ value, onChange, minimal = false }: RichTextEditorProps) {
  const editorRef = useRef<ReactQuillType | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
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

  const insertImage = useCallback((url: string, width: string, alt: string) => {
    const editor = editorRef.current as any
    if (!editor) return
    const quill = editor.getEditor?.() || editor
    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
    quill.clipboard.dangerouslyPasteHTML(
      range.index,
      `<img src="${url}" alt="${alt}" loading="lazy" style="max-width: ${width || '100%'}; height: auto;" />`
    )
    setShowImageDialog(false)
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
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Editor de text</span>
        <button
          type="button"
          onClick={() => setShowImageDialog(true)}
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

      {showImageDialog && (
        <ImageDialog
          onInsert={insertImage}
          onClose={() => setShowImageDialog(false)}
        />
      )}
    </div>
  )
}

function ImageDialog({ onInsert, onClose }: { onInsert: (url: string, width: string, alt: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'url' | 'file'>('file')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [width, setWidth] = useState('100%')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    onInsert(url, width, alt)
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setStatus('uploading')
    setErrorMsg('')
    try {
      const inserted = await uploadImageToCloudinary(file)
      onInsert(inserted, width, alt)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : "No s'ha pogut pujar la imatge. Torna-ho a provar.")
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
          <form onSubmit={handleUpload} className="space-y-4">
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
                type="submit"
                disabled={!file || status === 'uploading'}
                className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {status === 'uploading' ? 'Pujant...' : 'Pujar i inserir'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">URL de la imatge</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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
                type="submit"
                className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Inserir
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
