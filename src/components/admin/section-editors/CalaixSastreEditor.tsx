'use client'

import { RichTextEditor } from '@/components/RichTextEditor'

interface Props {
  data: Record<string, any>
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function CalaixSastreEditor({ data, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs uppercase text-gray-500 mb-4">Entrevistes</h4>
        {(data.interviews || []).map((item: any, i: number) => (
          <div key={i} className="p-4 border border-gray-700 mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Entrevista #{i + 1}</span>
              <button type="button" onClick={() => onRemoveArrayItem('interviews', i)}
                className="text-xs text-red-500">Eliminar</button>
            </div>
            <input
              type="text" value={item.subject || ''}
              onChange={(e) => onUpdateArrayItem('interviews', i, 'subject', e.target.value)}
              placeholder="Tema / Persona entrevistada"
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            />
            <RichTextEditor
              value={item.body || ''}
              onChange={(v) => onUpdateArrayItem('interviews', i, 'body', v)}
              minimal
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAddArrayItem('interviews', { subject: '', body: '' })}
          className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
        >
          + Afegir entrevista
        </button>
      </div>

      <div>
        <h4 className="text-xs uppercase text-gray-500 mb-4">Crítiques</h4>
        {(data.reviews || []).map((item: any, i: number) => (
          <div key={i} className="p-4 border border-gray-700 mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Crítica #{i + 1}</span>
              <button type="button" onClick={() => onRemoveArrayItem('reviews', i)}
                className="text-xs text-red-500">Eliminar</button>
            </div>
            <input
              type="text" value={item.title || ''}
              onChange={(e) => onUpdateArrayItem('reviews', i, 'title', e.target.value)}
              placeholder="Títol de l'obra ressenyada"
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            />
            <RichTextEditor
              value={item.body || ''}
              onChange={(v) => onUpdateArrayItem('reviews', i, 'body', v)}
              minimal
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAddArrayItem('reviews', { title: '', body: '' })}
          className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
        >
          + Afegir crítica
        </button>
      </div>

      <div>
        <h4 className="text-xs uppercase text-gray-500 mb-4">Investigació</h4>
        {(data.investigacio || []).map((item: any, i: number) => (
          <div key={i} className="p-4 border border-gray-700 mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Investigació #{i + 1}</span>
              <button type="button" onClick={() => onRemoveArrayItem('investigacio', i)}
                className="text-xs text-red-500">Eliminar</button>
            </div>
            <input
              type="text" value={item.title || ''}
              onChange={(e) => onUpdateArrayItem('investigacio', i, 'title', e.target.value)}
              placeholder="Títol de la investigació"
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            />
            <RichTextEditor
              value={item.body || ''}
              onChange={(v) => onUpdateArrayItem('investigacio', i, 'body', v)}
              minimal
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAddArrayItem('investigacio', { title: '', body: '' })}
          className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
        >
          + Afegir investigació
        </button>
      </div>
    </div>
  )
}
