'use client'

interface Props {
  topic: string
  onChange: (field: string, value: any) => void
}

export function PortadaEditor({ topic, onChange }: Props) {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <div>
        <label className="block text-xs uppercase text-gray-500 mb-1">Tema / Topic</label>
        <input
          type="text"
          value={topic || ''}
          onChange={(e) => onChange('topic', e.target.value)}
          className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
        />
      </div>
    </div>
  )
}
