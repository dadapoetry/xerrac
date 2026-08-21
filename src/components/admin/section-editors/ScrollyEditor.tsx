'use client'

import { RichTextEditor } from '@/components/RichTextEditor'

interface ScrollyStep {
  media?: string
  caption?: string
  text: string
}

interface Props {
  steps: ScrollyStep[]
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function ScrollyEditor({ steps, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-4">
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
        onClick={() => onAddArrayItem('steps', { media: '', caption: '', text: '' })}
        className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
      >
        + Afegir escena
      </button>
    </div>
  )
}
