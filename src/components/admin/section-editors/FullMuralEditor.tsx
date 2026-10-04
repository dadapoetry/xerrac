'use client'

interface Props {
  collages: Array<{ image: string; description: string }>
  onUpdateArrayItem: (field: string, index: number, key: string, value: any) => void
  onAddArrayItem: (field: string, template: Record<string, any>) => void
  onRemoveArrayItem: (field: string, index: number) => void
}

export function FullMuralEditor({ collages, onUpdateArrayItem, onAddArrayItem, onRemoveArrayItem }: Props) {
  return (
    <div className="space-y-4">
      {(collages || []).map((item, i) => (
        <div key={i} className="p-4 border border-gray-700 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Collage #{i + 1}</span>
            <button type="button" onClick={() => onRemoveArrayItem('collages', i)}
              className="text-xs text-red-500">Eliminar</button>
          </div>
          <label htmlFor={`mural-image-${i}`} className="block text-xs text-gray-500 mb-1">
            URL de la imatge
          </label>
          <input
            id={`mural-image-${i}`}
            type="text" value={item.image || ''}
            onChange={(e) => onUpdateArrayItem('collages', i, 'image', e.target.value)}
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
          <label htmlFor={`mural-desc-${i}`} className="block text-xs text-gray-500 mt-3 mb-1">
            Descripció
          </label>
          <textarea
            id={`mural-desc-${i}`}
            value={item.description || ''}
            onChange={(e) => onUpdateArrayItem('collages', i, 'description', e.target.value)}
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            rows={2}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAddArrayItem('collages', { image: '', description: '' })}
        className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
      >
        + Afegir collage
      </button>
    </div>
  )
}
