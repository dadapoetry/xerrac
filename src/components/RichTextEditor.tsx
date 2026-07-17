'use client'

import { useRef, useCallback, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type ReactQuillType from 'react-quill'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }) as any

import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  minimal?: boolean
}

export function RichTextEditor({ value, onChange, minimal = false }: RichTextEditorProps) {
  const editorRef = useRef<ReactQuillType | null>(null)
  const [imageDialog, setImageDialog] = useState(false)
  const pendingRangeRef = useRef<any>(null)

  const imageHandler = useCallback(() => {
    const editor = editorRef.current as any
    if (!editor) return
    const quill = editor.getEditor?.() || editor
    const range = quill.getSelection()
    pendingRangeRef.current = range || { index: quill.getLength() || 0, length: 0 }
    setImageDialog(true)
  }, [])

  const insertImage = useCallback((url: string, width: string) => {
    const editor = editorRef.current as any
    if (!editor) return
    const quill = editor.getEditor?.() || editor
    const range = pendingRangeRef.current
    if (!range) {
      setImageDialog(false)
      return
    }
    quill.focus()
    quill.setSelection(range)
    quill.clipboard.dangerouslyPasteHTML(
      range.index,
      `<img src="${url}" style="max-width: ${width || '100%'}; height: auto;" />`
    )
    setImageDialog(false)
    pendingRangeRef.current = null
  }, [])

  const modules = useMemo(() => {
    const cfg = minimal
      ? [['bold', 'italic', 'image'], ['clean']]
      : [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ]
    return {
      toolbar: {
        container: cfg,
        handlers: { image: imageHandler },
      },
    }
  }, [minimal, imageHandler])

  return (
    <div>
      <ReactQuill
        ref={(el: any) => { editorRef.current = el }}
        value={value}
        onChange={onChange}
        className="bg-white text-black rounded text-sm"
        theme="snow"
        modules={modules}
      />

      {imageDialog && (
        <ImageDialog
          onInsert={insertImage}
          onClose={() => { setImageDialog(false); pendingRangeRef.current = null }}
        />
      )}
    </div>
  )
}

function ImageDialog({ onInsert, onClose }: { onInsert: (url: string, width: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('')
  const [width, setWidth] = useState('100%')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    onInsert(url, width)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-950 border border-gray-800 p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <h3 className="text-white font-bold text-lg mb-4">Inserir imatge</h3>
        <div className="space-y-4">
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
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Amplada màxima</label>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              placeholder="100%, 400px, 50%"
            />
          </div>
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
    </div>
  )
}
