'use client'

interface Proverb {
  text: string
  author: string
}

interface Props {
  proverbs: Proverb[]
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function PaginesGroguesEditor({ proverbs, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-4">
      {(proverbs || []).map((proverb, i) => (
        <div key={i} className="p-4 border border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Proverbi #{i + 1}</span>
            <button
              type="button"
              onClick={() => onRemoveArrayItem('proverbs', i)}
              className="text-xs text-red-500"
            >
              Eliminar
            </button>
          </div>
          <textarea
            value={proverb.text || ''}
            onChange={(e) => onUpdateArrayItem('proverbs', i, 'text', e.target.value)}
            placeholder="Text del proverbi"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            rows={2}
          />
          <input
            type="text"
            value={proverb.author || ''}
            onChange={(e) => onUpdateArrayItem('proverbs', i, 'author', e.target.value)}
            placeholder="Autor (inspirat en / adaptat de)"
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAddArrayItem('proverbs', { text: '', author: '' })}
        className="text-sm text-yellow-400 hover:text-yellow-300 border border-dashed border-yellow-900 px-4 py-2 w-full"
      >
        + Afegir proverbi
      </button>
    </div>
  )
}
