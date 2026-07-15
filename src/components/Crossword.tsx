'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { CrosswordData } from '@/types'

interface CrosswordProps {
  data: CrosswordData
}

interface Position {
  row: number
  col: number
}

export function Crossword({ data }: CrosswordProps) {
  const { gridSize, clues } = data

  const [grid, setGrid] = useState<string[][]>(() => {
    const g: string[][] = []
    for (let r = 0; r < gridSize; r++) {
      g[r] = []
      for (let c = 0; c < gridSize; c++) {
        g[r][c] = ''
      }
    }
    const allClues = [
      ...Object.values(clues.across),
      ...Object.values(clues.down),
    ]
    for (const clue of allClues) {
      const { row, col, answer } = clue
      const isAcross = Object.values(clues.across).some(
        (c) => c.row === row && c.col === col && c.answer === answer
      )
      for (let i = 0; i < answer.length; i++) {
        const r = isAcross ? row : row + i
        const c = isAcross ? col + i : col
        if (r < gridSize && c < gridSize) {
          if (!g[r][c]) g[r][c] = ''
        }
      }
    }
    return g
  })

  const [activePos, setActivePos] = useState<Position | null>(null)
  const [direction, setDirection] = useState<'across' | 'down'>('across')
  const [revealed, setRevealed] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])

  const isBlackCell = (row: number, col: number): boolean => {
    const allClues = [
      ...Object.values(clues.across),
      ...Object.values(clues.down),
    ]
    for (const clue of allClues) {
      const isAcross = Object.values(clues.across).some(
        (c) => c.row === clue.row && c.col === clue.col && c.answer === clue.answer
      )
      for (let i = 0; i < clue.answer.length; i++) {
        const r = isAcross ? clue.row : clue.row + i
        const c = isAcross ? clue.col + i : clue.col
        if (r === row && c === col) return false
      }
    }
    return true
  }

  const getCellNumber = (row: number, col: number): number | null => {
    for (const [num, clue] of Object.entries(clues.across)) {
      if (clue.row === row && clue.col === col) return parseInt(num)
    }
    for (const [num, clue] of Object.entries(clues.down)) {
      if (clue.row === row && clue.col === col) return parseInt(num)
    }
    return null
  }

  const getClueForCell = (row: number, col: number): { clue: string; answer: string } | null => {
    if (direction === 'across') {
      for (const [, clue] of Object.entries(clues.across)) {
        if (row >= clue.row && row < clue.row + 1 &&
            col >= clue.col && col < clue.col + clue.answer.length) {
          return { clue: clue.clue, answer: clue.answer }
        }
      }
    } else {
      for (const [, clue] of Object.entries(clues.down)) {
        if (col >= clue.col && col < clue.col + 1 &&
            row >= clue.row && row < clue.row + clue.answer.length) {
          return { clue: clue.clue, answer: clue.answer }
        }
      }
    }
    return null
  }

  const handleCellChange = (row: number, col: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    const newGrid = grid.map(r => [...r])
    newGrid[row][col] = value.toUpperCase()
    setGrid(newGrid)
  }

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      setDirection(d => d === 'across' ? 'down' : 'across')
      return
    }

    if (e.key === 'ArrowRight') moveTo(row, col + 1)
    else if (e.key === 'ArrowLeft') moveTo(row, col - 1)
    else if (e.key === 'ArrowDown') moveTo(row + 1, col)
    else if (e.key === 'ArrowUp') moveTo(row - 1, col)
    else if (e.key === 'Backspace') {
      if (!grid[row][col] && direction === 'across') moveTo(row, col - 1)
      else if (!grid[row][col] && direction === 'down') moveTo(row - 1, col)
    }
  }

  const moveTo = (row: number, col: number) => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return
    if (isBlackCell(row, col)) return
    setActivePos({ row, col })
    inputRefs.current[row]?.[col]?.focus()
  }

  const handleCellClick = (row: number, col: number) => {
    if (isBlackCell(row, col)) return
    if (activePos && activePos.row === row && activePos.col === col) {
      setDirection(d => d === 'across' ? 'down' : 'across')
    }
    setActivePos({ row, col })
  }

  const checkAnswers = () => {
    setRevealed(true)
    const newGrid = grid.map(r => [...r])
    const allClues = [
      ...Object.values(clues.across),
      ...Object.values(clues.down),
    ]
    for (const clue of allClues) {
      const isAcross = Object.values(clues.across).some(
        (c) => c.row === clue.row && c.col === clue.col && c.answer === clue.answer
      )
      for (let i = 0; i < clue.answer.length; i++) {
        const r = isAcross ? clue.row : clue.row + i
        const c = isAcross ? clue.col + i : clue.col
        if (r < gridSize && c < gridSize) {
          newGrid[r][c] = clue.answer[i]?.toUpperCase() || ''
        }
      }
    }
    setGrid(newGrid)
  }

  const resetGrid = () => {
    setRevealed(false)
    const g: string[][] = []
    for (let r = 0; r < gridSize; r++) {
      g[r] = []
      for (let c = 0; c < gridSize; c++) {
        g[r][c] = ''
      }
    }
    setGrid(g)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-shrink-0">
        <div
          className="crossword-grid inline-grid border-2 border-gray-600"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: `${gridSize * 2.5}rem`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const row = Math.floor(idx / gridSize)
            const col = idx % gridSize
            const black = isBlackCell(row, col)
            const cellNum = getCellNumber(row, col)
            const isActive = activePos?.row === row && activePos?.col === col

            return (
              <div
                key={idx}
                className="crossword-cell relative"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: black ? '#1a1a1a' : isActive ? '#1a1a1a' : '#0a0a0a',
                  border: '1px solid #333',
                }}
                onClick={() => handleCellClick(row, col)}
              >
                {cellNum && (
                  <span className="absolute top-0 left-0.5 text-[0.5rem] text-gray-400 leading-none">
                    {cellNum}
                  </span>
                )}
                {!black && (
                  <input
                    ref={(el) => {
                      if (!inputRefs.current[row]) inputRefs.current[row] = []
                      inputRefs.current[row][col] = el
                    }}
                    type="text"
                    maxLength={1}
                    value={grid[row][col]}
                    onChange={(e) => handleCellChange(row, col, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(row, col, e)}
                    onClick={() => handleCellClick(row, col)}
                    onFocus={() => setActivePos({ row, col })}
                    className={`w-full h-full bg-transparent text-center text-white
                      font-mono text-lg uppercase outline-none
                      ${isActive ? 'bg-red-900/30' : ''}
                      ${revealed && grid[row][col] ? 'text-green-400' : ''}`}
                    autoComplete="off"
                    spellCheck={false}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {activePos && (
          <div className="p-4 border border-red-900 bg-red-950/20">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
              {direction === 'across' ? 'Horitzontal' : 'Vertical'}
            </p>
            <p className="text-white text-sm">
              {getClueForCell(activePos.row, activePos.col)?.clue || '—'}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gray-200 mb-3">Horitzontals</h4>
          <div className="space-y-1.5">
            {Object.entries(clues.across).map(([num, clue]) => (
              <p key={`a-${num}`} className="text-xs text-gray-100">
                <span className="font-bold mr-2" style={{ color: 'var(--accent)' }}>{num}.</span>
                {clue.clue}
                <span className="text-gray-300 ml-2">
                  ({clue.answer.length} lletres)
                </span>
              </p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gray-200 mb-3">Verticals</h4>
          <div className="space-y-1.5">
            {Object.entries(clues.down).map(([num, clue]) => (
              <p key={`d-${num}`} className="text-xs text-gray-100">
                <span className="font-bold mr-2" style={{ color: 'var(--accent)' }}>{num}.</span>
                {clue.clue}
                <span className="text-gray-300 ml-2">
                  ({clue.answer.length} lletres)
                </span>
              </p>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={checkAnswers}
            className="px-4 py-2 text-xs uppercase tracking-wider border border-[var(--accent)]
              text-[var(--accent)] hover:bg-[var(--btn-hover)]/30 transition-colors"
          >
            Solucionar
          </button>
          <button
            onClick={resetGrid}
            className="px-4 py-2 text-xs uppercase tracking-wider border border-gray-700
              text-gray-400 hover:bg-gray-800 transition-colors"
          >
            Netejar
          </button>
        </div>
      </div>
    </div>
  )
}
