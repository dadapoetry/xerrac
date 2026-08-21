'use client'

import { RichTextEditor } from '@/components/RichTextEditor'

interface NecrologicaEntry {
  name: string
  years?: string
  epitaph: string
}

interface Props {
  entries: NecrologicaEntry[]
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function NecrologiquesEditor({ entries, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        La primera necrològica es mostra destacada (obituari principal); la resta, com a esquelles emmarcades.
        Recomanat: col·locar aquesta secció en darrera posició del número.
      </p>
      {(entries || []).map((entry, i) => (
        <div key={i} className="p-4 border border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Necrològica #{i + 1}</span>
            <button
              type="button"
              onClick={() => onRemoveArrayItem('entries', i)}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Eliminar
            </button>
          </div>
          <input
            type="text"
            value={entry.name || ''}
            onChange={(e) => onUpdateArrayItem('entries', i, 'name', e.target.value)}
            placeholder="Nom del concepte (ex.: La concentració)"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
          <input
            type="text"
            value={entry.years || ''}
            onChange={(e) => onUpdateArrayItem('entries', i, 'years', e.target.value)}
            placeholder="Anys (ex.: 1980 — 2026, o ? — 2026)"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm font-mono"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Epitafi (HTML)</label>
            <RichTextEditor
              value={entry.epitaph || ''}
              onChange={(v) => onUpdateArrayItem('entries', i, 'epitaph', v)}
              minimal
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAddArrayItem('entries', { name: '', years: '', epitaph: '' })}
        className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
      >
        + Afegir necrològica
      </button>
    </div>
  )
}
