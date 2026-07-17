'use client'

import { RichTextEditor } from '@/components/RichTextEditor'

interface Props {
  body: string
  source?: string
  showSource?: boolean
  onFieldChange: (field: string, value: any) => void
}

export function BodyEditor({ body, source, showSource, onFieldChange }: Props) {
  return (
    <div className="space-y-4">
      {showSource && (
        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Font / Source</label>
          <input
            type="text"
            value={source || ''}
            onChange={(e) => onFieldChange('source', e.target.value)}
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          />
        </div>
      )}
      <div>
        <label className="block text-xs uppercase text-gray-500 mb-1">Cos (HTML)</label>
        <RichTextEditor
          value={body || ''}
          onChange={(v) => onFieldChange('body', v)}
        />
      </div>
    </div>
  )
}
