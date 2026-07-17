'use client'

import { useState } from 'react'

interface WordEntry {
  clue: string
  answer: string
}

function buildCrosswordLayout(words: WordEntry[]) {
  if (!words || words.length === 0) {
    return { gridSize: 11, clues: { across: {}, down: {} } }
  }

  const cleanedWords = words.map((w, i) => ({
    ...w,
    originalIndex: i,
    answer: (w.answer || '').toUpperCase().replace(/\s+/g, '')
  })).filter(w => w.answer.length > 1)

  cleanedWords.sort((a, b) => b.answer.length - a.answer.length)

  const placements: any[] = []
  const grid = new Map<string, string>()

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
        return -1
      } else {
        if (dir === 'across') {
          if (getCell(x, y - 1) !== undefined || getCell(x, y + 1) !== undefined) return -1
        } else {
          if (getCell(x - 1, y) !== undefined || getCell(x + 1, y) !== undefined) return -1
        }
      }
    }
    if (dir === 'across') {
      if (getCell(startX - 1, startY) !== undefined || getCell(startX + word.length, startY) !== undefined) return -1
    } else {
      if (getCell(startX, startY - 1) !== undefined || getCell(startX, startY + word.length) !== undefined) return -1
    }
    return intersections
  }

  for (const wordObj of cleanedWords) {
    if (placements.length === 0) {
      placements.push({ ...wordObj, x: 0, y: 0, dir: 'across' })
      for (let i = 0; i < wordObj.answer.length; i++) setCell(i, 0, wordObj.answer[i])
      continue
    }

    let best: any = null
    let maxIntersections = -1

    for (const p of placements) {
      for (let j = 0; j < p.answer.length; j++) {
        const px = p.dir === 'across' ? p.x + j : p.x
        const py = p.dir === 'down' ? p.y + j : p.y
        const char = p.answer[j]

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
      placements.push({ ...wordObj, ...best })
      for (let i = 0; i < wordObj.answer.length; i++) {
        const x = best.dir === 'across' ? best.x + i : best.x
        const y = best.dir === 'down' ? best.y + i : best.y
        setCell(x, y, wordObj.answer[i])
      }
    } else {
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

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of placements) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.dir === 'across' && p.x + p.answer.length > maxX) maxX = p.x + p.answer.length
    if (p.dir === 'down' && p.x + 1 > maxX) maxX = p.x + 1
    if (p.dir === 'down' && p.y + p.answer.length > maxY) maxY = p.y + p.answer.length
    if (p.dir === 'across' && p.y + 1 > maxY) maxY = p.y + 1
  }

  const gridW = maxX === -Infinity ? 10 : maxX - minX
  const gridH = maxY === -Infinity ? 10 : maxY - minY
  const gridSize = Math.max(gridW, gridH, 5)

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

interface Props {
  data: any
  onChange: (json: string) => void
}

export function CrosswordEditor({ data, onChange }: Props) {
  const [words, setWords] = useState<WordEntry[]>(() => {
    if (data.crossword?.words) return data.crossword.words

    const extracted: WordEntry[] = []
    if (data.crossword?.clues) {
      Object.values(data.crossword.clues.across || {}).forEach((c: any) => extracted.push({ clue: c.clue, answer: c.answer }))
      Object.values(data.crossword.clues.down || {}).forEach((c: any) => extracted.push({ clue: c.clue, answer: c.answer }))
    }
    return extracted
  })

  const updateAndGenerate = (newWords: WordEntry[]) => {
    setWords(newWords)
    const { gridSize, clues } = buildCrosswordLayout(newWords)
    onChange(JSON.stringify({
      ...data,
      crossword: { words: newWords, gridSize, clues }
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
