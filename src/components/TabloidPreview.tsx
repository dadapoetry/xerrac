'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { IssueData, SectionData } from '@/types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

const PAGE_W = 1580
const PAGE_H = 1120
const COLS = 8
const MASTHEAD_H = 148
const FOOTER_H = 32
const SECT_H = PAGE_H - MASTHEAD_H - FOOTER_H
const OVERHEAD = 65

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
      return { length: (c.collages || []).map((x: any) => x.description).join(' ').length }
    case 'ludita':
      return { length: 60 }
    default:
      return { length: 0 }
  }
}

function calcFontSize(textLen: number, colSpan: number): number {
  if (textLen < 10) return 12
  const inside = PAGE_W - 28
  const colW = inside * (colSpan / COLS) - 28
  const availH = SECT_H - OVERHEAD
  const f = Math.sqrt((colW * availH) / (textLen * 0.55 * 1.45))
  return Math.round(Math.max(7, Math.min(f, 15)))
}

function allocateCols(pool: { section: SectionData; length: number }[]): number[] {
  const totalLen = Math.max(pool.reduce((s, i) => s + i.length, 0), 1)
  const raw = pool.map(item => Math.max(1, Math.round((item.length / totalLen) * COLS)))
  let sum = raw.reduce((a, b) => a + b, 0)

  while (sum > COLS) {
    const maxIdx = raw.indexOf(Math.max(...raw))
    if (raw[maxIdx] > 1) {
      raw[maxIdx]--
      sum--
    } else {
      let anyBigger = false
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] > 1) {
          raw[i]--
          sum--
          anyBigger = true
          break
        }
      }
      if (!anyBigger) break
    }
  }
  while (sum < COLS) {
    const maxIdx = raw.indexOf(Math.max(...raw))
    raw[maxIdx]++
    sum++
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

function renderHTML(s: SectionData, c: any, fs: number, colSpan: number): string {
  const lh = 1.35

  const label = sectionLabel(s.type)
  const titleSize = colSpan >= 4 ? '16px' : colSpan >= 2 ? '14px' : '12px'

  let body = ''

  switch (s.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      body = `<p style="line-height:${lh}">${stripHtml(c.body || '')}</p>`
      break

    case 'fadu_catala': {
      const entries = c.entries || []
      body = `<div style="line-height:${lh}">${entries.map((e: any) =>
        `<div style="margin-bottom:${fs * 0.6}px"><strong style="font-size:${fs + 1}px;text-transform:uppercase;letter-spacing:0.05em">${e.title}</strong><p style="margin:2px 0 0;line-height:${lh}">${stripHtml(e.body)}</p></div>`
      ).join('')}</div>`
      break
    }

    case 'pagines_grogues': {
      const proverbs = c.proverbs || []
      body = `<div style="line-height:${lh}">${proverbs.map((p: any) =>
        `<p style="margin-bottom:${fs * 0.4}px">&ldquo;${p.text}&rdquo; <span style="opacity:0.6">— ${p.author}</span></p>`
      ).join('')}</div>`
      break
    }

    case 'calaix_sastre': {
      const interviews = c.interviews || []
      const reviews = c.reviews || []
      const parts: string[] = []
      if (interviews.length > 0) {
        parts.push(`<div style="margin-bottom:${fs * 0.6}px"><span style="font-size:${fs - 1}px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:block;margin-bottom:${fs * 0.3}px">Entrevistes</span>${interviews.map((x: any) =>
          `<div style="margin-bottom:${fs * 0.5}px"><strong style="font-size:${fs}px">${x.subject}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(x.body)}</p></div>`
        ).join('')}</div>`)
      }
      if (reviews.length > 0) {
        parts.push(`<div><span style="font-size:${fs - 1}px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:block;margin-bottom:${fs * 0.3}px">Ressenyes</span>${reviews.map((x: any) =>
          `<div style="margin-bottom:${fs * 0.5}px"><strong style="font-size:${fs}px">${x.title}</strong><p style="margin:1px 0 0;line-height:${lh}">${stripHtml(x.body)}</p></div>`
        ).join('')}</div>`)
      }
      body = `<div style="line-height:${lh}">${parts.join('')}</div>`
      break
    }

    case 'full_mural': {
      const collages = c.collages || []
      if (collages.length === 0) return ''
      const displayCount = Math.min(collages.length, colSpan >= 3 ? 4 : 2)
      const thumb = colSpan >= 3 ? 60 : 50
      body = `<div style="display:flex;flex-direction:column;gap:${fs * 0.5}px">${collages.slice(0, displayCount).map((x: any) =>
        `<div style="display:flex;align-items:center;gap:6px;background-color:rgba(0,0,0,0.03);padding:4px 6px">${x.image ? `<div style="width:${thumb}px;height:${thumb}px;background-image:url('${x.image}');background-size:cover;background-position:center;flex-shrink:0;border:1px solid rgba(0,0,0,0.08)"></div>` : ''}<p style="font-size:${fs - 0.5}px;line-height:${lh};margin:0">${x.description}</p></div>`
      ).join('')}${collages.length > displayCount ? `<p style="font-size:${fs - 1}px;font-style:italic;opacity:0.6;margin:0">+${collages.length - displayCount} col·latges m&eacute;s</p>` : ''}</div>`
      break
    }

    case 'ludita':
      body = `<p style="font-style:italic;line-height:${lh}">Mots encreuats d&apos;aclariment — resol el crucigrama complet a xerrac.cat</p>`
      break
  }

  return `<div style="grid-column:span ${colSpan};padding:14px 14px;border-right:${colSpan < COLS ? '1px solid #d4cdbe' : 'none'};display:flex;flex-direction:column">
    <div style="font-size:7px;text-transform:uppercase;letter-spacing:0.15em;color:#cc2222;margin-bottom:2px;font-weight:700;font-family:Arial,Helvetica,sans-serif">${label}</div>
    <div style="width:24px;height:2px;background-color:#cc2222;margin-bottom:3px"></div>
    <h2 style="font-size:${titleSize};font-weight:700;line-height:1.15;margin-bottom:4px;color:#1a1a1a">${s.title}</h2>
    <div style="height:1px;background-color:#bbb;margin-bottom:5px"></div>
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
  html, body { width: 297mm; height: 210mm; overflow: hidden; background: #f2ede4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 297mm; height: 210mm; font-family: Georgia, "Times New Roman", Times, serif; color: #1a1a1a; position: relative; display: flex; flex-direction: column; overflow: hidden; background: #f2ede4; }
  .masthead { background: #cc2222; padding: 18px 40px 10px; text-align: center; }
  .masthead h1 { font-size: 72px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; color: #fff; font-family: "Times New Roman", Times, serif; }
  .masthead .sub { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin-top: 2px; }
  .info { display: flex; justify-content: space-between; align-items: center; font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; padding: 4px 24px; border-bottom: 3px double #1a1a1a; font-family: Arial, Helvetica, sans-serif; }
  .info .title { font-weight: 700; color: #1a1a1a; font-size: 9px; }
  .topic { text-align: center; padding: 6px 24px; border-bottom: 1px solid #ccc; font-size: 18px; font-weight: 700; font-style: italic; color: #333; }
  .grid { display: grid; grid-template-columns: repeat(8, 1fr); flex: 1; }
  .footer { border-top: 2px solid #1a1a1a; padding: 5px 24px; display: flex; justify-content: space-between; font-size: 7px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; font-family: Arial, Helvetica, sans-serif; }
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
    <span class="title">${issue.title}</span>
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
      setScale(Math.min(sx, sy, 1))
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
        ref={containerRef}
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
        {/* Masthead */}
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

        {/* Grid */}
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
                  padding: `14px 14px`,
                  borderRight: item.colSpan < COLS ? '1px solid #d4cdbe' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
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
                  fontWeight: 700, lineHeight: 1.15, marginBottom: '4px', color: '#1a1a1a', flexShrink: 0,
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

        {/* Footer */}
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
      return <p style={{ lineHeight: lh }}>{stripHtml(c.body || '')}</p>

    case 'fadu_catala': {
      const entries = c.entries || []
      return (
        <div style={{ lineHeight: lh }}>
          {entries.map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: `${fs * 0.6}px` }}>
              <strong style={{ fontSize: `${fs + 1}px`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{e.title}</strong>
              <p style={{ margin: '2px 0 0', lineHeight: lh }}>{stripHtml(e.body)}</p>
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
            <p key={i} style={{ marginBottom: `${fs * 0.4}px` }}>
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
            <div style={{ marginBottom: `${fs * 0.6}px` }}>
              <span style={{ fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: `${fs * 0.3}px` }}>Entrevistes</span>
              {interviews.map((x: any, i: number) => (
                <div key={`i${i}`} style={{ marginBottom: `${fs * 0.5}px` }}>
                  <strong style={{ fontSize: `${fs}px` }}>{x.subject}</strong>
                  <p style={{ margin: '1px 0 0', lineHeight: lh }}>{stripHtml(x.body)}</p>
                </div>
              ))}
            </div>
          )}
          {reviews.length > 0 && (
            <div>
              <span style={{ fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: `${fs * 0.3}px` }}>Ressenyes</span>
              {reviews.map((x: any, i: number) => (
                <div key={`r${i}`} style={{ marginBottom: `${fs * 0.5}px` }}>
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
      const thumb = colSpan >= 3 ? 60 : 50

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${fs * 0.5}px` }}>
          {collages.slice(0, displayCount).map((x: any, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'rgba(0,0,0,0.03)', padding: '4px 6px',
            }}>
              {x.image && (
                <div style={{
                  width: `${thumb}px`, height: `${thumb}px`,
                  backgroundImage: `url("${x.image}")`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)',
                }} />
              )}
              <p style={{ fontSize: `${fs - 0.5}px`, lineHeight: lh, margin: 0 }}>
                {x.description}
              </p>
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

    case 'ludita':
      return <p style={{ fontStyle: 'italic', lineHeight: lh }}>Mots encreuats d&apos;aclariment — resol el crucigrama complet a xerrac.cat</p>

    default:
      return null
  }
}
