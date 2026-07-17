'use client'

import { RichTextEditor } from '@/components/RichTextEditor'

interface FaduEntry {
  type: string
  title: string
  body: string
}

interface Props {
  entries: FaduEntry[]
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function FaduEditor({ entries, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">Entrades del Fadu Català (biografies apòcrifes, ucronies)</p>
      {(entries || []).map((entry, i) => (
        <div key={i} className="p-4 border border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Entrada #{i + 1}</span>
            <button
              type="button"
              onClick={() => onRemoveArrayItem('entries', i)}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Eliminar
            </button>
          </div>
          <select
            value={entry.type || 'biography'}
            onChange={(e) => onUpdateArrayItem('entries', i, 'type', e.target.value)}
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          >
            <option value="biography">Biografia apòcrifa</option>
            <option value="ucronia">Ucronia</option>
            <option value="character">Personatge inventat</option>
          </select>
          <input
            type="text"
            value={entry.title || ''}
            onChange={(e) => onUpdateArrayItem('entries', i, 'title', e.target.value)}
            placeholder="Títol"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cos (HTML)</label>
            <RichTextEditor
              value={entry.body || ''}
              onChange={(v) => onUpdateArrayItem('entries', i, 'body', v)}
              minimal
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAddArrayItem('entries', { type: 'biography', title: '', body: '' })}
        className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
      >
        + Afegir entrada
      </button>
    </div>
  )
}
