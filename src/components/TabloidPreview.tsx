'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { IssueData, SectionData, CrosswordData, CrosswordClue } from '@/types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

const PAGE_W = 1580
const PAGE_H = 1120
const COLS = 8
const MASTHEAD_H = 148
const FOOTER_H = 32
const SECT_H = PAGE_H - MASTHEAD_H - FOOTER_H

interface LayoutSlot {
  col: number; row: number; colSpan: number; rowSpan: number
}

interface LayoutTemplate {
  slots: LayoutSlot[]
  rowFractions: number[]
}

const LAYOUTS: Record<number, LayoutTemplate> = {
  8: {
    rowFractions: [2.5, 1.5, 1.5, 1],
    slots: [
      { col: 0, row: 0, colSpan: 8, rowSpan: 1 },
      { col: 0, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 4, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 0, row: 2, colSpan: 3, rowSpan: 1 },
      { col: 3, row: 2, colSpan: 3, rowSpan: 1 },
      { col: 6, row: 2, colSpan: 2, rowSpan: 1 },
      { col: 0, row: 3, colSpan: 4, rowSpan: 1 },
      { col: 4, row: 3, colSpan: 4, rowSpan: 1 },
    ],
  },
  7: {
    rowFractions: [2.5, 1.5, 1.5, 1],
    slots: [
      { col: 0, row: 0, colSpan: 8, rowSpan: 1 },
      { col: 0, row: 1, colSpan: 5, rowSpan: 1 },
      { col: 5, row: 1, colSpan: 3, rowSpan: 1 },
      { col: 0, row: 2, colSpan: 3, rowSpan: 1 },
      { col: 3, row: 2, colSpan: 3, rowSpan: 1 },
      { col: 6, row: 2, colSpan: 2, rowSpan: 1 },
      { col: 0, row: 3, colSpan: 8, rowSpan: 1 },
    ],
  },
  6: {
    rowFractions: [2.5, 1.5, 1.5, 1],
    slots: [
      { col: 0, row: 0, colSpan: 8, rowSpan: 1 },
      { col: 0, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 4, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 0, row: 2, colSpan: 4, rowSpan: 1 },
      { col: 4, row: 2, colSpan: 4, rowSpan: 1 },
      { col: 0, row: 3, colSpan: 8, rowSpan: 1 },
    ],
  },
  5: {
    rowFractions: [2.5, 1.5, 1.5, 1],
    slots: [
      { col: 0, row: 0, colSpan: 8, rowSpan: 1 },
      { col: 0, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 4, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 0, row: 2, colSpan: 8, rowSpan: 1 },
      { col: 0, row: 3, colSpan: 8, rowSpan: 1 },
    ],
  },
  4: {
    rowFractions: [2.5, 2, 1.5, 1],
    slots: [
      { col: 0, row: 0, colSpan: 8, rowSpan: 1 },
      { col: 0, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 4, row: 1, colSpan: 4, rowSpan: 1 },
      { col: 0, row: 2, colSpan: 8, rowSpan: 1 },
    ],
  },
}

function getLayout(poolLen: number): LayoutTemplate {
  const clamped = Math.min(Math.max(poolLen, 4), 8) as 4|5|6|7|8
  return LAYOUTS[clamped] || LAYOUTS[8]
}

function getText(section: SectionData): { length: number } {
  const c = section.content as any
  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      return { length: stripHtml(c.body || '').length }
    case 'fadu_catala': {
      const t = (c.entries || []).map((e: any) => e.title + ' ' + stripHtml(e.body)).join(' ')
      return { length: t.length }
    }
    case 'pagines_grogues':
      return { length: (c.proverbs || []).map((p: any) => p.text + p.author).join(' ').length }
    case 'calaix_sastre': {
      const i = (c.interviews || []).map((x: any) => x.subject + ' ' + stripHtml(x.body)).join(' ')
      const r = (c.reviews || []).map((x: any) => x.title + ' ' + stripHtml(x.body)).join(' ')
      return { length: i.length + r.length }
    }
    case 'full_mural':
      return { length: (c.collages || []).filter((x: any) => x.description).length * 100 }
    case 'ludita': {
      const cw = c.crossword as CrosswordData
      if (cw) {
        const clues = Object.keys(cw.clues.across).length + Object.keys(cw.clues.down).length
        return { length: cw.gridSize * cw.gridSize * 3 + clues * 40 }
      }
      return { length: 300 }
    }
    default:
      return { length: 0 }
  }
}

function calcFontSize(textLen: number, slotW: number, slotH: number): number {
  if (textLen < 10) return 14
  if (slotW < 1 || slotH < 1) return 10
  const f = Math.sqrt((slotW * slotH) / (textLen * 0.55 * 1.45))
  return Math.round(Math.max(8, Math.min(f, 18)))
}

interface SectionLayout {
  section: SectionData
  col: number; row: number; colSpan: number; rowSpan: number
  fontSize: number
  slotW: number; slotH: number
}

function sectionLabel(type: string): string {
  const labels: Record<string, string> = {
    editorial: 'Editorial',
    aclariment_cultural: 'Aclariment Cultural',
    fadu_catala: 'Fadú Català',
    pagines_grogues: 'Pàgines Grogues',
    calaix_sastre: 'Calaix de Sastre',
    visita: 'Visita',
    full_mural: 'Full Mural',
    ludita: 'Ludita',
  }
  return labels[type] || type
}

function buildGrid(cw: CrosswordData): { grid: string[][]; numbers: (number | null)[][] } {
  const n = cw.gridSize
  const g: string[][] = Array.from({ length: n }, () => Array(n).fill(''))
  const nums: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null))

  const allClues: [string, CrosswordClue, string][] = []
  for (const [k, v] of Object.entries(cw.clues.across)) allClues.push([k, v, 'across'])
  for (const [k, v] of Object.entries(cw.clues.down)) allClues.push([k, v, 'down'])
  const used = new Set<string>()

  allClues.sort((a, b) => {
    if (a[1].row !== b[1].row) return a[1].row - b[1].row
    return a[1].col - b[1].col
  })

  for (const [numStr, clue, direction] of allClues) {
    const num = parseInt(numStr, 10)
    const dr = clue.row; const dc = clue.col
    const letters = clue.answer.toUpperCase().split('')
    const dir: [number, number] = direction === 'down' ? [1, 0] : [0, 1]
    for (let k = 0; k < letters.length; k++) {
      const r = dr + k * dir[0]; const c = dc + k * dir[1]
      if (r >= 0 && r < n && c >= 0 && c < n) {
        g[r][c] = letters[k]
        const key = `${r},${c}`
        if (!used.has(key)) { nums[r][c] = num; used.add(key) }
      }
    }
  }
  return { grid: g, numbers: nums }
}

function renderSection(s: SectionData, c: any, fs: number, colSpan: number) {
  const lh = 1.35

  switch (s.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      return <p style={{ lineHeight: lh, margin: 0 }}>{stripHtml(c.body || '')}</p>
    case 'fadu_catala': {
      const entries = c.entries || []
      return <div style={{ lineHeight: lh }}>{entries.map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: `${fs * 0.3}px` }}>
          <strong style={{ fontSize: `${fs + 1}px`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{e.title}</strong>
          <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(e.body)}</p>
        </div>
      ))}</div>
    }
    case 'pagines_grogues': {
      const proverbs = c.proverbs || []
      return <div style={{ lineHeight: lh }}>{proverbs.map((p: any, i: number) => (
        <p key={i} style={{ margin: '0 0 3px' }}>&ldquo;{p.text}&rdquo; <span style={{ opacity: 0.6 }}>— {p.author}</span></p>
      ))}</div>
    }
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
      if (collages.length === 0) return null
      const dc = Math.min(collages.length, colSpan >= 3 ? 3 : 2)
      const thumb = colSpan >= 3 ? 45 : 36
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
      return <CrosswordPreview cw={cw} fs={fs} maxW={colSpan >= 4 ? 450 : colSpan >= 2 ? 280 : 180} />
    }
    default: return null
  }
}

function CrosswordPreview({ cw, fs, maxW }: { cw: CrosswordData; fs: number; maxW: number }) {
  const n = cw.gridSize
  const { grid, numbers } = useMemo(() => buildGrid(cw), [cw])
  const cellSize = Math.min(fs * 2, Math.floor((maxW - 8) / n))
  const fontSize = Math.max(fs * 0.85, 6)

  return <div style={{ display: 'flex', flexDirection: 'column', gap: `${fs * 0.4}px` }}>
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${n}, ${cellSize}px)`, alignSelf: 'center' }}>
      {Array.from({ length: n }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => {
          const val = grid[r]?.[c]; const num = numbers[r]?.[c]
          const isBlack = !val
          return <div key={`${r}-${c}`} style={{
            width: cellSize, height: cellSize, border: '0.5px solid #999',
            background: isBlack ? '#1a1a1a' : '#f2ede4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', fontSize, fontWeight: 700,
            fontFamily: 'Arial, Helvetica, sans-serif', color: '#1a1a1a', textTransform: 'uppercase',
          }}>
            {isBlack ? null : val}
            {num && <span style={{ position: 'absolute', top: 0, left: 1, fontSize: Math.max(fs * 0.45, 5), fontWeight: 400, color: '#555' }}>{num}</span>}
          </div>
        })
      )}
    </div>
    <div style={{ lineHeight: 1.25, fontSize: Math.max(fs * 0.7, 6), textAlign: 'left' }}>
      {Object.entries(cw.clues.across).length > 0 && <div style={{ marginBottom: 2 }}>
        <strong>Horitzontals:</strong> {Object.entries(cw.clues.across).map(([k, v]) => `${k}. ${v.clue}`).join(' · ')}
      </div>}
      {Object.entries(cw.clues.down).length > 0 && <div>
        <strong>Verticals:</strong> {Object.entries(cw.clues.down).map(([k, v]) => `${k}. ${v.clue}`).join(' · ')}
      </div>}
    </div>
  </div>
}

function renderSectionHTML(s: SectionData, c: any, fs: number, colSpan: number): string {
  const lh = 1.35; const label = sectionLabel(s.type)
  const titleSize = colSpan >= 5 ? '17px' : colSpan >= 3 ? '15px' : '13px'

  const body = (() => {
    switch (s.type) {
      case 'editorial': case 'aclariment_cultural': case 'visita':
        return `<p style="line-height:${lh};margin:0">${stripHtml(c.body || '')}</p>`
      case 'fadu_catala': {
        const entries = c.entries || []
        return `<div style="line-height:${lh}">${entries.map((e: any) =>
          `<div style="margin-bottom:${fs*0.3}px"><strong style="font-size:${fs+1}px;text-transform:uppercase;letter-spacing:0.05em">${e.title}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(e.body)}</p></div>`
        ).join('')}</div>`
      }
      case 'pagines_grogues':
        return `<div style="line-height:${lh}">${(c.proverbs || []).map((p: any) =>
          `<p style="margin:0 0 3px">&ldquo;${p.text}&rdquo; <span style="opacity:0.6">— ${p.author}</span></p>`
        ).join('')}</div>`
      case 'calaix_sastre': {
        const interviews = c.interviews || []; const reviews = c.reviews || []
        const parts: string[] = []
        if (interviews.length > 0) parts.push(`<div style="margin-bottom:${fs*0.3}px"><span style="font-size:${fs-1}px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:block;margin-bottom:${fs*0.15}px">Entrevistes</span>${interviews.map((x: any) =>
          `<div style="margin-bottom:${fs*0.25}px"><strong style="font-size:${fs}px">${x.subject}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(x.body)}</p></div>`
        ).join('')}</div>`)
        if (reviews.length > 0) parts.push(`<div><span style="font-size:${fs-1}px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:block;margin-bottom:${fs*0.15}px">Ressenyes</span>${reviews.map((x: any) =>
          `<div style="margin-bottom:${fs*0.25}px"><strong style="font-size:${fs}px">${x.title}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(x.body)}</p></div>`
        ).join('')}</div>`)
        return `<div style="line-height:${lh}">${parts.join('')}</div>`
      }
      case 'full_mural': {
        const collages = c.collages || []
        if (!collages.length) return ''
        const dc = Math.min(collages.length, colSpan >= 3 ? 3 : 2)
        const thumb = colSpan >= 3 ? 45 : 36
        return `<div style="display:flex;flex-direction:column;gap:${fs*0.3}px">${collages.slice(0, dc).map((x: any) =>
          `<div style="display:flex;align-items:center;gap:4px;background-color:rgba(0,0,0,0.03);padding:2px 4px">${x.image ? `<div style="width:${thumb}px;height:${thumb}px;background-image:url('${x.image}');background-size:cover;background-position:center;flex-shrink:0;border:1px solid rgba(0,0,0,0.08)"></div>` : ''}<p style="font-size:${fs-0.5}px;line-height:${lh};margin:0">${x.description}</p></div>`
        ).join('')}${collages.length > dc ? `<p style="font-size:${fs-1}px;font-style:italic;opacity:0.6;margin:0">+${collages.length-dc} col·latges m&eacute;s</p>` : ''}</div>`
      }
      case 'ludita': return ''
      default: return ''
    }
  })()

  return `<div style="grid-column:span ${colSpan};grid-row:span 1;padding:8px 10px;border-right:${colSpan < 8 ? '1px solid #d4cdbe' : 'none'};border-bottom:1px solid #d4cdbe;display:flex;flex-direction:column">
    <div style="font-size:7px;text-transform:uppercase;letter-spacing:0.15em;color:#cc2222;margin-bottom:1px;font-weight:700;font-family:Arial,Helvetica,sans-serif;flex-shrink:0">${label}</div>
    <div style="width:20px;height:2px;background-color:#cc2222;margin-bottom:2px;flex-shrink:0"></div>
    <h2 style="font-size:${titleSize};font-weight:700;line-height:1.15;margin:0 0 2px;color:#1a1a1a;flex-shrink:0">${s.title}</h2>
    <div style="height:1px;background-color:#bbb;margin-bottom:4px;flex-shrink:0"></div>
    <div style="font-size:${fs}px;line-height:1.45;color:#333;text-align:justify;flex:1;word-wrap:break-word;overflow-wrap:break-word">${body}</div>
  </div>`
}

function buildPrintHTML(issue: IssueData, layouts: SectionLayout[]): string {
  const portada = issue.sections.find(s => s.type === 'portada')
  const pc = portada?.content as any
  const portadaTopic = pc?.topic || ''
  const portadaBg = portada?.backgroundImage || ''
  const lt = getLayout(layouts.length)

  const cells = layouts.map(ls => {
    const s = ls.section; const c = s.content as any
    return renderSectionHTML(s, c, ls.fontSize, ls.colSpan)
  }).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  @page { size: A3 landscape; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:420mm; height:297mm; overflow:hidden; background:#f2ede4; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .page { width:420mm; height:297mm; font-family:Georgia,"Times New Roman",Times,serif; color:#1a1a1a; display:flex; flex-direction:column; background:#f2ede4; }
  .masthead { background:#cc2222; padding:18px 40px 10px; text-align:center; flex-shrink:0; }
  .grid { display:grid; grid-template-columns:repeat(8,1fr); flex:1; grid-template-rows:${lt.rowFractions.map(f => `${f}fr`).join(' ')}; }
  .footer { border-top:2px solid #1a1a1a; padding:5px 24px; display:flex; justify-content:space-between; font-size:7px; text-transform:uppercase; letter-spacing:0.1em; color:#888; font-family:Arial,Helvetica,sans-serif; flex-shrink:0; }
</style></head>
<body><div class="page">
  <div class="masthead">
    ${portadaBg ? `<div style="position:absolute;inset:0;opacity:0.03;background-image:url('${portadaBg}');background-size:cover;background-position:center;pointer-events:none"></div>` : ''}
    <h1 style="font-size:72px;font-weight:900;letter-spacing:-0.03em;line-height:1;color:#fff;font-family:'Times New Roman',Times,serif">XERRAC!</h1>
    <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin-top:2px">Revista d&apos;aclariment cultural</div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;font-size:8px;text-transform:uppercase;letter-spacing:0.08em;color:#666;padding:4px 24px;border-bottom:3px double #1a1a1a;font-family:Arial,Helvetica,sans-serif;flex-shrink:0">
    <span>Any ${new Date(issue.date).getFullYear()-2024} &middot; N&uacute;m. ${String(issue.number).padStart(2,'0')}</span>
    <span style="font-weight:700;color:#1a1a1a;font-size:9px">${issue.title}</span>
    <span>${new Date(issue.date).toLocaleDateString('ca-ES',{year:'numeric',month:'long'})}</span>
  </div>
  ${portadaTopic ? `<div style="text-align:center;padding:6px 24px;border-bottom:1px solid #ccc;font-size:18px;font-weight:700;font-style:italic;color:#333;flex-shrink:0">${portadaTopic}</div>` : ''}
  <div class="grid">${cells}</div>
  <div class="footer">
    <span>Xerrac! — Revista d&apos;aclariment cultural</span>
    <span>Compilat digitalment des de xerrac.cat</span>
  </div>
</div></body></html>`
}

export function TabloidPreview({ issue }: { issue: IssueData }) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const layout = useMemo(() => {
    const pool = issue.sections
      .filter(s => s.type !== 'portada')
      .slice(0, 8)
      .map(s => ({ section: s, ...getText(s) }))
      .sort((a, b) => b.length - a.length)

    const lt = getLayout(pool.length)
    const rowTotal = lt.rowFractions.reduce((a, b) => a + b, 0)

    const layouts: SectionLayout[] = pool.map((item, idx) => {
      const slot = lt.slots[idx] || { col: 0, row: lt.rowFractions.length - 1, colSpan: 8, rowSpan: 1 }
      const rowH = (lt.rowFractions[slot.row] / rowTotal) * SECT_H
      const colW = (slot.colSpan / COLS) * (PAGE_W - 28) - 20
      const slotH = rowH - 60
      const fontSize = calcFontSize(item.length, colW, slotH)
      return { section: item.section, ...slot, fontSize, slotW: colW, slotH }
    })

    return { layouts, rowFractions: lt.rowFractions, rowTotal }
  }, [issue])

  useEffect(() => {
    function updateScale() {
      const vw = window.innerWidth; const vh = window.innerHeight
      setScale(Math.min(vw / PAGE_W, vh / PAGE_H) * 0.97)
    }
    updateScale(); window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  function handlePrint() {
    const html = buildPrintHTML(issue, layout.layouts)
    const win = window.open('', '_blank')
    if (!win) { alert('Permet les finestres emergents per exportar el PDF.'); return }
    win.document.write(html); win.document.close(); win.focus(); win.print()
  }

  const rowsCSS = layout.rowFractions.map(f => `${f}fr`).join(' ')

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#dad3c7', overflow: 'hidden',
    }}>
      <button onClick={handlePrint}
        className="no-print"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 50, background: '#000', color: '#fff',
          fontSize: 11, padding: '8px 20px', border: 'none', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Arial, sans-serif',
        }}>
        Exportar PDF
      </button>

      <div ref={pageRef} style={{
        width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: 'center center',
        flexShrink: 0,
        backgroundColor: '#f2ede4', color: '#1a1a1a', fontFamily: 'Georgia, "Times New Roman", Times, serif',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{ backgroundColor: '#cc2222', padding: '18px 40px 10px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff', fontFamily: '"Times New Roman", Times, serif' }}>
            XERRAC<em style={{ fontStyle: 'normal' }}>!</em>
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            Revista d&apos;aclariment cultural
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666',
          padding: '4px 24px', borderBottom: '3px double #1a1a1a', fontFamily: 'Arial, Helvetica, sans-serif', flexShrink: 0,
        }}>
          <span>Any {new Date(issue.date).getFullYear() - 2024} &middot; N&uacute;m. {String(issue.number).padStart(2, '0')}</span>
          <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 9 }}>{issue.title}</span>
          <span>{new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: rowsCSS,
          flex: 1,
        }}>
          {layout.layouts.map((ls) => {
            const s = ls.section; const fs = ls.fontSize; const c = s.content as any
            return (
              <div key={s.id} style={{
                gridColumn: `${ls.col + 1} / span ${ls.colSpan}`,
                gridRow: `${ls.row + 1} / span ${ls.rowSpan}`,
                padding: '8px 10px',
                borderRight: ls.col + ls.colSpan < COLS ? '1px solid #d4cdbe' : 'none',
                borderBottom: ls.row < layout.rowFractions.length - 1 ? '1px solid #d4cdbe' : 'none',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#cc2222',
                  marginBottom: 1, fontWeight: 700, fontFamily: 'Arial, Helvetica, sans-serif', flexShrink: 0,
                }}>
                  {sectionLabel(s.type)}
                </div>
                <div style={{ width: 20, height: 2, backgroundColor: '#cc2222', marginBottom: 2, flexShrink: 0 }} />
                <h2 style={{
                  fontSize: ls.colSpan >= 5 ? '17px' : ls.colSpan >= 3 ? '15px' : '13px',
                  fontWeight: 700, lineHeight: 1.15, margin: '0 0 2px', color: '#1a1a1a', flexShrink: 0,
                }}>
                  {s.title}
                </h2>
                <div style={{ height: 1, backgroundColor: '#bbb', marginBottom: 4, flexShrink: 0 }} />
                <div style={{
                  fontSize: fs, lineHeight: 1.45, color: '#333', textAlign: 'justify',
                  flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word',
                }}>
                  {renderSection(s, c, fs, ls.colSpan)}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          borderTop: '2px solid #1a1a1a', padding: '5px 24px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888', fontFamily: 'Arial, Helvetica, sans-serif', flexShrink: 0,
        }}>
          <span>Xerrac! &mdash; Revista d&apos;aclariment cultural</span>
          <span>Compilat digitalment des de xerrac.cat</span>
        </div>
      </div>
    </div>
  )
}
