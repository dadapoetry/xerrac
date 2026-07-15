'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { IssueData, SectionData, CrosswordData } from '@/types'
import { computeLayout } from '@/lib/layoutEngine'
import { buildPrintHTML, stripHtml, sectionLabel, buildGrid } from '@/lib/printHtml'

const PAGE_W = 1580
const PAGE_H = 1120
const COLS = 8
const MASTHEAD_H = 148
const FOOTER_H = 32
const SECT_H = PAGE_H - MASTHEAD_H - FOOTER_H

function CrosswordPreview({ cw, fs, colSpan, showSolution = false }: { cw: CrosswordData; fs: number; colSpan: number; showSolution?: boolean }) {
  const n = cw.gridSize
  const { grid, numbers } = useMemo(() => buildGrid(cw, showSolution), [cw, showSolution])
  const maxW = colSpan >= 4 ? 420 : colSpan >= 2 ? 240 : 160
  const cellSize = Math.min(fs * 1.8, Math.floor((maxW - 8) / n))
  const fontSize = Math.max(fs * 0.8, 5)
  const cluesSize = Math.max(fs * 0.65, 5)

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${n},${cellSize}px)`, alignSelf: 'center' }}>
      {Array.from({ length: n }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => {
          const val = grid[r]?.[c]; const num = numbers[r]?.[c]
          const isBlack = !val
          return <div key={`${r}-${c}`} style={{
            width: cellSize, height: cellSize, border: '0.5px solid #999',
            background: isBlack ? '#1a1a1a' : '#f2ede4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', fontSize, fontWeight: 700,
            fontFamily: 'Arial,Helvetica,sans-serif', color: '#1a1a1a', textTransform: 'uppercase',
          }}>
            {isBlack ? null : val}
            {num && <span style={{ position: 'absolute', top: 0, left: 1, fontSize: Math.max(fs * 0.4, 4), fontWeight: 400, color: '#555' }}>{num}</span>}
          </div>
        })
      )}
    </div>
    <div style={{ lineHeight: 1.2, fontSize: cluesSize, textAlign: 'left' }}>
      {Object.entries(cw.clues.across).length > 0 && <div style={{ marginBottom: 1 }}>
        <strong>Horitzontals:</strong> {Object.entries(cw.clues.across).map(([k, v]) => `${k}.${v.clue}`).join(' · ')}
      </div>}
      {Object.entries(cw.clues.down).length > 0 && <div>
        <strong>Verticals:</strong> {Object.entries(cw.clues.down).map(([k, v]) => `${k}.${v.clue}`).join(' · ')}
      </div>}
    </div>
  </div>
}

function renderSection(s: SectionData, c: any, fs: number, colSpan: number, accentColor: string) {
  const lh = 1.35
  switch (s.type) {
    case 'editorial': case 'aclariment_cultural':
      return <p style={{ lineHeight: lh, margin: 0 }}>{stripHtml(c.body || '')}</p>
    case 'visita':
      return <div><p style={{ lineHeight: lh, margin: 0 }}>{stripHtml(c.body || '')}</p>
        {c.source && <p style={{ fontSize: `${fs - 1}px`, fontStyle: 'italic', opacity: 0.6, textAlign: 'right', marginTop: 3 }}>Font: {c.source}</p>}</div>
    case 'fadu_catala': {
      const entries = c.entries || []
      return <div style={{ lineHeight: lh }}>{entries.map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: `${fs * 0.3}px` }}>
          <strong style={{ fontSize: `${fs + 1}px`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{e.title}</strong>
          <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(e.body)}</p>
        </div>
      ))}</div>
    }
    case 'pagines_grogues': return <div style={{ lineHeight: lh }}>
      {(c.proverbs || []).map((p: any, i: number) => (
        <p key={i} style={{ margin: '0 0 3px' }}>&ldquo;{p.text}&rdquo; <span style={{ opacity: 0.6 }}>— {p.author}</span></p>
      ))}
    </div>
    case 'calaix_sastre': {
      const interviews = c.interviews || []; const reviews = c.reviews || []
      return <div style={{ lineHeight: lh }}>
        {interviews.length > 0 && <div style={{ marginBottom: `${fs * 0.3}px` }}>
          <span style={{ fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: `${fs * 0.15}px` }}>Entrevistes</span>
          {interviews.map((x: any, i: number) => <div key={`i${i}`} style={{ marginBottom: `${fs * 0.25}px` }}>
            <strong style={{ fontSize: `${fs}px` }}>{x.subject}</strong>
            <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(x.body)}</p>
          </div>)}
        </div>}
        {reviews.length > 0 && <div>
          <span style={{ fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: `${fs * 0.15}px` }}>Ressenyes</span>
          {reviews.map((x: any, i: number) => <div key={`r${i}`} style={{ marginBottom: `${fs * 0.25}px` }}>
            <strong style={{ fontSize: `${fs}px` }}>{x.title}</strong>
            <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(x.body)}</p>
          </div>)}
        </div>}
      </div>
    }
    case 'full_mural': {
      const collages = c.collages || []
      if (!collages.length) return null
      const dc = Math.min(collages.length, colSpan >= 3 ? 3 : 2); const thumb = colSpan >= 3 ? 45 : 36
      return <div style={{ display: 'flex', flexDirection: 'column', gap: `${fs * 0.3}px` }}>
        {collages.slice(0, dc).map((x: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.03)', padding: '2px 4px' }}>
            {x.image && <div style={{ width: thumb, height: thumb, backgroundImage: `url("${x.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />}
            <p style={{ fontSize: `${fs - 0.5}px`, lineHeight: lh, margin: 0 }}>{x.description}</p>
          </div>
        ))}
        {collages.length > dc && <p style={{ fontSize: `${fs - 1}px`, fontStyle: 'italic', opacity: 0.6, margin: 0 }}>+{collages.length - dc} col·latges m&eacute;s</p>}
      </div>
    }
    case 'ludita': {
      const cw = c.crossword as CrosswordData
      if (!cw) return <p style={{ fontStyle: 'italic', lineHeight: lh, margin: 0 }}>No hi ha crucigrama disponible</p>
      return <CrosswordPreview cw={cw} fs={fs} colSpan={colSpan} showSolution={false} />
    }
    default: return null
  }
}

export function TabloidPreview({ issue, autoPrint }: { issue: IssueData; autoPrint?: boolean }) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [printing, setPrinting] = useState(false)
  const accentColor = issue.accentColor || '#ef4444'

  const portada = issue.sections.find(s => s.type === 'portada')
  const pc = portada?.content as any
  const portadaTopic = pc?.topic || ''

  const layout = useMemo(() => {
    const result = computeLayout(issue, PAGE_W, PAGE_H, MASTHEAD_H, FOOTER_H)
    return {
      placed: result.slots,
      norm: result.rowFractions,
      rows: result.numRows,
    }
  }, [issue])

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(window.innerWidth / PAGE_W, window.innerHeight / PAGE_H) * 0.97)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    if (!autoPrint) return
    const t = setTimeout(() => handlePrint(), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint])

  function handlePrint() {
    setPrinting(true)
    const html = buildPrintHTML(issue, layout.placed, layout.norm)
    const win = window.open('', Math.random().toString(36).slice(2))
    if (!win) { setPrinting(false); alert('Permet les finestres emergents per exportar el PDF.'); return }
    win.document.write(html)
    win.document.close()
    setTimeout(() => {
      win.focus()
      win.print()
      setPrinting(false)
    }, 500)
  }

  const rowsCSS = layout.norm.map(f => `${f.toFixed(1)}fr`).join(' ')

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#dad3c7',
    }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: 10, fontFamily: 'Arial,sans-serif', opacity: 0.6 }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={handlePrint}
          style={{
            background: printing ? '#444' : '#000',
            color: '#fff', fontSize: 11, padding: '8px 20px', border: 'none', cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Arial,sans-serif',
            transition: 'background 0.2s',
          }}>
          {printing ? 'Generant…' : 'Exportar PDF'}
        </button>
      </div>

      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
      <div ref={pageRef} style={{
        width: PAGE_W, height: PAGE_H,
        backgroundColor: '#f2ede4', color: '#1a1a1a',
        fontFamily: 'Georgia,"Times New Roman",Times,serif',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ backgroundColor: '#000', padding: '12px 40px 0', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial,Helvetica,sans-serif', padding: '0 0 6px' }}>
            <span>N&uacute;m. <span style={{ fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>{String(issue.number).padStart(2, '0')}</span></span>
            <span style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}>{new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
          </div>
          {portadaTopic && (
            <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: accentColor, marginBottom: 4, fontWeight: 700, fontFamily: 'Arial,Helvetica,sans-serif' }}>
              {portadaTopic}
            </div>
          )}
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: '#fff', fontFamily: '"Arial Black",Impact,"Helvetica Neue",sans-serif' }}>
            XERRAC<span style={{ color: accentColor }}>!</span>
          </div>
          {!portadaTopic && (
            <div style={{ fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: 300, fontFamily: 'Arial,Helvetica,sans-serif' }}>
              Revista d&apos;aclariment cultural
            </div>
          )}
        </div>

        <svg width="100%" height="10" style={{ display: 'block', flexShrink: 0 }}>
          <defs><pattern id="saw" width="20" height="10" patternUnits="userSpaceOnUse"><path d="M0,0 L10,10 L20,0 Z" fill="#f2ede4" /></pattern></defs>
          <rect width="100%" height="10" fill="#000" />
          <rect width="100%" height="10" fill="url(#saw)" />
        </svg>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: rowsCSS,
          flex: 1,
        }}>
          {layout.placed.map((p) => {
            const s = p.section; const fs = p.fontSize; const c = s.content as any
            return (
              <div key={s.id} style={{
                gridColumn: `${p.col + 1} / span ${p.colSpan}`,
                gridRow: `${p.row + 1} / span 1`,
                padding: '10px 12px',
                borderRight: p.col + p.colSpan < COLS ? '1px solid #ddd3c4' : 'none',
                borderBottom: p.row < layout.rows - 1 ? '1px solid #ddd3c4' : 'none',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginBottom: 2 }}>
                  <div style={{ width: 12, height: 1.5, backgroundColor: accentColor, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 6.5, textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor,
                    fontWeight: 700, fontFamily: 'Arial,Helvetica,sans-serif',
                  }}>{sectionLabel(s.type)}</span>
                </div>
                <h2 style={{
                  fontSize: p.colSpan >= 5 ? '16px' : p.colSpan >= 3 ? '14px' : '12px',
                  fontWeight: 800, lineHeight: 1.2, margin: '0 0 1px', color: '#1a1a1a',
                  fontFamily: '"Arial Black",Impact,"Helvetica Neue",sans-serif',
                  textTransform: 'uppercase', letterSpacing: '-0.02em', flexShrink: 0,
                }}>{s.title}</h2>
                <div style={{ height: 1, backgroundColor: '#d4cdbe', marginBottom: 4, flexShrink: 0 }} />
                <div style={{
                  fontSize: fs, lineHeight: 1.55, color: '#2a2a2a', textAlign: 'justify',
                  flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word',
                }}>
                  {renderSection(s, c, fs, p.colSpan, accentColor)}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          position: 'absolute', bottom: 28, right: 8,
          background: accentColor, color: '#fff',
          fontFamily: 'Arial,Helvetica,sans-serif', fontSize: 7, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 8px', zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          lineHeight: 1, whiteSpace: 'nowrap',
        }}>
          Ha quedat clar?
        </div>

        <div style={{
          borderTop: '1px solid #1a1a1a', padding: '6px 24px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.15em',
          color: '#999', fontFamily: 'Arial,Helvetica,sans-serif', flexShrink: 0,
        }}>
          <span>Xerrac!<span style={{ color: accentColor, margin: '0 6px' }}>◆</span>Revista d&apos;aclariment cultural</span>
          <span>Compilat des de xerrac.cat</span>
        </div>
    </div>
    </div>
    </div>
    </div>
  )
}
