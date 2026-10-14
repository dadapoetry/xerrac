'use client'

import { useRef, useCallback, useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type ReactQuillType from 'react-quill'

import { registerXerracIcon, XERRAC_ICON_BLOT } from '@/components/xerracIconBlot'
import { registerXerracComodi, XERRAC_COMODI_BLOT } from '@/components/xerracComodiBlot'
import { registerXerracRef, XERRAC_REF_BLOT, XERRAC_REF_CLASS } from '@/components/xerracRefBlot'

const ReactQuill = dynamic(
  async () => {
    const mod = await import('react-quill')
    registerXerracIcon((mod.default as any)?.Quill)
    registerXerracComodi((mod.default as any)?.Quill)
    registerXerracRef((mod.default as any)?.Quill)
    return mod.default
  },
  { ssr: false }
) as any

import 'react-quill/dist/quill.snow.css'

import { MAX_UPLOAD_MB, uploadImageToCloudinary } from '@/lib/cloudinary'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  minimal?: boolean
}

const SIZE_BAR_WIDTH = 344
const SIZE_BAR_HEIGHT = 40
const SIZE_PRESETS = ['25%', '50%', '75%', '100%']

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

interface ReferenceFields {
  authors: string
  year: string
  title: string
  source: string
  url: string
}

interface ReferencePiece {
  text: string
  italic?: boolean
  link?: string
}

type ReferenceOp = { insert: string; attributes?: Record<string, unknown> }

// Una referència bibliogràfica es compon de fragments: autors i any, el títol
// (cursiva i, si hi ha URL, enllaç) i la font. Es tracten com a text pla —sense
// HTML— perquè no cal escapar res i Quill els aplica com a formats de caràcter.
function referencePieces(fields: ReferenceFields): ReferencePiece[] {
  const authors = fields.authors.trim()
  const year = fields.year.trim()
  const title = fields.title.trim()
  const source = fields.source.trim()
  const url = fields.url.trim()
  const authorYear = [authors, year ? `(${year})` : ''].filter(Boolean).join(' ')

  const pieces: ReferencePiece[] = []
  if (authorYear) pieces.push({ text: authorYear })
  if (title) pieces.push({ text: title, italic: true, link: url || undefined })
  if (source) pieces.push({ text: source })
  return pieces
}

// Cada fragment de la referència s'acaba amb un punt; el del títol queda fora de
// la cursiva. Com que no hi ha HTML, ningú no hi pot injectar res.
function referenceOps(pieces: ReferencePiece[]): ReferenceOp[] {
  const ops: ReferenceOp[] = []
  pieces.forEach((piece, i) => {
    if (i > 0) ops.push({ insert: ' ' })
    const attributes: Record<string, unknown> = {}
    if (piece.italic) attributes.italic = true
    if (piece.link) attributes.link = piece.link
    ops.push(Object.keys(attributes).length ? { insert: piece.text, attributes } : { insert: piece.text })
    ops.push({ insert: '.' })
  })
  return ops
}

// Camí de reserva si Quill encara no està muntat: construeix el <p> de la
// referència directament al DOM, com fa la inserció d'imatges.
function buildReferenceNode(pieces: ReferencePiece[]): HTMLElement {
  const paragraph = document.createElement('p')
  paragraph.className = XERRAC_REF_CLASS
  pieces.forEach((piece, i) => {
    if (i > 0) paragraph.appendChild(document.createTextNode(' '))
    if (piece.italic || piece.link) {
      const em = document.createElement('em')
      em.textContent = piece.text
      if (piece.link) {
        const anchor = document.createElement('a')
        anchor.href = piece.link
        anchor.rel = 'noopener noreferrer'
        anchor.appendChild(em)
        paragraph.appendChild(anchor)
      } else {
        paragraph.appendChild(em)
      }
    } else {
      paragraph.appendChild(document.createTextNode(piece.text))
    }
    paragraph.appendChild(document.createTextNode('.'))
  })
  return paragraph
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
  // Índex del cursor segons el model de Quill, capturat mentre l'editor encara
  // té el focus. És el que fa que la referència caiga on escrivies i no al final.
  const caretIndexRef = useRef<number | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showRefDialog, setShowRefDialog] = useState(false)
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null)
  const [sizeDraft, setSizeDraft] = useState('')
  const [sizeBar, setSizeBar] = useState<{ top: number; left: number; below: boolean } | null>(null)
  const [current, setCurrent] = useState(value)
  const lastEmittedRef = useRef(value)

  const handleChange = useCallback((html: string) => {
    if (html === lastEmittedRef.current) return
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

  // Insereix una referència com a bloc propi, exactament on tenies el cursor.
  // El bloc es crea amb un salt de línia al davant: sense això, Quill fusiona la
  // referència amb la línia on escrivies i el text queda descol·locat. L'atribut
  // de bloc `referencia` viatja al salt de línia final, que és on Quill desa els
  // formats de línia.
  const insertReference = useCallback((fields: ReferenceFields) => {
    const pieces = referencePieces(fields)
    const ref = editorRef.current as any
    const quill = ref?.getEditor?.() || ref

    if (pieces.length && quill?.updateContents && quill?.getLength) {
      const ops = referenceOps(pieces)
      const textLength = ops.reduce((total, op) => total + op.insert.length, 0)
      const length = quill.getLength()
      const rawIndex = caretIndexRef.current ?? quill.getSelection()?.index ?? length
      const index = Math.max(0, Math.min(rawIndex, length))

      // Col·locació: el bloc ha de quedar sencer. Si hi ha text abans del cursor
      // a la mateixa línia, cal trencar-la; si el cursor ja obre línia, no. I si
      // el cursor és damunt d'un salt de línia, esborrem aquest salt perquè no
      // quedi una línia buida de més.
      const prevChar = index > 0 ? quill.getText(index - 1, 1) : '\n'
      const currentChar = index < length ? quill.getText(index, 1) : ''
      const atLineStart = index === 0 || prevChar === '\n'
      const atNewline = currentChar === '\n'

      const delta: { retain?: number; insert?: string; delete?: number; attributes?: Record<string, unknown> }[] = []
      if (index > 0) delta.push({ retain: index })
      if (!atLineStart) delta.push({ insert: '\n' })
      delta.push(...ops)
      delta.push({ insert: '\n', attributes: { [XERRAC_REF_BLOT]: true } })
      if (atNewline) delta.push({ delete: 1 })
      quill.updateContents(delta, 'user')
      quill.setSelection(Math.min(index + (atLineStart ? 0 : 1) + textLength + 1, quill.getLength()), 0, 'silent')
    } else if (pieces.length) {
      const editorEl = rootRef.current?.querySelector('.ql-editor') as HTMLElement | null
      if (editorEl) {
        editorEl.appendChild(buildReferenceNode(pieces))
        editorEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
    caretRef.current = null
    caretIndexRef.current = null
    setShowRefDialog(false)
  }, [])

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

  // La barra flota al costat de la imatge i la segueix quan es mou l'editor.
  // Si no hi ha espai a dalt, es posa a sota; si la imatge surt de l'editor,
  // amaga.
  useEffect(() => {
    if (!activeImage) {
      setSizeBar(null)
      return
    }
    const reposition = () => {
      const host = rootRef.current
      if (!host || !host.contains(activeImage)) {
        setSizeBar(null)
        return
      }
      const imgRect = activeImage.getBoundingClientRect()
      const hostRect = host.getBoundingClientRect()
      if (imgRect.width === 0 && imgRect.height === 0) {
        setSizeBar(null)
        return
      }
      const left = Math.max(
        8,
        Math.min(
          imgRect.left - hostRect.left + imgRect.width / 2 - SIZE_BAR_WIDTH / 2,
          hostRect.width - SIZE_BAR_WIDTH - 8
        )
      )
      const above = imgRect.top - hostRect.top - SIZE_BAR_HEIGHT - 10
      const below = above < 0
      const top = below ? imgRect.bottom - hostRect.top + 10 : above
      setSizeBar((prev) =>
        prev && Math.abs(prev.top - top) < 1 && Math.abs(prev.left - left) < 1 && prev.below === below
          ? prev
          : { top, left, below }
      )
    }
    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [activeImage, current])

  // El cursor s'ha de llegir abans que el diàleg el robi el focus: en obrir-lo
  // es queda capturat i així la imatge aterra on elus estaves escrivint.
  const captureCaret = useCallback(() => {
    const host = rootRef.current
    const sel = window.getSelection()
    if (!host || !sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (host.contains(range.startContainer)) {
      caretRef.current = range.cloneRange()
      const quill = (editorRef.current as any)?.getEditor?.()
      const quillRange = quill?.getSelection?.()
      if (quillRange) caretIndexRef.current = quillRange.index + quillRange.length
    }
  }, [])

  // Insereix el logo de Xerrac com a objecte inline (no una imatge). Va on hi ha
  // el cursor i es desa com a <span class="xerrac-mark">, igual que una emoticona.
  // Quill crida el handler amb `this` = toolbar, que exposa `this.quill`; és la
  // via fiable perquè el ref travessa next/dynamic i pot arribar buit.
  const insertXerracIcon = useCallback(function (this: any) {
    const quill = this?.quill || (editorRef.current as any)?.getEditor?.()
    if (!quill?.insertEmbed) return
    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
    quill.insertEmbed(range.index, XERRAC_ICON_BLOT, true, 'user')
    quill.setSelection(range.index + 1, 0, 'user')
  }, [])

  // Marca (o desmarca) el text seleccionat com a "mot comodí": és un format
  // inline de Quill, així que s'aplica a la selecció com el negreta. Si no hi
  // ha selecció, s'agafa la paraula que hi ha sota el cursor, perquè marcar un
  // mot amb un clic sigui possible. El handler rep `value` del toolbar: true si
  // el botó no estava actiu (marcar) i false si ja ho estava (treure la marca).
  const toggleComodi = useCallback(function (this: any, value: boolean) {
    const quill = this?.quill || (editorRef.current as any)?.getEditor?.()
    if (!quill?.format || !quill.getSelection) return
    let range = quill.getSelection(true)
    if (!range) return
    if (range.length === 0) {
      const text: string = quill.getText()
      const isWordChar = (ch: string) => /[0-9A-Za-zÀ-ÿ·'’-]/.test(ch)
      let start = range.index
      let end = range.index
      while (start > 0 && isWordChar(text[start - 1])) start -= 1
      while (end < text.length && isWordChar(text[end])) end += 1
      if (end > start) {
        range = { index: start, length: end - start }
        quill.setSelection(start, end - start, 'silent')
      }
    }
    if (range.length === 0) return
    quill.format(XERRAC_COMODI_BLOT, value !== false, 'user')
  }, [])

  // El botó de referències viu a la barra de format (que queda sticky). Captura
  // el cursor abans d'obrir el diàleg: així la referència cau on escrivies i no
  // al final del text.
  const openReferenceDialog = useCallback(function (this: any) {
    const quill = this?.quill || (editorRef.current as any)?.getEditor?.()
    const range = quill?.getSelection?.(true)
    if (range) caretIndexRef.current = range.index + range.length
    setShowRefDialog(true)
  }, [])

  const modules = useMemo(() => {
    const cfg = minimal
      ? [['bold', 'italic', 'xerrac', 'comodi'], ['clean']]
      : [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'xerrac', 'comodi'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'referencia'],
          ['clean'],
        ]
    return {
      toolbar: {
        container: cfg,
        handlers: { xerrac: insertXerracIcon, comodi: toggleComodi, referencia: openReferenceDialog },
      },
    }
  }, [minimal, insertXerracIcon, toggleComodi, openReferenceDialog])

  // En enganxar, Quill fa focus() sobre l'àrea editable i el navegador
  // arrossega la pàgina fins a mostrar l'editor sencer (és a dir, cap a dalt).
  // Quill només desa i restaura el scroll del seu `scrollingContainer`, que per
  // omissió és el mateix editor —un element que no fa scroll—, de manera que el
  // salt acaba afectant la finestra. Si li passem l'element que sí que fa scroll
  // a la pàgina, Quill desa i restaura la posició de la vista i l'enganxada no
  // mou la pàgina.
  const scrollingContainer = useMemo(
    () =>
      typeof document !== 'undefined'
        ? document.scrollingElement || document.documentElement
        : undefined,
    []
  )

  return (
    <div ref={rootRef} onClick={handleEditorClick} className="relative editor-shell">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Editor de text</span>
        <div className="flex items-center gap-3">
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
      </div>

      <ReactQuill
        ref={(el: any) => { editorRef.current = el }}
        value={current}
        onChange={handleChange}
        className="bg-white text-black rounded text-sm"
        theme="snow"
        modules={modules}
        scrollingContainer={scrollingContainer}
      />

      {activeImage && sizeBar && (
        <div
          className="absolute z-50 select-none rounded border border-gray-700 bg-gray-900/95 px-2 py-1.5 shadow-xl backdrop-blur"
          style={{
            top: sizeBar.top,
            left: sizeBar.left,
            width: SIZE_BAR_WIDTH,
          }}
        >
          <div className="flex items-center gap-1">
            <span className="mr-0.5 text-[9px] uppercase tracking-wider text-gray-500">Mida</span>
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyImageWidth(preset)}
                className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${
                  sizeDraft === preset
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
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
                } else if (e.key === 'Escape') {
                  setActiveImage(null)
                }
              }}
              placeholder="50% o 480"
              className="w-16 rounded border border-gray-700 bg-gray-950 px-1.5 py-0.5 text-[11px] text-white focus:border-red-500 focus:outline-none"
            />
            {activeImage.naturalWidth > 0 && (
              <span className="ml-auto whitespace-nowrap text-[9px] text-gray-500">
                {activeImage.naturalWidth}×{activeImage.naturalHeight}
              </span>
            )}
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              aria-label="Tancar la barra de mida"
              className="ml-1 text-[11px] leading-none text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showImageDialog && (
        <ImageDialog
          onInsert={insertImage}
          onClose={() => setShowImageDialog(false)}
        />
      )}

      {showRefDialog && (
        <ReferenceDialog
          onInsert={insertReference}
          onClose={() => setShowRefDialog(false)}
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

function ReferenceDialog({ onInsert, onClose }: { onInsert: (fields: ReferenceFields) => void; onClose: () => void }) {
  const [authors, setAuthors] = useState('')
  const [year, setYear] = useState('')
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')

  // Sense <form>, com el diàleg d'imatge: els <form> anidats dins el formulari
  // de la secció no són HTML vàlid.
  const submit = () => {
    if (!authors.trim() && !title.trim()) return
    onInsert({ authors, year, title, source, url })
  }

  const inputClass =
    'w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors'
  const labelClass = 'block text-xs uppercase tracking-wider text-gray-400 mb-2'

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-950 border border-gray-800 p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <h3 className="text-white font-bold text-lg mb-1">Inserir referència</h3>
        <p className="text-[11px] text-gray-500 mb-4">
          El títol queda clicable si hi poses una URL. La referència s&rsquo;insereix com un bloc de fonts.
        </p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Autor/s</label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className={inputClass}
                placeholder="Cognom, X."
                autoFocus
              />
            </div>
            <div className="w-24">
              <label className={labelClass}>Any</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputClass}
                placeholder="2020"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Títol</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Títol de l'obra o article"
            />
          </div>
          <div>
            <label className={labelClass}>Editorial / publicació (opcional)</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={inputClass}
              placeholder="Editorial o revista"
            />
          </div>
          <div>
            <label className={labelClass}>URL (opcional)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              className={inputClass}
              placeholder="https://…"
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
            type="button"
            onClick={submit}
            disabled={!authors.trim() && !title.trim()}
            className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Inserir
          </button>
        </div>
      </div>
    </div>
  )
}
