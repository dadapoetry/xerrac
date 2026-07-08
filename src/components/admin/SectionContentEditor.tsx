'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

import 'react-quill/dist/quill.snow.css'

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
            <label className="block text-xs uppercase text-gray-500 mb-1">Subtítol</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
            />
          </div>
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
    case 'expansio_critica':
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
            <ReactQuill
              value={data.body || ''}
              onChange={(v) => updateField('body', v)}
              className="bg-white text-black rounded"
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['blockquote', 'link'],
                  ['clean'],
                ],
              }}
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
                <ReactQuill
                  value={entry.body || ''}
                  onChange={(v) => updateArrayItem('entries', i, 'body', v)}
                  className="bg-white text-black rounded text-sm"
                  theme="snow"
                  modules={{ toolbar: [['bold', 'italic'], ['clean']] }}
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
                <ReactQuill
                  value={item.body || ''}
                  onChange={(v) => updateArrayItem('interviews', i, 'body', v)}
                  className="bg-white text-black rounded text-sm"
                  theme="snow"
                  modules={{ toolbar: [['bold', 'italic'], ['clean']] }}
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
                <ReactQuill
                  value={item.body || ''}
                  onChange={(v) => updateArrayItem('reviews', i, 'body', v)}
                  className="bg-white text-black rounded text-sm"
                  theme="snow"
                  modules={{ toolbar: [['bold', 'italic'], ['clean']] }}
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
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Configuració del crucigrama</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mida de la graella</label>
            <input
              type="number"
              value={data.crossword?.gridSize || 11}
              onChange={(e) => {
                const newData = { ...data, crossword: { ...(data.crossword || {}), gridSize: parseInt(e.target.value) || 11, clues: { across: {}, down: {} } } }
                onChange(JSON.stringify(newData))
              }}
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              min="5"
              max="20"
            />
          </div>
          <p className="text-xs text-gray-600">
            Per editar el crucigrama completament, utilitza l&apos;editor de codi JSON o contacta amb el desenvolupador.
          </p>
          <textarea
            value={JSON.stringify(data, null, 2)}
            onChange={(e) => {
              try {
                JSON.parse(e.target.value)
                onChange(e.target.value)
              } catch { }
            }}
            className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm font-mono"
            rows={15}
          />
        </div>
      )

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
