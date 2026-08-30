'use client'

import { RichTextEditor } from '@/components/RichTextEditor'

interface ScrollyStep {
  media?: string
  caption?: string
  text: string
  title?: string
  position?: 'left' | 'center' | 'right'
  readable?: boolean
}

interface Props {
  steps: ScrollyStep[]
  subtitle: string
  onSubtitleChange: (value: string) => void
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function ScrollyEditor({ steps, subtitle, onSubtitleChange, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={subtitle || ''}
        onChange={(e) => onSubtitleChange(e.target.value)}
        placeholder="Subtítol de la secció (opcional, ex.: Una història per llegir rodant)"
        className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
      />
      <p className="text-xs text-gray-500">
        Escenes de l&apos;assaig visual. A l&apos;escriptori la imatge es queda fixa mentre el text passa;
        cada escena activa canvia la imatge. Si una escena no té imatge, es manté l&apos;anterior.
      </p>
      {(steps || []).map((step, i) => (
        <div key={i} className="p-4 border border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Escena #{i + 1}</span>
            <button
              type="button"
              onClick={() => onRemoveArrayItem('steps', i)}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Eliminar
            </button>
          </div>
          <input
            type="text"
            value={step.title || ''}
            onChange={(e) => onUpdateArrayItem('steps', i, 'title', e.target.value)}
            placeholder="Títol de l'escena (opcional, en lletra Impact)"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm font-display"
          />
          <input
            type="text"
            value={step.media || ''}
            onChange={(e) => onUpdateArrayItem('steps', i, 'media', e.target.value)}
            placeholder="URL de la imatge (opcional)"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
          <input
            type="text"
            value={step.caption || ''}
            onChange={(e) => onUpdateArrayItem('steps', i, 'caption', e.target.value)}
            placeholder="Peu de foto (opcional)"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Posició del text</label>
              <select
                value={step.position || 'left'}
                onChange={(e) => onUpdateArrayItem('steps', i, 'position', e.target.value)}
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              >
                <option value="left">Esquerra</option>
                <option value="center">Centre</option>
                <option value="right">Dreta</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id={`readable-${i}`}
                checked={step.readable !== false}
                onChange={(e) => onUpdateArrayItem('steps', i, 'readable', e.target.checked)}
                className="accent-red-500"
              />
              <label htmlFor={`readable-${i}`} className="text-sm text-gray-400 leading-tight">
                Llegibilitat
                <span className="block text-xs text-gray-600">
                  ombra de text per sobre zones clares
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Text (HTML)</label>
            <RichTextEditor
              value={step.text || ''}
              onChange={(v) => onUpdateArrayItem('steps', i, 'text', v)}
              minimal
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAddArrayItem('steps', { media: '', caption: '', text: '', title: '', position: 'left', readable: true })}
        className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
      >
        + Afegir escena
      </button>
    </div>
  )
}
