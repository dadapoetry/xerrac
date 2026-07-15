import { IssueData, SectionData, CrosswordData, CrosswordClue } from '@/types'
import { LayoutSlot } from '@/lib/layoutEngine'

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function sectionLabel(type: string): string {
  const labels: Record<string, string> = {
    editorial: 'Editorial', aclariment_cultural: 'Aclariment Cultural', fadu_catala: 'Fadú Català',
    pagines_grogues: 'Pàgines Grogues', calaix_sastre: 'Calaix de Sastre', visita: 'Visita',
    full_mural: 'Full Mural', ludita: 'Ludita',
  }
  return labels[type] || type
}

export function buildGrid(cw: CrosswordData, showSolution = true): { grid: string[][]; numbers: (number | null)[][] } {
  const n = cw.gridSize
  const g: string[][] = Array.from({ length: n }, () => Array(n).fill(''))
  const covered: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false))
  const nums: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null))
  const allClues: [string, CrosswordClue, string][] = []
  for (const [k, v] of Object.entries(cw.clues.across)) allClues.push([k, v, 'across'])
  for (const [k, v] of Object.entries(cw.clues.down)) allClues.push([k, v, 'down'])
  allClues.sort((a, b) => { if (a[1].row !== b[1].row) return a[1].row - b[1].row; return a[1].col - b[1].col })
  const used = new Set<string>()
  for (const [numStr, clue, direction] of allClues) {
    const num = parseInt(numStr, 10)
    const dr = clue.row; const dc = clue.col
    const letters = clue.answer.toUpperCase().split('')
    const dir: [number, number] = direction === 'down' ? [1, 0] : [0, 1]
    for (let k = 0; k < letters.length; k++) {
      const r = dr + k * dir[0]; const c = dc + k * dir[1]
      if (r >= 0 && r < n && c >= 0 && c < n) {
        covered[r][c] = true
        if (showSolution) {
          if (!g[r][c]) g[r][c] = letters[k]
        }
        const key = `${r},${c}`
        if (!used.has(key)) { nums[r][c] = num; used.add(key) }
      }
    }
  }
  if (!showSolution) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (covered[r][c]) g[r][c] = ' '
      }
    }
  }
  return { grid: g, numbers: nums }
}

function renderSectionHTML(s: SectionData, c: any, fs: number, colSpan: number, accentColor: string): string {
  const lh = 1.35; const label = sectionLabel(s.type)
  const titleSize = colSpan >= 5 ? '16px' : colSpan >= 3 ? '14px' : colSpan >= 2 ? '12px' : '11px'

  const body = (() => {
    switch (s.type) {
      case 'editorial': case 'aclariment_cultural':
        return `<p style="line-height:${lh};margin:0">${stripHtml(c.body || '')}</p>`
      case 'visita':
        return `<div><p style="line-height:${lh};margin:0">${stripHtml(c.body || '')}</p>${c.source ? `<p style="font-size:${fs-1}px;font-style:italic;opacity:0.6;text-align:right;margin-top:3px">Font: ${c.source}</p>` : ''}</div>`
      case 'fadu_catala': return `<div style="line-height:${lh}">${(c.entries || []).map((e: any) =>
        `<div style="margin-bottom:${fs*0.3}px"><strong style="font-size:${fs+1}px;text-transform:uppercase;letter-spacing:0.05em">${e.title}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(e.body)}</p></div>`
      ).join('')}</div>`
      case 'pagines_grogues': return `<div style="line-height:${lh}">${(c.proverbs || []).map((p: any) =>
        `<p style="margin:0 0 3px">&ldquo;${p.text}&rdquo; <span style="opacity:0.6">— ${p.author}</span></p>`
      ).join('')}</div>`
      case 'calaix_sastre': {
        const interviews = c.interviews || []; const reviews = c.reviews || []; const parts: string[] = []
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
        const dc = Math.min(collages.length, colSpan >= 3 ? 3 : 2); const thumb = colSpan >= 3 ? 45 : 36
        return `<div style="display:flex;flex-direction:column;gap:${fs*0.3}px">${collages.slice(0, dc).map((x: any) =>
          `<div style="display:flex;align-items:center;gap:4px;background-color:rgba(0,0,0,0.03);padding:2px 4px"><p style="font-size:${fs-0.5}px;line-height:${lh};margin:0">${x.description}</p></div>`
        ).join('')}${collages.length > dc ? `<p style="font-size:${fs-1}px;font-style:italic;opacity:0.6;margin:0">+${collages.length-dc} col·latges m&eacute;s</p>` : ''}</div>`
      }
      case 'ludita': {
        const cw = c.crossword as CrosswordData
        if (!cw) return ''
        const n = cw.gridSize; const { grid, numbers } = buildGrid(cw, true)
        const maxW = colSpan >= 4 ? 420 : colSpan >= 2 ? 240 : 160
        const cellSize = Math.min(fs * 1.8, Math.floor((maxW - 8) / n)); const fontSize = Math.max(fs * 0.8, 5); const cluesSize = Math.max(fs * 0.65, 5)
        let h = `<div style="display:flex;flex-direction:column;gap:3px"><div style="display:inline-grid;grid-template-columns:repeat(${n},${cellSize}px);align-self:center">`
        for (let r = 0; r < n; r++) { for (let c = 0; c < n; c++) {
          const val = grid[r]?.[c]; const num = numbers[r]?.[c]; const isBlack = !val
          h += `<div style="width:${cellSize}px;height:${cellSize}px;border:0.5px solid #999;background:${isBlack?'#1a1a1a':'#f2ede4'};display:flex;align-items:center;justify-content:center;position:relative;font-size:${fontSize}px;font-weight:700;color:#1a1a1a;text-transform:uppercase">${isBlack?'':val}${num?`<span style="position:absolute;top:0;left:1px;font-size:${Math.max(fs*0.4,4)}px;font-weight:400;color:#555">${num}</span>`:''}</div>`
        }}
        h += '</div>'
        h += `<div style="line-height:1.2;font-size:${cluesSize}px;text-align:left">`
        if (Object.entries(cw.clues.across).length > 0) h += `<div style="margin-bottom:1px"><strong>Horitzontals:</strong> ${Object.entries(cw.clues.across).map(([k,v])=>`${k}.${v.clue}`).join(' &middot; ')}</div>`
        if (Object.entries(cw.clues.down).length > 0) h += `<div><strong>Verticals:</strong> ${Object.entries(cw.clues.down).map(([k,v])=>`${k}.${v.clue}`).join(' &middot; ')}</div>`
        h += '</div></div>'
        return h
      }
      default: return ''
    }
  })()

  return `<div style="grid-column:span ${colSpan};grid-row:span 1;padding:10px 12px;border-right:${colSpan < 8 ? '1px solid #ddd3c4' : 'none'};border-bottom:1px solid #ddd3c4;display:flex;flex-direction:column">
    <h2 style="font-size:${titleSize};font-weight:800;line-height:1.2;margin:0 0 1px;color:#1a1a1a;text-transform:uppercase;letter-spacing:-0.02em;flex-shrink:0">${s.title}</h2>
    <div style="height:1px;background-color:#d4cdbe;margin-bottom:4px;flex-shrink:0"></div>
    <div style="font-size:${fs}px;line-height:1.55;color:#2a2a2a;text-align:justify;flex:1;word-wrap:break-word;overflow-wrap:break-word">${body}</div>
  </div>`
}

export function buildPrintHTML(issue: IssueData, placed: LayoutSlot[], rowFractions: number[], issn?: string): string {
  const accentColor = issue.accentColor || '#ef4444'
  const portada = issue.sections.find(s => s.type === 'portada')
  const pc = portada?.content as any
  const portadaTopic = pc?.topic || ''
  const cells = placed.map(p => renderSectionHTML(p.section, p.section.content as any, p.fontSize, p.colSpan, accentColor)).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800;900&display=swap" rel="stylesheet">
<style>
  @page { size: A3 landscape; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:420mm; height:297mm; overflow:hidden; background:#f2ede4; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .page { width:420mm; height:297mm; font-family:Inter,Arial,Helvetica,sans-serif; color:#1a1a1a; display:flex; flex-direction:column; background:#f2ede4; position:relative; }
  .masthead { background:#000; padding:12px 40px 0; text-align:center; flex-shrink:0; position:relative; z-index:2; }
  .grid { display:grid; grid-template-columns:repeat(8,1fr); flex:1; grid-template-rows:${rowFractions.map(f => `${f.toFixed(1)}fr`).join(' ')}; }
  .footer { border-top:1px solid #1a1a1a; padding:6px 24px; display:flex; justify-content:space-between; font-size:6px; text-transform:uppercase; letter-spacing:0.15em; color:#999; flex-shrink:0; }
</style></head>
<body><div class="page">
  <div style="display:flex;flex-direction:column;flex:1;position:relative;z-index:1">
  <div class="masthead">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:7px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.5)">\n      <span>N&uacute;m. <span style="font-weight:700;color:#fff;letter-spacing:0.05em">${String(issue.number).padStart(2,'0')}</span></span>\n      <span style="letter-spacing:0.08em;color:rgba(255,255,255,0.5)">${new Date(issue.date).toLocaleDateString('ca-ES',{year:'numeric',month:'long'})}</span>\n    </div>
    ${portadaTopic ? `<div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${accentColor};margin-bottom:4px;font-weight:700">${portadaTopic}</div>` : ''}
    <h1 style="font-size:78px;font-weight:900;letter-spacing:-0.05em;line-height:1;color:#fff">XERRAC<span style="color:${accentColor}">!</span></h1>
    ${!portadaTopic ? '<div style="font-size:8px;letter-spacing:0.4em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:3px;font-weight:300">Revista d&apos;aclariment cultural</div>' : ''}
  </div>
  <svg width="100%" height="10" style="display:block;flex-shrink:0;margin-top:-6px"><defs><pattern id="saw" width="20" height="10" patternUnits="userSpaceOnUse"><path d="M0,0 L10,10 L20,0 Z" fill="#000" /></pattern></defs><rect width="100%" height="10" fill="url(#saw)" /></svg>
  <div class="grid">${cells}</div>
  <div style="position:absolute;bottom:28px;right:8px;background:${accentColor};color:#fff;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:5px 10px;z-index:3">Ha quedat clar?</div>
  <div class="footer">
    <span>Xerrac!<span style="color:${accentColor};margin:0 6px">◆</span>Revista d&apos;aclariment cultural</span>
    <span>${issn || 'Compilat des de xerrac.cat'}</span>
  </div>
</div>
</div></body></html>`
}
