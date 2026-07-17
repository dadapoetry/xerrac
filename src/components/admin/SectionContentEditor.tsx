'use client'

import { safeParse } from '@/lib/utils'
import { PortadaEditor } from './section-editors/PortadaEditor'
import { BodyEditor } from './section-editors/BodyEditor'
import { FaduEditor } from './section-editors/FaduEditor'
import { PaginesGroguesEditor } from './section-editors/PaginesGroguesEditor'
import { CalaixSastreEditor } from './section-editors/CalaixSastreEditor'
import { FullMuralEditor } from './section-editors/FullMuralEditor'
import { CrosswordEditor } from './section-editors/CrosswordEditor'

interface SectionContentEditorProps {
  type: string
  content: string
  onChange: (content: string) => void
}

export function SectionContentEditor({ type, content, onChange }: SectionContentEditorProps) {
  const data = safeParse(content)

  const updateField = (field: string, value: any) => {
    const newData = { ...data, [field]: value }
    onChange(JSON.stringify(newData))
  }

  const updateArrayItem = (field: string, index: number, key: string, value: any) => {
    const arr = [...(data[field] || [])]
    arr[index] = { ...arr[index], [key]: value }
    onChange(JSON.stringify({ ...data, [field]: arr }))
  }

  const addArrayItem = (field: string, template: Record<string, any>) => {
    const arr = [...(data[field] || []), template]
    onChange(JSON.stringify({ ...data, [field]: arr }))
  }

  const removeArrayItem = (field: string, index: number) => {
    const arr = data[field].filter((_: any, i: number) => i !== index)
    onChange(JSON.stringify({ ...data, [field]: arr }))
  }

  switch (type) {
    case 'portada':
      return <PortadaEditor topic={data.topic || ''} onChange={updateField} />

    case 'editorial':
    case 'aclariment_cultural':
      return <BodyEditor body={data.body || ''} onFieldChange={updateField} />

    case 'visita':
      return <BodyEditor body={data.body || ''} source={data.source || ''} showSource onFieldChange={updateField} />

    case 'fadu_catala':
      return (
        <FaduEditor
          entries={data.entries || []}
          onUpdateArrayItem={updateArrayItem}
          onAddArrayItem={addArrayItem}
          onRemoveArrayItem={removeArrayItem}
        />
      )

    case 'pagines_grogues':
      return (
        <PaginesGroguesEditor
          proverbs={data.proverbs || []}
          onUpdateArrayItem={updateArrayItem}
          onAddArrayItem={addArrayItem}
          onRemoveArrayItem={removeArrayItem}
        />
      )

    case 'calaix_sastre':
      return (
        <CalaixSastreEditor
          data={data}
          onUpdateArrayItem={updateArrayItem}
          onAddArrayItem={addArrayItem}
          onRemoveArrayItem={removeArrayItem}
        />
      )

    case 'full_mural':
      return (
        <FullMuralEditor
          collages={data.collages || []}
          onUpdateArrayItem={updateArrayItem}
          onAddArrayItem={addArrayItem}
          onRemoveArrayItem={removeArrayItem}
        />
      )

    case 'ludita':
      return <CrosswordEditor data={data} onChange={onChange} />

    default:
      return (
        <textarea
          value={JSON.stringify(data, null, 2)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm font-mono"
          rows={15}
        />
      )
  }
}
