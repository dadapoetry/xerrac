'use client'

import { useRef, useCallback, useState } from 'react'
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

  const imageHandler = useCallback(() => {
    const url = prompt('URL de la imatge:')
    if (!url) return

    const width = prompt('Amplada màxima (ex: 100%, 400px, 50%):', '100%')
    if (width === null) return

    const editor = editorRef.current as any
    if (!editor) return

    const quill = editor.getEditor?.() || editor
    const range = quill.getSelection(true)
    quill.clipboard.dangerouslyPasteHTML(
      range.index,
      `<img src="${url}" style="max-width: ${width || '100%'}; height: auto;" />`
    )
  }, [])

  const modules = minimal
    ? {
        toolbar: {
          container: [['bold', 'italic', 'image'], ['clean']],
          handlers: { image: imageHandler },
        },
      }
    : {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'link', 'image'],
            ['clean'],
          ],
          handlers: { image: imageHandler },
        },
      }

  return (
    <ReactQuill
      ref={(el: any) => { editorRef.current = el }}
      value={value}
      onChange={onChange}
      className="bg-white text-black rounded text-sm"
      theme="snow"
      modules={modules}
    />
  )
}
