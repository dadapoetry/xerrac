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
      return { length: (c.collages || []).filter((x: any) => x.description).length * 80 }
    case 'ludita':
      return { length: 300 }
    default:
      return { length: 0 }
  }
}

function calcFontSize(textLen: number, colSpan: number): number {
  if (textLen < 10) return 12
  const inside = PAGE_W - 28
  const colW = inside * (colSpan / COLS) - 28
  const availH = SECT_H - 70
  const f = Math.sqrt((colW * availH) / (textLen * 0.55 * 1.5))
  return Math.round(Math.max(7, Math.min(f, 16)))
}

function allocateCols(pool: { section: SectionData; length: number }[]): number[] {
  const totalLen = Math.max(pool.reduce((s, i) => s + i.length, 0), 1)
  const raw = pool.map(item => Math.max(1, Math.round((item.length / totalLen) * COLS)))
  let sum = raw.reduce((a, b) => a + b, 0)

  while (sum > COLS) {
    const maxIdx = raw.indexOf(Math.max(...raw))
    if (raw[maxIdx] > 1) { raw[maxIdx]--; sum-- }
    else {
      let anyBigger = false
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] > 1) { raw[i]--; sum--; anyBigger = true; break }
      }
      if (!anyBigger) break
    }
  }
  while (sum < COLS) {
    const maxIdx = raw.indexOf(Math.max(...raw))
    raw[maxIdx]++; sum++
  }
  return raw
}

interface Placed {
  section: SectionData
  colSpan: number
  fontSize: number
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

  const allClues = [
    ...Object.entries(cw.clues.across).map(([k, v]) => [k, v, 'across'] as const),
    ...Object.entries(cw.clues.down).map(([k, v]) => [k, v, 'down'] as const),
  ] as ([string, CrosswordClue, string])[]

  const used = new Set<string>()

  allClues.sort((a, b) => {
    if (a[1].row !== b[1].row) return a[1].row - b[1].row
    return a[1].col - b[1].col
  })

  for (const [numStr, clue, direction] of allClues) {
    const num = parseInt(numStr, 10)
    const dr = clue.row
    const dc = clue.col
    const letters = clue.answer.toUpperCase().split('')
    const dir: [number, number] = direction === 'down' ? [1, 0] : [0, 1]

    for (let k = 0; k < letters.length; k++) {
      const r = dr + k * dir[0]
      const c = dc + k * dir[1]
      if (r >= 0 && r < n && c >= 0 && c < n) {
        g[r][c] = letters[k]
        const key = `${r},${c}`
        if (!used.has(key)) {
          nums[r][c] = num
          used.add(key)
        }
      }
    }
  }

  return { grid: g, numbers: nums }
}

function renderCrosswordHTML(cw: CrosswordData, fs: number): string {
  const n = cw.gridSize
  const { grid, numbers } = buildGrid(cw)

  const cellSize = fs * 2.4
  const fontSize = fs * 1.1

  const rows: string[] = []
  for (let r = 0; r < n; r++) {
    const cells: string[] = []
    for (let c = 0; c < n; c++) {
      const val = grid[r][c]
      const num = numbers[r][c]
      const isBlack = !val
      cells.push(`<div style="
        width:${cellSize}px;height:${cellSize}px;
        border:0.5px solid #999;
        background:${isBlack ? '#1a1a1a' : '#f2ede4'};
        display:flex;align-items:center;justify-content:center;
        position:relative;font-size:${fontSize}px;font-weight:700;
        font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;
        text-transform:uppercase
      ">${isBlack ? '' : val}
      ${num ? `<span style="position:absolute;top:1px;left:2px;font-size:${fs*0.55}px;font-weight:400;color:#555">${num}</span>` : ''}
      </div>`)
    }
    rows.push(`<div style="display:flex">${cells.join('')}</div>`)
  }

  const cluesHTML = () => {
    const across = Object.entries(cw.clues.across)
    const down = Object.entries(cw.clues.down)
    const parts: string[] = []
    if (across.length > 0) {
      parts.push(`<div><strong style="font-size:${fs*0.9}px">Horitzontals:</strong><br/>${across.map(([k, v]) =>
        `<span style="font-size:${fs*0.8}px">${k}. ${v.clue}</span>`
      ).join('<br/>')}</div>`)
    }
    if (down.length > 0) {
      parts.push(`<div><strong style="font-size:${fs*0.9}px">Verticals:</strong><br/>${down.map(([k, v]) =>
        `<span style="font-size:${fs*0.8}px">${k}. ${v.clue}</span>`
      ).join('<br/>')}</div>`)
    }
    return parts.join('<br/><br/>')
  }

  return `<div style="display:flex;flex-direction:column;gap:${fs*0.6}px">
    ${rows.join('')}
    <div style="line-height:1.3">${cluesHTML()}</div>
  </div>`
}

function renderHTML(s: SectionData, c: any, fs: number, colSpan: number): string {
  const lh = 1.35
  const label = sectionLabel(s.type)
  const titleSize = colSpan >= 4 ? '16px' : colSpan >= 2 ? '14px' : '12px'

  let body = ''

  switch (s.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      body = `<p style="line-height:${lh};margin:0">${stripHtml(c.body || '')}</p>`
      break

    case 'fadu_catala': {
      const entries = c.entries || []
      body = `<div style="line-height:${lh}">${entries.map((e: any) =>
        `<div style="margin-bottom:${fs * 0.4}px"><strong style="font-size:${fs + 1}px;text-transform:uppercase;letter-spacing:0.05em">${e.title}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(e.body)}</p></div>`
      ).join('')}</div>`
      break
    }

    case 'pagines_grogues': {
      const proverbs = c.proverbs || []
      body = `<div style="line-height:${lh}">${proverbs.map((p: any) =>
        `<p style="margin-bottom:${fs * 0.3}px;margin:0 0 ${fs*0.3}px">&ldquo;${p.text}&rdquo; <span style="opacity:0.6">— ${p.author}</span></p>`
      ).join('')}</div>`
      break
    }

    case 'calaix_sastre': {
      const interviews = c.interviews || []
      const reviews = c.reviews || []
      const parts: string[] = []
      if (interviews.length > 0) {
        parts.push(`<div style="margin-bottom:${fs * 0.4}px"><span style="font-size:${fs - 1}px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:block;margin-bottom:${fs * 0.2}px">Entrevistes</span>${interviews.map((x: any) =>
          `<div style="margin-bottom:${fs * 0.3}px"><strong style="font-size:${fs}px">${x.subject}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(x.body)}</p></div>`
        ).join('')}</div>`)
      }
      if (reviews.length > 0) {
        parts.push(`<div><span style="font-size:${fs - 1}px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:block;margin-bottom:${fs * 0.2}px">Ressenyes</span>${reviews.map((x: any) =>
          `<div style="margin-bottom:${fs * 0.3}px"><strong style="font-size:${fs}px">${x.title}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(x.body)}</p></div>`
        ).join('')}</div>`)
      }
      body = `<div style="line-height:${lh}">${parts.join('')}</div>`
      break
    }

    case 'full_mural': {
      const collages = c.collages || []
      if (collages.length === 0) return ''
      const displayCount = Math.min(collages.length, colSpan >= 3 ? 4 : 2)
      const thumb = colSpan >= 3 ? 50 : 40
      body = `<div style="display:flex;flex-direction:column;gap:${fs * 0.4}px">${collages.slice(0, displayCount).map((x: any) =>
        `<div style="display:flex;align-items:center;gap:5px;background-color:rgba(0,0,0,0.03);padding:3px 5px">${x.image ? `<div style="width:${thumb}px;height:${thumb}px;background-image:url('${x.image}');background-size:cover;background-position:center;flex-shrink:0;border:1px solid rgba(0,0,0,0.08)"></div>` : ''}<p style="font-size:${fs - 0.5}px;line-height:${lh};margin:0">${x.description}</p></div>`
      ).join('')}${collages.length > displayCount ? `<p style="font-size:${fs - 1}px;font-style:italic;opacity:0.6;margin:0">+${collages.length - displayCount} col·latges m&eacute;s</p>` : ''}</div>`
      break
    }

    case 'ludita': {
      const cw = c.crossword as CrosswordData
      if (!cw) return ''
      body = renderCrosswordHTML(cw, fs)
      break
    }
  }

  return `<div style="grid-column:span ${colSpan};padding:10px 10px;border-right:${colSpan < COLS ? '1px solid #d4cdbe' : 'none'};display:flex;flex-direction:column;justify-content:flex-start;min-height:100%">
    <div style="font-size:7px;text-transform:uppercase;letter-spacing:0.15em;color:#cc2222;margin-bottom:2px;font-weight:700;font-family:Arial,Helvetica,sans-serif">${label}</div>
    <div style="width:24px;height:2px;background-color:#cc2222;margin-bottom:3px;flex-shrink:0"></div>
    <h2 style="font-size:${titleSize};font-weight:700;line-height:1.15;margin:0 0 4px;color:#1a1a1a;flex-shrink:0">${s.title}</h2>
    <div style="height:1px;background-color:#bbb;margin-bottom:5px;flex-shrink:0"></div>
    <div style="font-size:${fs}px;line-height:1.45;color:#333;text-align:justify;flex:1;word-wrap:break-word;overflow-wrap:break-word">${body}</div>
  </div>`
}

function buildPrintHTML(issue: IssueData, placed: Placed[]): string {
  const portada = issue.sections.find(s => s.type === 'portada')
  const pc = portada?.content as any
  const portadaTopic = pc?.topic || ''
  const portadaBg = portada?.backgroundImage || ''

  const cells = placed.map(p => renderHTML(p.section, p.section.content as any, p.fontSize, p.colSpan)).join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A3 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 420mm; height: 297mm; overflow: hidden; background: #f2ede4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 420mm; height: 297mm; font-family: Georgia, "Times New Roman", Times, serif; color: #1a1a1a; display: flex; flex-direction: column; background: #f2ede4; }
  .masthead { background: #cc2222; padding: 18px 40px 10px; text-align: center; flex-shrink: 0; }
  .masthead h1 { font-size: 72px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; color: #fff; font-family: "Times New Roman", Times, serif; }
  .masthead .sub { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin-top: 2px; }
  .info { display: flex; justify-content: space-between; align-items: center; font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; padding: 4px 24px; border-bottom: 3px double #1a1a1a; font-family: Arial, Helvetica, sans-serif; flex-shrink: 0; }
  .topic { text-align: center; padding: 6px 24px; border-bottom: 1px solid #ccc; font-size: 18px; font-weight: 700; font-style: italic; color: #333; flex-shrink: 0; }
  .grid { display: grid; grid-template-columns: repeat(8, 1fr); flex: 1; }
  .footer { border-top: 2px solid #1a1a1a; padding: 5px 24px; display: flex; justify-content: space-between; font-size: 7px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; font-family: Arial, Helvetica, sans-serif; flex-shrink: 0; }
</style>
</head>
<body>
<div class="page">
  <div class="masthead">
    ${portadaBg ? `<div style="position:absolute;inset:0;opacity:0.03;background-image:url('${portadaBg}');background-size:cover;background-position:center;pointer-events:none"></div>` : ''}
    <h1>XERRAC!</h1>
    <div class="sub">Revista d&apos;aclariment cultural</div>
  </div>
  <div class="info">
    <span>Any ${new Date(issue.date).getFullYear() - 2024} &middot; N&uacute;m. ${String(issue.number).padStart(2, '0')}</span>
    <span style="font-weight:700;color:#1a1a1a;font-size:9px">${issue.title}</span>
    <span>${new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
  </div>
  ${portadaTopic ? `<div class="topic">${portadaTopic}</div>` : ''}
  <div class="grid">${cells}</div>
  <div class="footer">
    <span>Xerrac! — Revista d&apos;aclariment cultural</span>
    <span>Compilat digitalment des de xerrac.cat</span>
  </div>
</div>
</body>
</html>`
}

export function TabloidPreview({ issue }: { issue: IssueData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const layout = useMemo(() => {
    const pool = issue.sections
      .filter(s => s.type !== 'portada')
      .slice(0, COLS)
      .map(s => ({ section: s, ...getText(s) }))
      .sort((a, b) => b.length - a.length)

    const colSpans = allocateCols(pool)
    const placed: Placed[] = pool.map((item, idx) => ({
      section: item.section,
      colSpan: colSpans[idx],
      fontSize: calcFontSize(item.length, colSpans[idx]),
    }))

    return { placed }
  }, [issue])

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const sx = (vw - 48) / PAGE_W
      const sy = (vh - 64) / PAGE_H
      setScale(Math.min(sx, sy))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  function handlePrint() {
    const html = buildPrintHTML(issue, layout.placed)
    const win = window.open('', '_blank')
    if (!win) { alert('Permet les finestres emergents per exportar el PDF.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center no-print" style={{ backgroundColor: '#dad3c7', overflow: 'hidden' }}>
      <button
        onClick={handlePrint}
        className="fixed top-4 right-4 z-50 bg-black text-white text-xs px-4 py-2 uppercase tracking-wider hover:bg-gray-800 transition-colors no-print"
      >
        Exportar PDF
      </button>

      <div
        ref={pageRef}
        style={{
          width: `${PAGE_W}px`,
          height: `${PAGE_H}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          overflow: 'hidden',
          backgroundColor: '#f2ede4',
          color: '#1a1a1a',
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ backgroundColor: '#cc2222', padding: '18px 40px 10px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontSize: '72px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
            color: '#ffffff', fontFamily: '"Times New Roman", Times, serif',
          }}>
            XERRAC<em style={{ fontStyle: 'normal' }}>!</em>
          </div>
          <div style={{
            fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)', marginTop: '2px',
          }}>
            Revista d&apos;aclariment cultural
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em',
          color: '#666', padding: '4px 24px',
          borderBottom: '3px double #1a1a1a',
          fontFamily: 'Arial, Helvetica, sans-serif', flexShrink: 0,
        }}>
          <span>Any {new Date(issue.date).getFullYear() - 2024} &middot; Núm. {String(issue.number).padStart(2, '0')}</span>
          <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '9px' }}>{issue.title}</span>
          <span>{new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          flex: 1,
        }}>
          {layout.placed.map((item) => {
            const s = item.section
            const fs = item.fontSize
            const c = s.content as any

            return (
              <div
                key={s.id}
                style={{
                  gridColumn: `span ${item.colSpan}`,
                  padding: '10px 10px',
                  borderRight: item.colSpan < COLS ? '1px solid #d4cdbe' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#cc2222', marginBottom: '2px', fontWeight: 700,
                  fontFamily: 'Arial, Helvetica, sans-serif', flexShrink: 0,
                }}>
                  {sectionLabel(s.type)}
                </div>

                <div style={{
                  width: '24px', height: '2px', backgroundColor: '#cc2222', marginBottom: '3px', flexShrink: 0,
                }} />

                <h2 style={{
                  fontSize: item.colSpan >= 4 ? '16px' : item.colSpan >= 2 ? '14px' : '12px',
                  fontWeight: 700, lineHeight: 1.15, margin: '0 0 4px', color: '#1a1a1a', flexShrink: 0,
                }}>
                  {s.title}
                </h2>

                <div style={{ height: '1px', backgroundColor: '#bbb', marginBottom: '5px', flexShrink: 0 }} />

                <div style={{
                  fontSize: `${fs}px`,
                  lineHeight: 1.45,
                  color: '#333',
                  textAlign: 'justify',
                  flex: 1,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  {renderSection(s, c, fs, item.colSpan)}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          borderTop: '2px solid #1a1a1a', padding: '5px 24px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888', fontFamily: 'Arial, Helvetica, sans-serif', flexShrink: 0,
        }}>
          <span>Xerrac! — Revista d&apos;aclariment cultural</span>
          <span>Compilat digitalment des de xerrac.cat</span>
        </div>
      </div>
    </div>
  )
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
      return (
        <div style={{ lineHeight: lh }}>
          {entries.map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: `${fs * 0.4}px` }}>
              <strong style={{ fontSize: `${fs + 1}px`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{e.title}</strong>
              <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(e.body)}</p>
            </div>
          ))}
        </div>
      )
    }

    case 'pagines_grogues': {
      const proverbs = c.proverbs || []
      return (
        <div style={{ lineHeight: lh }}>
          {proverbs.map((p: any, i: number) => (
            <p key={i} style={{ margin: '0 0 4px' }}>
              &ldquo;{p.text}&rdquo; <span style={{ opacity: 0.6 }}>— {p.author}</span>
            </p>
          ))}
        </div>
      )
    }

    case 'calaix_sastre': {
      const interviews = c.interviews || []
      const reviews = c.reviews || []
      return (
        <div style={{ lineHeight: lh }}>
          {interviews.length > 0 && (
            <div style={{ marginBottom: `${fs * 0.4}px` }}>
              <span style={{ fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: `${fs * 0.2}px` }}>Entrevistes</span>
              {interviews.map((x: any, i: number) => (
                <div key={`i${i}`} style={{ marginBottom: `${fs * 0.3}px` }}>
                  <strong style={{ fontSize: `${fs}px` }}>{x.subject}</strong>
                  <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(x.body)}</p>
                </div>
              ))}
            </div>
          )}
          {reviews.length > 0 && (
            <div>
              <span style={{ fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: `${fs * 0.2}px` }}>Ressenyes</span>
              {reviews.map((x: any, i: number) => (
                <div key={`r${i}`} style={{ marginBottom: `${fs * 0.3}px` }}>
                  <strong style={{ fontSize: `${fs}px` }}>{x.title}</strong>
                  <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(x.body)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'full_mural': {
      const collages = c.collages || []
      if (collages.length === 0) return null
      const displayCount = Math.min(collages.length, colSpan >= 3 ? 4 : 2)
      const thumb = colSpan >= 3 ? 50 : 40
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${fs * 0.4}px` }}>
          {collages.slice(0, displayCount).map((x: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(0,0,0,0.03)', padding: '3px 5px' }}>
              {x.image && (
                <div style={{ width: `${thumb}px`, height: `${thumb}px`, backgroundImage: `url("${x.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
              )}
              <p style={{ fontSize: `${fs - 0.5}px`, lineHeight: lh, margin: 0 }}>{x.description}</p>
            </div>
          ))}
          {collages.length > displayCount && (
            <p style={{ fontSize: `${fs - 1}px`, fontStyle: 'italic', opacity: 0.6, margin: 0 }}>
              +{collages.length - displayCount} col·latges més
            </p>
          )}
        </div>
      )
    }

    case 'ludita': {
      const cw = c.crossword as CrosswordData
      if (!cw) return <p style={{ fontStyle: 'italic', lineHeight: lh, margin: 0 }}>No hi ha crucigrama disponible</p>
      return <CrosswordPreview cw={cw} fs={fs} />
    }

    default:
      return null
  }
}

function CrosswordPreview({ cw, fs }: { cw: CrosswordData; fs: number }) {
  const n = cw.gridSize
  const { grid, numbers } = useMemo(() => buildGrid(cw), [cw])

  const cellSize = fs * 2.4
  const fontSize = fs * 1.1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${fs * 0.6}px`, alignItems: 'center' }}>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${n}, ${cellSize}px)` }}>
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((_, c) => {
            const val = grid[r]?.[c]
            const num = numbers[r]?.[c]
            const isBlack = !val
            return (
              <div key={`${r}-${c}`} style={{
                width: cellSize, height: cellSize,
                border: '0.5px solid #999',
                background: isBlack ? '#1a1a1a' : '#f2ede4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                fontSize, fontWeight: 700,
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#1a1a1a', textTransform: 'uppercase',
              }}>
                {isBlack ? null : val}
                {num && (
                  <span style={{
                    position: 'absolute', top: 1, left: 2,
                    fontSize: fs * 0.55, fontWeight: 400, color: '#555',
                  }}>
                    {num}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
      <div style={{ width: '100%', lineHeight: 1.3, textAlign: 'left' }}>
        {Object.entries(cw.clues.across).length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: fs * 0.9 }}>Horitzontals:</strong><br />
            {Object.entries(cw.clues.across).map(([k, v]) => (
              <span key={`a-${k}`} style={{ fontSize: fs * 0.8, display: 'block' }}>
                {k}. {v.clue}
              </span>
            ))}
          </div>
        )}
        {Object.entries(cw.clues.down).length > 0 && (
          <div>
            <strong style={{ fontSize: fs * 0.9 }}>Verticals:</strong><br />
            {Object.entries(cw.clues.down).map(([k, v]) => (
              <span key={`d-${k}`} style={{ fontSize: fs * 0.8, display: 'block' }}>
                {k}. {v.clue}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
