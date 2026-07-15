'use client'

import { useMemo, useRef } from 'react'
import { IssueData, SectionData } from '@/types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function measureContent(section: SectionData): { length: number } {
  const c = section.content as any
  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita': {
      const t = stripHtml(c.body || '')
      return { length: t.length }
    }
    case 'fadu_catala': {
      const t = (c.entries || []).map((e: any) => e.title + ' ' + stripHtml(e.body)).join(' ')
      return { length: t.length }
    }
    case 'pagines_grogues': {
      const t = (c.proverbs || []).map((p: any) => p.text + ' ' + p.author).join(' ')
      return { length: t.length }
    }
    case 'calaix_sastre': {
      const i = (c.interviews || []).map((x: any) => x.subject + ' ' + stripHtml(x.body)).join(' ')
      const r = (c.reviews || []).map((x: any) => x.title + ' ' + stripHtml(x.body)).join(' ')
      return { length: i.length + r.length }
    }
    case 'full_mural': {
      const t = (c.collages || []).map((x: any) => x.description).join(' ')
      return { length: t.length }
    }
    case 'ludita': {
      return { length: 50 }
    }
    default:
      return { length: 0 }
  }
}

function renderBody(section: SectionData) {
  const c = section.content as any

  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      return <span>{stripHtml(c.body || '')}</span>

    case 'fadu_catala': {
      const entries = c.entries || []
      return (
        <>
          {entries.map((e: any, i: number) => (
            <div key={i} className="mb-3">
              <strong className="block uppercase tracking-wider text-[10px] mb-0.5 leading-snug">{e.title}</strong>
              <p className="leading-snug">{stripHtml(e.body)}</p>
            </div>
          ))}
        </>
      )
    }

    case 'pagines_grogues': {
      const proverbs = c.proverbs || []
      return (
        <div className="space-y-2">
          {proverbs.map((p: any, i: number) => (
            <p key={i} className="leading-snug">&ldquo;{p.text}&rdquo; <span className="opacity-60">— {p.author}</span></p>
          ))}
        </div>
      )
    }

    case 'calaix_sastre': {
      const interviews = c.interviews || []
      const reviews = c.reviews || []
      return (
        <>
          {interviews.length > 0 && (
            <div className="mb-3">
              <span className="block uppercase tracking-wider text-[9px] font-bold mb-1">Entrevistes</span>
              {interviews.map((x: any, i: number) => (
                <div key={`i${i}`} className="mb-2">
                  <strong className="text-[11px]">{x.subject}</strong>
                  <p className="leading-snug">{stripHtml(x.body)}</p>
                </div>
              ))}
            </div>
          )}
          {reviews.length > 0 && (
            <div>
              <span className="block uppercase tracking-wider text-[9px] font-bold mb-1">Ressenyes</span>
              {reviews.map((x: any, i: number) => (
                <div key={`r${i}`} className="mb-2">
                  <strong className="text-[11px]">{x.title}</strong>
                  <p className="leading-snug">{stripHtml(x.body)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )
    }

    case 'full_mural': {
      const collages = c.collages || []
      return (
        <div className="space-y-2">
          {collages.map((x: any, i: number) => (
            <p key={i} className="leading-snug">{x.description}</p>
          ))}
        </div>
      )
    }

    case 'ludita':
      return <p className="italic">Mots encreuats d&apos;aclariment — resol el crucigrama complet a xerrac.cat</p>

    default:
      return null
  }
}

interface PlacedSection {
  section: SectionData
  colSpan: number
}

export function TabloidPreview({ issue }: { issue: IssueData }) {
  const pageRef = useRef<HTMLDivElement>(null)

  const sections = useMemo(() => {
    const sorted = issue.sections
      .filter(s => s.type !== 'portada')
      .sort((a, b) => b.order - a.order)
      .map(s => ({ section: s, ...measureContent(s) }))
      .sort((a, b) => b.length - a.length)

    const totalLength = sorted.reduce((sum, s) => sum + s.length, 0)
    const cols = 8
    const contentHeight = 1120 - 180
    const available = cols * contentHeight

    const placed: PlacedSection[] = []
    sorted.forEach((item) => {
      const proportion = item.length / totalLength
      let colSpan = Math.max(1, Math.round(proportion * cols))
      const used = placed.reduce((s, p) => s + p.colSpan, 0)
      if (used + colSpan > cols) colSpan = cols - used
      if (colSpan < 1) colSpan = 1
      placed.push({ section: item.section, colSpan })
    })

    const portadaIndex = issue.sections.findIndex(s => s.type === 'portada')
    const portadaSection = issue.sections[portadaIndex]
    const portadaContent = portadaSection?.content as any

    return { placed, portadaTopic: portadaContent?.topic || '', portadaBg: portadaSection?.backgroundImage || '' }
  }, [issue])

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4" style={{ backgroundColor: '#dad3c7' }}>
      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="fixed top-4 right-4 z-50 bg-black text-white text-xs px-4 py-2 uppercase tracking-wider hover:bg-gray-800 transition-colors no-print"
      >
        Exportar PDF
      </button>

      {/* Tabloid page — landscape */}
      <div
        ref={pageRef}
        className="tabloid-page"
        style={{
          width: '1580px',
          minHeight: '1120px',
          backgroundColor: '#f2ede4',
          color: '#1a1a1a',
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Masthead — white text on red banner */}
        <div style={{
          position: 'relative',
        }}>
          {sections.portadaBg && (
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.03,
              backgroundImage: `url("${sections.portadaBg}")`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              pointerEvents: 'none',
            }} />
          )}

          {/* Red masthead band */}
          <div style={{
            backgroundColor: '#cc2222',
            padding: '20px 40px 14px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '80px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#ffffff',
              fontFamily: '"Times New Roman", Times, serif',
            }}>
              XERRAC<em style={{ fontStyle: 'normal' }}>!</em>
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              marginTop: '4px',
              fontWeight: 400,
            }}>
              Revista d&apos;aclariment cultural
            </div>
          </div>

          {/* Issue info bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em',
            color: '#666', padding: '6px 40px',
            borderBottom: '3px double #1a1a1a',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}>
            <span>Any {new Date(issue.date).getFullYear() - 2024} &middot; Núm. {String(issue.number).padStart(2, '0')}</span>
            <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '10px' }}>{issue.title}</span>
            <span>{new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</span>
          </div>

          {/* Topic headline */}
          {sections.portadaTopic && (
            <div style={{
              textAlign: 'center', padding: '10px 40px 10px',
              borderBottom: '1px solid #ccc',
              fontSize: '22px', fontWeight: 700, fontStyle: 'italic',
              color: '#333',
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
            }}>
              {sections.portadaTopic}
            </div>
          )}
        </div>

        {/* 8-column grid layout — Il Politecnico architecture (landscape) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '0',
          padding: '0',
        }}>
          {sections.placed.map((item, i) => {
            const colSpan = item.colSpan

            return (
              <div
                key={item.section.id}
                style={{
                  gridColumn: `span ${colSpan}`,
                  padding: '16px 14px',
                  borderRight: colSpan < 8 && sections.placed.findIndex(p => p.section.id === item.section.id) < sections.placed.length - 1
                    ? '1px solid #d4cdbe' : 'none',
                  borderBottom: 'none',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                }}
              >
                {/* Red accent rule above section */}
                <div style={{
                  width: '30px', height: '3px',
                  backgroundColor: '#cc2222',
                  marginBottom: '6px',
                }} />

                {/* Section type label — red */}
                <div style={{
                  fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#cc2222', marginBottom: '2px', fontWeight: 700,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                }}>
                  {sectionLabel(item.section.type)}
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: colSpan >= 4 ? '18px' : colSpan >= 2 ? '15px' : '13px',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  marginBottom: '6px',
                  color: '#1a1a1a',
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                }}>
                  {item.section.title}
                </h2>

                {/* Thin rule below title */}
                <div style={{
                  height: '1px', backgroundColor: '#bbb',
                  marginBottom: '8px',
                }} />

                {/* Full content — no truncation */}
                <div style={{
                  fontSize: '10px',
                  lineHeight: 1.45,
                  color: '#333',
                  textAlign: 'justify',
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                }}>
                  {renderBody(item.section)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '2px solid #1a1a1a',
          padding: '10px 40px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888',
          fontFamily: 'Arial, Helvetica, sans-serif',
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
