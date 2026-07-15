'use client'

import { useState } from 'react'
import { RichTextEditor } from '@/components/RichTextEditor'

interface SectionContentEditorProps {
  type: string
  content: string
  onChange: (content: string) => void
}

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


/* =========================================
   NOVA LÒGICA DE MOTS ENCREUATS AUTOMÀTICS
   ========================================= */

interface WordEntry {
  clue: string
  answer: string
}

// Algorisme greedy per creuar les paraules automàticament
function buildCrosswordLayout(words: WordEntry[]) {
  if (!words || words.length === 0) {
    return { gridSize: 11, clues: { across: {}, down: {} } }
  }

  // Netejem les respostes: majúscules i traient espais
  const cleanedWords = words.map((w, i) => ({
    ...w,
    originalIndex: i,
    answer: (w.answer || '').toUpperCase().replace(/\s+/g, '')
  })).filter(w => w.answer.length > 1) // Necessita un mínim de 2 lletres

  // Ordenem de més llarga a més curta (funciona millor per l'algorisme de creuament)
  cleanedWords.sort((a, b) => b.answer.length - a.answer.length)

  const placements: any[] = []
  const grid = new Map<string, string>() // "x,y" -> "LLETRA"

  const getCell = (x: number, y: number) => grid.get(`${x},${y}`)
  const setCell = (x: number, y: number, char: string) => grid.set(`${x},${y}`, char)

  const canPlace = (word: string, startX: number, startY: number, dir: 'across' | 'down') => {
    let intersections = 0
    for (let i = 0; i < word.length; i++) {
      const x = dir === 'across' ? startX + i : startX
      const y = dir === 'down' ? startY + i : startY
      const cell = getCell(x, y)

      if (cell === word[i]) {
        intersections++
      } else if (cell !== undefined) {
        return -1 // Col·lisió (lletra diferent)
      } else {
        // Comprovar adjacents per evitar que les paraules es toquin en paral·lel
        if (dir === 'across') {
          if (getCell(x, y - 1) !== undefined || getCell(x, y + 1) !== undefined) return -1
        } else {
          if (getCell(x - 1, y) !== undefined || getCell(x + 1, y) !== undefined) return -1
        }
      }
    }
    // Comprovar els caps (abans de la primera lletra i després de l'última)
    if (dir === 'across') {
      if (getCell(startX - 1, startY) !== undefined || getCell(startX + word.length, startY) !== undefined) return -1
    } else {
      if (getCell(startX, startY - 1) !== undefined || getCell(startX, startY + word.length) !== undefined) return -1
    }
    return intersections
  }

  for (const wordObj of cleanedWords) {
    if (placements.length === 0) {
      // Primera paraula va al centre
      placements.push({ ...wordObj, x: 0, y: 0, dir: 'across' })
      for (let i = 0; i < wordObj.answer.length; i++) setCell(i, 0, wordObj.answer[i])
      continue
    }

    let best = null
    let maxIntersections = -1

    for (const p of placements) {
      for (let j = 0; j < p.answer.length; j++) {
        const px = p.dir === 'across' ? p.x + j : p.x
        const py = p.dir === 'down' ? p.y + j : p.y
        const char = p.answer[j]

        // Busquem si la lletra existeix a la nova paraula
        for (let k = 0; k < wordObj.answer.length; k++) {
          if (wordObj.answer[k] === char) {
            const dir = p.dir === 'across' ? 'down' : 'across'
            const startX = dir === 'across' ? px - k : px
            const startY = dir === 'down' ? py - k : py

            const intersections = canPlace(wordObj.answer, startX, startY, dir)
            if (intersections > maxIntersections) {
              maxIntersections = intersections
              best = { x: startX, y: startY, dir }
            }
          }
        }
      }
    }

    if (best) {
      // S'ha pogut creuar correctament
      placements.push({ ...wordObj, ...best })
      for (let i = 0; i < wordObj.answer.length; i++) {
        const x = best.dir === 'across' ? best.x + i : best.x
        const y = best.dir === 'down' ? best.y + i : best.y
        setCell(x, y, wordObj.answer[i])
      }
    } else {
// Si no pot creuar-se, la posa a la part inferior perquè no es perdi
      let maxY = -Infinity
      grid.forEach((_value, key) => {
        const [, yStr] = key.split(',')
        if (Number(yStr) > maxY) maxY = Number(yStr)
      })
      const startY = maxY === -Infinity ? 0 : maxY + 2
      placements.push({ ...wordObj, x: 0, y: startY, dir: 'across' })
      for (let i = 0; i < wordObj.answer.length; i++) setCell(i, startY, wordObj.answer[i])
    }
  }

  // Calcular la bounding box per determinar la mida i ajustar els índexs a (0,0)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of placements) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.dir === 'across' && p.x + p.answer.length > maxX) maxX = p.x + p.answer.length
    if (p.dir === 'down' && p.x + 1 > maxX) maxX = p.x + 1
    if (p.dir === 'down' && p.y + p.answer.length > maxY) maxY = p.y + p.answer.length
    if (p.dir === 'across' && p.y + 1 > maxY) maxY = p.y + 1
  }

  // Afegim 1 de padding extra global (Math.max contra gridW i gridH per si queden rectangulars)
  const gridW = maxX === -Infinity ? 10 : maxX - minX
  const gridH = maxY === -Infinity ? 10 : maxY - minY
  const gridSize = Math.max(gridW, gridH, 5)

  // Ordenem de dalt a baix i esquerra a dreta per numerar-los bé
  placements.sort((a, b) => {
    const ay = a.y - minY
    const ax = a.x - minX
    const by = b.y - minY
    const bx = b.x - minX
    if (ay !== by) return ay - by
    return ax - bx
  })

  const across: any = {}
  const down: any = {}
  let num = 1
  const posMap = new Map<string, number>()

  for (const p of placements) {
    const nx = p.x - minX
    const ny = p.y - minY
    const key = `${nx},${ny}`
    if (!posMap.has(key)) {
      posMap.set(key, num++)
    }
    const currentNum = posMap.get(key)

    const target = p.dir === 'across' ? across : down
    target[currentNum!] = { clue: p.clue, answer: p.answer, row: ny, col: nx }
  }

  return { gridSize, clues: { across, down } }
}

function CrosswordEditor({ data, onChange }: { data: any; onChange: (json: string) => void }) {
  // Inicialitzem un llistat "pla" de paraules com a Single Source of Truth a la UI.
  // Si hi ha dades antigues amb "across/down", les aplanem per fer la migració invisible.
  const [words, setWords] = useState<WordEntry[]>(() => {
    if (data.crossword?.words) return data.crossword.words
    
    const extracted: WordEntry[] = []
    if (data.crossword?.clues) {
      Object.values(data.crossword.clues.across || {}).forEach((c: any) => extracted.push({ clue: c.clue, answer: c.answer }))
      Object.values(data.crossword.clues.down || {}).forEach((c: any) => extracted.push({ clue: c.clue, answer: c.answer }))
    }
    return extracted
  })

  // S'encarrega d'actualitzar l'estat visual (words) i generar automàticament l'estructura JSON per al component visual.
  const updateAndGenerate = (newWords: WordEntry[]) => {
    setWords(newWords)
    const { gridSize, clues } = buildCrosswordLayout(newWords)
    onChange(JSON.stringify({
      ...data,
      crossword: { words: newWords, gridSize, clues } // Desem 'words' perquè l'editor recordi l'origen
    }))
  }

  const addWord = () => updateAndGenerate([...words, { clue: '', answer: '' }])
  const removeWord = (index: number) => updateAndGenerate(words.filter((_, i) => i !== index))
  const updateWord = (index: number, field: keyof WordEntry, value: string) => {
    const newWords = [...words]
    newWords[index] = { ...newWords[index], [field]: value }
    updateAndGenerate(newWords)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-gray-500">Configuració automàtica del crucigrama</p>
        <button
          type="button"
          onClick={addWord}
          className="text-xs text-red-400 hover:text-red-300 transition-colors bg-red-900/20 px-3 py-1 rounded"
        >
          + Afegir Paraula
        </button>
      </div>

      <div className="space-y-3">
        {words.length === 0 ? (
          <p className="text-xs text-gray-600 italic">Cap paraula. Afegeix-ne una per començar a generar la graella automàticament.</p>
        ) : (
          words.map((word, index) => (
            <div key={index} className="p-3 border border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Paraula #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeWord(index)}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={word.clue}
                  onChange={(e) => updateWord(index, 'clue', e.target.value)}
                  placeholder="Pista (ex: Moviment que rebutja les màquines)"
                  className="w-full bg-black border border-gray-700 px-3 py-1.5 text-white text-xs"
                />
                <input
                  type="text"
                  value={word.answer}
                  onChange={(e) => updateWord(index, 'answer', e.target.value.toUpperCase())}
                  placeholder="Resposta (es creuarà automàticament)"
                  className="w-full bg-black border border-gray-700 px-3 py-1.5 text-white text-xs uppercase"
                />
              </div>
            </div>
          ))
        )}
      </div>
      
      {words.length > 0 && (
        <div className="p-3 mt-4 border border-dashed border-gray-700 text-xs text-gray-400">
          <p>ℹ️ La graella, l'orientació i les coordenades s'estan generant <strong>automàticament</strong> en temps real. El motor visual rebrà la graella perfectament ajustada.</p>
        </div>
      )}
    </div>
  )
}
