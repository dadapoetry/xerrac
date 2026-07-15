'use client'

import { useState, useEffect } from 'react'
import { RichTextEditor } from '@/components/RichTextEditor'

interface SectionContentEditorProps {
  type: string
  content: string
  onChange: (content: string) => void
}

type ContentStructure = Record<string, any>

function parseContent(content: string): any {
  try { return JSON.parse(content) } catch { return {} }
}

export function SectionContentEditor({ type, content, onChange }: SectionContentEditorProps) {
  const data = parseContent(content)

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
      return (
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Tema / Topic</label>
            <input
              type="text"
              value={data.topic || ''}
              onChange={(e) => updateField('topic', e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            />
          </div>
        </div>
      )

    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      return (
        <div className="space-y-4">
          {type === 'visita' && (
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Font / Source</label>
              <input
                type="text"
                value={data.source || ''}
                onChange={(e) => updateField('source', e.target.value)}
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Cos (HTML)</label>
            <RichTextEditor
              value={data.body || ''}
              onChange={(v) => updateField('body', v)}
            />
          </div>
        </div>
      )

    case 'fadu_catala':
      return (
        <div className="space-y-6">
          <p className="text-xs text-gray-500">Entrades del Fadu Català (biografies apòcrifes, ucronies)</p>
          {(data.entries || []).map((entry: any, i: number) => (
            <div key={i} className="p-4 border border-gray-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Entrada #{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem('entries', i)}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
              <select
                value={entry.type || 'biography'}
                onChange={(e) => updateArrayItem('entries', i, 'type', e.target.value)}
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              >
                <option value="biography">Biografia apòcrifa</option>
                <option value="ucronia">Ucronia</option>
                <option value="character">Personatge inventat</option>
              </select>
              <input
                type="text"
                value={entry.title || ''}
                onChange={(e) => updateArrayItem('entries', i, 'title', e.target.value)}
                placeholder="Títol"
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cos (HTML)</label>
                <RichTextEditor
                  value={entry.body || ''}
                  onChange={(v) => updateArrayItem('entries', i, 'body', v)}
                  minimal
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('entries', { type: 'biography', title: '', body: '' })}
            className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900
              px-4 py-2 w-full"
          >
            + Afegir entrada
          </button>
        </div>
      )

    case 'pagines_grogues':
      return (
        <div className="space-y-4">
          {(data.proverbs || []).map((proverb: any, i: number) => (
            <div key={i} className="p-4 border border-gray-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Proverbi #{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem('proverbs', i)}
                  className="text-xs text-red-500"
                >
                  Eliminar
                </button>
              </div>
              <textarea
                value={proverb.text || ''}
                onChange={(e) => updateArrayItem('proverbs', i, 'text', e.target.value)}
                placeholder="Text del proverbi"
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
                rows={2}
              />
              <input
                type="text"
                value={proverb.author || ''}
                onChange={(e) => updateArrayItem('proverbs', i, 'author', e.target.value)}
                placeholder="Autor (inspirat en / adaptat de)"
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('proverbs', { text: '', author: '' })}
            className="text-sm text-yellow-400 hover:text-yellow-300 border border-dashed border-yellow-900
              px-4 py-2 w-full"
          >
            + Afegir proverbi
          </button>
        </div>
      )

    case 'calaix_sastre':
      return (
        <div className="space-y-8">
          <div>
            <h4 className="text-xs uppercase text-gray-500 mb-4">Entrevistes</h4>
            {(data.interviews || []).map((item: any, i: number) => (
              <div key={i} className="p-4 border border-gray-700 mb-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Entrevista #{i + 1}</span>
                  <button type="button" onClick={() => removeArrayItem('interviews', i)}
                    className="text-xs text-red-500">Eliminar</button>
                </div>
                <input
                  type="text" value={item.subject || ''}
                  onChange={(e) => updateArrayItem('interviews', i, 'subject', e.target.value)}
                  placeholder="Tema / Persona entrevistada"
                  className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
                />
                <RichTextEditor
                  value={item.body || ''}
                  onChange={(v) => updateArrayItem('interviews', i, 'body', v)}
                  minimal
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('interviews', { subject: '', body: '' })}
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
                  <button type="button" onClick={() => removeArrayItem('reviews', i)}
                    className="text-xs text-red-500">Eliminar</button>
                </div>
                <input
                  type="text" value={item.title || ''}
                  onChange={(e) => updateArrayItem('reviews', i, 'title', e.target.value)}
                  placeholder="Títol de l'obra ressenyada"
                  className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
                />
                <RichTextEditor
                  value={item.body || ''}
                  onChange={(v) => updateArrayItem('reviews', i, 'body', v)}
                  minimal
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('reviews', { title: '', body: '' })}
              className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
            >
              + Afegir crítica
            </button>
          </div>
        </div>
      )

    case 'full_mural':
      return (
        <div className="space-y-4">
          {(data.collages || []).map((item: any, i: number) => (
            <div key={i} className="p-4 border border-gray-700 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Collage #{i + 1}</span>
                <button type="button" onClick={() => removeArrayItem('collages', i)}
                  className="text-xs text-red-500">Eliminar</button>
              </div>
              <input
                type="text" value={item.image || ''}
                onChange={(e) => updateArrayItem('collages', i, 'image', e.target.value)}
                placeholder="URL de la imatge"
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              />
              <textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem('collages', i, 'description', e.target.value)}
                placeholder="Descripció"
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
                rows={2}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('collages', { image: '', description: '' })}
            className="text-sm text-red-400 hover:text-red-300 border border-dashed border-red-900 px-4 py-2 w-full"
          >
            + Afegir collage
          </button>
        </div>
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

function CrosswordEditor({ data, onChange }: { data: any; onChange: (json: string) => void }) {
  const crossword = data.crossword || { gridSize: 11, clues: { across: {}, down: {} } }

  const setCw = (cw: any) => {
    onChange(JSON.stringify({ ...data, crossword: cw }))
  }

  const addClue = (dir: 'across' | 'down') => {
    const clues = { ...crossword.clues }
    const dirClues = { ...(clues[dir] || {}) }
    const keys = Object.keys(dirClues).map(Number).filter(n => !isNaN(n))
    const next = keys.length > 0 ? Math.max(...keys) + 1 : 1
dirClues[String(next)] = { clue: '', answer: '', row: 0, col: 0 }
    setCw({ ...crossword, clues: { ...clues, [dir]: dirClues } })
  }

  const removeClue = (dir: 'across' | 'down', num: string) => {
    const clues = { ...crossword.clues }
    const dirClues = { ...(clues[dir] || {}) }
    delete dirClues[num]
    setCw({ ...crossword, clues: { ...clues, [dir]: dirClues } })
  }

  const updateClue = (dir: 'across' | 'down', num: string, field: string, value: any) => {
    const clues = { ...crossword.clues }
    const dirClues = { ...(clues[dir] || {}) }
    dirClues[num] = { ...(dirClues[num] || {}), [field]: value }
    setCw({ ...crossword, clues: { ...clues, [dir]: dirClues } })
  }

  const renderClues = (dir: 'across' | 'down', label: string) => {
    const entries = Object.entries(crossword.clues?.[dir] || {})
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase text-gray-500">{label}</h4>
          <button
            type="button"
            onClick={() => addClue(dir)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            + Afegir
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="text-xs text-gray-600 italic">Cap pista</p>
        ) : (
          entries.map(([num, clue]: [string, any]) => (
            <div key={num} className="p-3 border border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pista #{num}</span>
                <button
                  type="button"
                  onClick={() => removeClue(dir, num)}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={clue.clue || ''}
                  onChange={(e) => updateClue(dir, num, 'clue', e.target.value)}
                  placeholder="Pista (ex: Moviment que rebutja les màquines (5))"
                  className="col-span-2 bg-black border border-gray-700 px-3 py-1.5 text-white text-xs"
                />
                <input
                  type="text"
                  value={clue.answer || ''}
                  onChange={(e) => updateClue(dir, num, 'answer', e.target.value.toUpperCase())}
                  placeholder="Resposta"
                  className="bg-black border border-gray-700 px-3 py-1.5 text-white text-xs uppercase"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={clue.row ?? 0}
                    onChange={(e) => updateClue(dir, num, 'row', parseInt(e.target.value) || 0)}
                    placeholder="Fila"
                    className="w-full bg-black border border-gray-700 px-3 py-1.5 text-white text-xs"
                    min="0"
                  />
                  <input
                    type="number"
                    value={clue.col ?? 0}
                    onChange={(e) => updateClue(dir, num, 'col', parseInt(e.target.value) || 0)}
                    placeholder="Col"
                    className="w-full bg-black border border-gray-700 px-3 py-1.5 text-white text-xs"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Configuració del crucigrama</p>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Mida de la graella</label>
        <input
          type="number"
          value={crossword.gridSize || 11}
          onChange={(e) => setCw({ ...crossword, gridSize: parseInt(e.target.value) || 11 })}
          className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
          min="5"
          max="20"
        />
      </div>

      {renderClues('across', 'Horitzontals')}
      {renderClues('down', 'Verticals')}
    </div>
  )
}
