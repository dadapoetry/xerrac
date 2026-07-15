'use client'

import { useMemo } from 'react'
import { IssueData, SectionData } from '@/types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function getText(section: SectionData): { text: string; length: number } {
  const c = section.content as any
  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita': {
      const t = stripHtml(c.body || '')
      return { text: t, length: t.length }
    }
    case 'fadu_catala': {
      const t = (c.entries || []).map((e: any) => `${e.title} ${stripHtml(e.body)}`).join('\n\n')
      return { text: t, length: t.length }
    }
    case 'pagines_grogues': {
      const t = (c.proverbs || []).map((p: any) => `"${p.text}" — ${p.author}`).join('\n')
      return { text: t, length: t.length }
    }
    case 'calaix_sastre': {
      const parts: string[] = []
      ;(c.interviews || []).forEach((x: any) => parts.push(`${x.subject} ${stripHtml(x.body)}`))
      ;(c.reviews || []).forEach((x: any) => parts.push(`${x.title} ${stripHtml(x.body)}`))
      return { text: parts.join('\n\n'), length: parts.join(' ').length }
    }
    case 'full_mural': {
      const t = (c.collages || []).map((x: any) => x.description).join(' ')
      return { text: t, length: t.length }
    }
    case 'ludita': {
      return { text: 'Mots encreuats d\'aclariment', length: 50 }
    }
    default:
      return { text: '', length: 0 }
  }
}

const PAGE_W = 1580
const PAGE_H = 1120
const MASTHEAD_H = 150
const FOOTER_H = 36
const PAD = 14
const COLS = 8
const CONTENT_H = PAGE_H - MASTHEAD_H - FOOTER_H

function calcFontSize(textLen: number, colSpan: number): number {
  const colW = (PAGE_W - PAD * 2) * (colSpan / COLS) - PAD * 2
  const availH = CONTENT_H - PAD * 2
  const chW = 0.55
  const lh = 1.45
  const target = textLen / 0.92
  const size = Math.sqrt((colW * availH) / (target * chW * lh))
  return Math.min(Math.max(Math.round(size), 8), 14)
}

interface Placed {
  section: SectionData
  colSpan: number
  fontSize: number
}

export function TabloidPreview({ issue }: { issue: IssueData }) {
  const layout = useMemo(() => {
    const pool = issue.sections
      .filter(s => s.type !== 'portada')
      .map(s => ({ section: s, ...getText(s) }))
      .sort((a, b) => b.length - a.length)

    const totalLen = pool.reduce((s, i) => s + i.length, 0)
    const placed: Placed[] = []

    pool.forEach((item) => {
      let colSpan = Math.max(1, Math.round((item.length / totalLen) * COLS))
      const used = placed.reduce((s, p) => s + p.colSpan, 0)
      if (used + colSpan > COLS) colSpan = COLS - used
      if (colSpan < 1) colSpan = 1

      const fontSize = calcFontSize(item.length, colSpan)

      placed.push({ section: item.section, colSpan, fontSize })
    })

    const portada = issue.sections.find(s => s.type === 'portada')
    const pc = portada?.content as any

    return {
      placed,
      portadaTopic: pc?.topic || '',
      portadaBg: portada?.backgroundImage || '',
    }
  }, [issue])

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 no-print" style={{ backgroundColor: '#dad3c7' }}>
      <button
        onClick={() => window.print()}
        className="fixed top-4 right-4 z-50 bg-black text-white text-xs px-4 py-2 uppercase tracking-wider hover:bg-gray-800 transition-colors no-print"
      >
        Exportar PDF
      </button>

      <div
        className="tabloid-page"
        style={{
          width: `${PAGE_W}px`,
          minHeight: `${PAGE_H}px`,
          backgroundColor: '#f2ede4',
          color: '#1a1a1a',
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Masthead */}
        <div style={{ backgroundColor: '#cc2222', padding: '18px 40px 10px', textAlign: 'center' }}>
          {layout.portadaBg && (
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.03,
              backgroundImage: `url("${layout.portadaBg}")`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              pointerEvents: 'none',
            }} />
          )}
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
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
          <span>Any {new Date(issue.date).getFullYear() - 2024} &middot; Núm. {String(issue.number).padStart(2, '0')}</span>
          <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '9px' }}>{issue.title}</span>
          <span>{new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
        </div>

        {layout.portadaTopic && (
          <div style={{
            textAlign: 'center', padding: '6px 24px 6px',
            borderBottom: '1px solid #ccc',
            fontSize: '18px', fontWeight: 700, fontStyle: 'italic',
            color: '#333',
          }}>
            {layout.portadaTopic}
          </div>
        )}

        {/* Content grid — one row, sections span proportional columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '0',
          height: `${CONTENT_H}px`,
          overflow: 'hidden',
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
                  padding: `${PAD}px ${PAD}px`,
                  borderRight: item.colSpan < COLS ? '1px solid #d4cdbe' : 'none',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Section label */}
                <div style={{
                  fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#cc2222', marginBottom: '2px', fontWeight: 700,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                }}>
                  {sectionLabel(s.type)}
                </div>

                {/* Red rule */}
                <div style={{
                  width: '24px', height: '2px', backgroundColor: '#cc2222', marginBottom: '3px',
                }} />

                {/* Title */}
                <h2 style={{
                  fontSize: item.colSpan >= 4 ? '16px' : item.colSpan >= 2 ? '14px' : '12px',
                  fontWeight: 700, lineHeight: 1.15, marginBottom: '4px', color: '#1a1a1a',
                }}>
                  {s.title}
                </h2>

                <div style={{ height: '1px', backgroundColor: '#bbb', marginBottom: '5px' }} />

                {/* Body */}
                <div style={{
                  fontSize: `${fs}px`,
                  lineHeight: 1.45,
                  color: '#333',
                  textAlign: 'justify',
                  overflow: 'hidden',
                  flex: 1,
                }}>
                  {renderSection(s, c, fs, item.colSpan)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '2px solid #1a1a1a', padding: '6px 24px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888', fontFamily: 'Arial, Helvetica, sans-serif',
          height: `${FOOTER_H}px`, alignItems: 'center',
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
              <span style={{
                fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em',
                fontWeight: 700, display: 'block', marginBottom: `${fs * 0.3}px`,
              }}>Entrevistes</span>
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
              <span style={{
                fontSize: `${fs - 1}px`, textTransform: 'uppercase', letterSpacing: '0.1em',
                fontWeight: 700, display: 'block', marginBottom: `${fs * 0.3}px`,
              }}>Ressenyes</span>
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

      const collageH = colSpan >= 3 ? 60 : colSpan >= 2 ? 50 : 40
      const displayCount = Math.min(collages.length, colSpan >= 3 ? 4 : 2)

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${fs * 0.5}px` }}>
          {collages.slice(0, displayCount).map((x: any, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'rgba(0,0,0,0.03)', padding: '4px 6px',
              borderRadius: '2px',
            }}>
              {x.image && (
                <div style={{
                  width: `${collageH}px`, height: `${collageH}px`,
                  backgroundImage: `url("${x.image}")`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  flexShrink: 0, borderRadius: '2px',
                  border: '1px solid rgba(0,0,0,0.08)',
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
