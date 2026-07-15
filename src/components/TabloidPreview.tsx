'use client'

import { useMemo, useRef } from 'react'
import { IssueData, SectionData } from '@/types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function measureContent(section: SectionData): { text: string; length: number } {
  const c = section.content as any
  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita': {
      const t = stripHtml(c.body || '')
      return { text: t, length: t.length }
    }
    case 'fadu_catala': {
      const t = (c.entries || []).map((e: any) => e.title + ' ' + stripHtml(e.body)).join(' ')
      return { text: t, length: t.length }
    }
    case 'pagines_grogues': {
      const t = (c.proverbs || []).map((p: any) => p.text + ' ' + p.author).join(' ')
      return { text: t, length: t.length }
    }
    case 'calaix_sastre': {
      const i = (c.interviews || []).map((x: any) => x.subject + ' ' + stripHtml(x.body)).join(' ')
      const r = (c.reviews || []).map((x: any) => x.title + ' ' + stripHtml(x.body)).join(' ')
      return { text: i + ' ' + r, length: i.length + r.length }
    }
    case 'full_mural': {
      const t = (c.collages || []).map((x: any) => x.description).join(' ')
      return { text: t, length: t.length }
    }
    case 'ludita': {
      return { text: 'Mots encreuats', length: 50 }
    }
    default:
      return { text: '', length: 0 }
  }
}

function Excerpt({ html, maxChars = 300 }: { html: string; maxChars?: number }) {
  const text = stripHtml(html)
  const truncated = text.length > maxChars ? text.slice(0, maxChars) + '…' : text
  return <>{truncated}</>
}

function SectionBody({ section }: { section: SectionData }) {
  const c = section.content as any

  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      return <Excerpt html={c.body || ''} maxChars={400} />

    case 'fadu_catala': {
      const entries = c.entries || []
      return (
        <>
          {entries.slice(0, 2).map((e: any, i: number) => (
            <div key={i} className="mb-2">
              <strong className="text-xs uppercase tracking-wider">{e.title}</strong>
              <p className="text-xs mt-1 leading-relaxed"><Excerpt html={e.body} maxChars={150} /></p>
            </div>
          ))}
          {entries.length > 2 && <p className="text-xs italic mt-1">+{entries.length - 2} més</p>}
        </>
      )
    }

    case 'pagines_grogues': {
      const proverbs = c.proverbs || []
      return (
        <div className="space-y-1.5">
          {proverbs.slice(0, 5).map((p: any, i: number) => (
            <p key={i} className="text-xs leading-relaxed">&ldquo;{p.text}&rdquo; <span className="text-gray-500">— {p.author}</span></p>
          ))}
          {proverbs.length > 5 && <p className="text-xs italic">+{proverbs.length - 5} proverbis més</p>}
        </div>
      )
    }

    case 'calaix_sastre': {
      const interviews = c.interviews || []
      const reviews = c.reviews || []
      return (
        <>
          {interviews.slice(0, 1).map((x: any, i: number) => (
            <div key={`i${i}`} className="mb-2">
              <strong className="text-xs">{x.subject}</strong>
              <p className="text-xs mt-1 leading-relaxed"><Excerpt html={x.body} maxChars={150} /></p>
            </div>
          ))}
          {reviews.slice(0, 1).map((x: any, i: number) => (
            <div key={`r${i}`} className="mb-1">
              <strong className="text-xs">{x.title}</strong>
              <p className="text-xs mt-1 leading-relaxed"><Excerpt html={x.body} maxChars={100} /></p>
            </div>
          ))}
        </>
      )
    }

    case 'full_mural': {
      const collages = c.collages || []
      return (
        <div className="space-y-1">
          {collages.slice(0, 3).map((x: any, i: number) => (
            <p key={i} className="text-xs leading-relaxed">{x.description}</p>
          ))}
          {collages.length > 3 && <p className="text-xs italic">+{collages.length - 3} collages</p>}
        </div>
      )
    }

    case 'ludita':
      return <p className="text-xs italic">Mots encreuats d&apos;aclariment — resol el crucigrama complet al web.</p>

    default:
      return null
  }
}

interface PlacedSection {
  section: SectionData
  colSpan: number
  sortOrder: number
}

export function TabloidPreview({ issue }: { issue: IssueData }) {
  const pageRef = useRef<HTMLDivElement>(null)

  const sections = useMemo(() => {
    const sorted = issue.sections
      .filter(s => s.type !== 'portada')
      .sort((a, b) => b.order - a.order)
      .map(s => ({ section: s, ...measureContent(s) }))
      .sort((a, b) => b.length - a.length)

    const placed: PlacedSection[] = []
    sorted.forEach((item, i) => {
      let colSpan = 1
      if (i === 0 && sorted.length >= 3) colSpan = 3
      else if (i < 3 && sorted.length >= 5) colSpan = 2
      else if (i < 2 && sorted.length >= 4) colSpan = 2
      placed.push({ section: item.section, colSpan, sortOrder: i })
    })

    const portadaIndex = issue.sections.findIndex(s => s.type === 'portada')
    const portadaSection = issue.sections[portadaIndex]
    const portadaContent = portadaSection?.content as any

    return { placed, portadaTopic: portadaContent?.topic || '', portadaBg: portadaSection?.backgroundImage || '' }
  }, [issue])

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4" style={{ backgroundColor: '#e8e0d0' }}>
      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="fixed top-4 right-4 z-50 bg-black text-white text-xs px-4 py-2 uppercase tracking-wider hover:bg-gray-800 transition-colors no-print"
      >
        Exportar PDF
      </button>

      {/* Tabloid page */}
      <div
        ref={pageRef}
        className="tabloid-page"
        style={{
          width: '1120px',
          minHeight: '1580px',
          backgroundColor: '#f5f0e8',
          color: '#1a1a1a',
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Masthead */}
        <div className="tabloid-masthead" style={{
          textAlign: 'center',
          padding: '28px 40px 16px',
          borderBottom: '3px solid #1a1a1a',
        }}>
          {sections.portadaBg && (
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04,
              backgroundImage: `url("${sections.portadaBg}")`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ fontSize: '72px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#cc2222', position: 'relative' }}>
            XERRAC<em style={{ fontStyle: 'normal', color: '#cc2222' }}>!</em>
          </div>
          <div style={{ fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#666', marginTop: '6px', position: 'relative' }}>
            Revista d&apos;aclariment cultural
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888',
            marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #ccc',
            position: 'relative',
          }}>
            <span>Núm. {String(issue.number).padStart(2, '0')}</span>
            <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{issue.title}</span>
            <span>{new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        {/* Topic headline */}
        {sections.portadaTopic && (
          <div style={{
            textAlign: 'center', padding: '14px 40px 16px',
            borderBottom: '1px solid #ccc',
            fontSize: '24px', fontWeight: 700, fontStyle: 'italic',
            color: '#333',
          }}>
            {sections.portadaTopic}
          </div>
        )}

        {/* Grid layout */}
        <div className="tabloid-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
          padding: '20px 0',
        }}>
          {sections.placed.map((item, i) => {
            const colSpan = item.colSpan
            const isLast = i === sections.placed.length - 1
            const rightBorder = (i + colSpan) % 4 !== 0 && !isLast

            return (
              <div
                key={item.section.id}
                className="tabloid-article"
                style={{
                  gridColumn: `span ${colSpan}`,
                  padding: '0 20px',
                  borderRight: rightBorder ? '1px solid #ddd' : 'none',
                  borderBottom: !isLast && Math.floor((i + colSpan) / 4) !== Math.floor(i / 4) ? 'none' : 'none',
                  marginBottom: '0',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                }}
              >
                {/* Section type label */}
                <div style={{
                  fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#cc2222', marginBottom: '4px', fontWeight: 600,
                }}>
                  {sectionLabel(item.section.type)}
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: colSpan >= 2 ? '20px' : '16px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: '4px',
                  color: '#1a1a1a',
                }}>
                  {item.section.title}
                </h2>

                {/* Rule */}
                <div style={{
                  height: '2px', backgroundColor: '#cc2222',
                  width: colSpan >= 3 ? '60px' : '40px',
                  marginBottom: '8px',
                }} />

                {/* Content */}
                <div className="tabloid-body" style={{
                  fontSize: '11px', lineHeight: 1.55, color: '#333',
                }}>
                  <SectionBody section={item.section} />
                </div>

                {/* Continue reading link */}
                <p style={{
                  fontSize: '9px', marginTop: '8px', fontStyle: 'italic', color: '#cc2222',
                }}>
                  Continua llegint a xerrac.cat →
                </p>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '2px solid #1a1a1a',
          padding: '12px 40px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888', position: 'absolute', bottom: 0, left: 0, right: 0,
        }}>
          <span>Xerrac! — Revista d&apos;aclariment cultural</span>
          <span>Compilat digitalment des de xerrac.cat</span>
        </div>
      </div>
    </div>
  )
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
