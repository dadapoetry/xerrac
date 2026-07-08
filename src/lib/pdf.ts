'use client'

import jsPDF from 'jspdf'

interface PrintSection {
  type: string
  title: string
  content: any
  backgroundImage?: string
}

interface PrintIssueData {
  number: number
  title: string
  date: Date
  sections: PrintSection[]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").trim()
}

function toLines(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW) as string[]
}

async function loadImage(url: string): Promise<HTMLCanvasElement> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas
}

async function addBg(doc: jsPDF, url: string): Promise<void> {
  try {
    const canvas = await loadImage(url)
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    const a = canvas.width / canvas.height
    const pa = pw / ph
    let dw: number, dh: number, dx: number, dy: number
    if (a > pa) { dh = ph; dw = ph * a; dx = (pw - dw) / 2; dy = 0 }
    else { dw = pw; dh = pw / a; dx = 0; dy = (ph - dh) / 2 }
    const tc = document.createElement('canvas')
    tc.width = pw * 4; tc.height = ph * 4
    const ctx = tc.getContext('2d')!
    ctx.drawImage(canvas, dx * 4, dy * 4, dw * 4, dh * 4)
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, tc.width, tc.height)
    doc.addImage(tc.toDataURL('image/jpeg', 0.7), 'JPEG', 0, 0, pw, ph, undefined, 'FAST')
  } catch {
    doc.setFillColor(10, 10, 10)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
  }
}

const M = 22
const PW = 210
const PH = 297
const COL_W = PW - M * 2
const CX = PW / 2

function brk(doc: jsPDF, y: number, need: number): number {
  return y + need > PH - M ? (doc.addPage(), M + 10) : y
}

function acc(section: PrintSection): [number, number, number] {
  const map: Record<string, [number, number, number]> = {
    portada: [255, 255, 255],
    editorial: [239, 68, 68],
    aclariment_cultural: [250, 204, 21],
    fadu_catala: [234, 179, 8],
    pagines_grogues: [250, 204, 21],
    calaix_sastre: [248, 113, 113],
    visita: [248, 113, 113],
    full_mural: [248, 113, 113],
    ludita: [239, 68, 68],
  }
  return map[section.type] || [200, 200, 200]
}

function subtitle(section: PrintSection): string | null {
  const map: Record<string, string | null> = {
    fadu_catala: "Refundació de l'humor negre",
    pagines_grogues: "Proverbis accidentals",
    full_mural: "Collages i contribucions dels lectors",
    ludita: "Mots encreuats d'aclariment",
  }
  return map[section.type] || null
}

// ── Section title bar ──

function titleBlock(doc: jsPDF, section: PrintSection, y: number): number {
  const a = acc(section)
  const sub = subtitle(section)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(a[0], a[1], a[2])
  const tlines = toLines(doc, section.title.toUpperCase(), COL_W)
  for (const l of tlines) { doc.text(l as string, M, y); y += 11 }
  y += 2

  if (sub) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(sub.toUpperCase(), M, y)
    y += 7
  }

  doc.setDrawColor(...a)
  doc.setLineWidth(0.6)
  doc.line(M, y, PW - M, y)
  y += 10

  return y
}

// ── Body text (justified, prose style) ──

function prose(doc: jsPDF, html: string, y: number, hasBg: boolean): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const tc: [number, number, number] = hasBg ? [220, 220, 220] : [80, 80, 80]
  doc.setTextColor(tc[0], tc[1], tc[2])
  const lines = toLines(doc, stripHtml(html), COL_W)
  for (const l of lines) {
    y = brk(doc, y, 5.5)
    doc.text(l as string, M, y)
    y += 5.5
  }
  return y + 5
}

// ── Card with border (matches web card style) ──

function card(doc: jsPDF, elements: ((y: number) => number)[], y: number, col: [number, number, number], hasBg: boolean): number {
  // Draw border first to calculate height
  doc.setDrawColor(...col)
  doc.setLineWidth(0.35)
  doc.rect(M, y - 4, COL_W, 4)
  return y
}

// ── Quote box (Pàgines Grogues style) ──

function quoteCard(doc: jsPDF, text: string, author: string, y: number, accent: [number, number, number], hasBg: boolean): number {
  y = brk(doc, y, 18)

  const cardH = 18
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.35)
  doc.rect(M, y - 4, COL_W, cardH)

  // # number dummy
  doc.setFillColor(...accent)
  doc.rect(M, y - 4, 8, 5, 'F')

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(hasBg ? 255 : 40)
  const plines = toLines(doc, `"${text}"`, COL_W - 16)
  for (const l of plines) {
    doc.text(l as string, M + 12, y)
    y += 5
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text(`— ${author}`, M + 12, y)
  y += 8

  return y
}

// ── Entry card (Fadu Català style) ──

function entryCard(doc: jsPDF, title: string, body: string, typeLabel: string | null, y: number, accent: [number, number, number], hasBg: boolean, index: number): number {
  const est = 12 + (title.length / 35 * 5.5) + (body ? body.length / 60 * 5 : 0)
  y = brk(doc, y, est)

  doc.setDrawColor(...accent)
  doc.setLineWidth(0.35)
  doc.rect(M, y - 4, COL_W, est)

  // Type badge
  if (typeLabel) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(accent[0], accent[1], accent[2])
    doc.text(`↪ ${typeLabel}`, M + 5, y)
    y += 7
  }

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(hasBg ? 255 : 30)
  const tlines = toLines(doc, title, COL_W - 14)
  for (const l of tlines) {
    y = brk(doc, y, 6)
    doc.text(l as string, M + 7, y)
    y += 6.5
  }
  y += 2

  // Body
  if (body) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    const tc3: [number, number, number] = hasBg ? [220, 220, 220] : [80, 80, 80]
    doc.setTextColor(tc3[0], tc3[1], tc3[2])
    const blines = toLines(doc, stripHtml(body), COL_W - 14)
    for (const l of blines) {
      y = brk(doc, y, 5)
      doc.text(l as string, M + 7, y)
      y += 5
    }
  }

  return y + 6
}

function sectionLabelBar(doc: jsPDF, label: string, y: number, accent: [number, number, number]): number {
  y = brk(doc, y, 8)
  doc.setFillColor(...accent)
  doc.rect(M, y - 3, 55, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(0, 0, 0)
  doc.text(label.toUpperCase(), M + 4, y + 1)
  return y + 8
}

// ── Collage grid ──

async function collageGrid(doc: jsPDF, collages: any[], y: number, accent: [number, number, number], hasBg: boolean): Promise<number> {
  const gap = 5
  const cW = (COL_W - gap) / 2
  const maxH = 45

  for (let i = 0; i < collages.length; i += 2) {
    const c1 = collages[i]
    const c2 = collages[i + 1]
    y = brk(doc, y, maxH + 12)

    const baseY = y

    // Col 1
    doc.setDrawColor(...accent)
    doc.setLineWidth(0.3)
    doc.rect(M, baseY, cW, maxH)
    if (c1?.image) {
      try {
        const canvas = await loadImage(c1.image)
        const a = canvas.width / canvas.height
        let ih = maxH - 3, iw = ih * a
        if (iw > cW - 6) { iw = cW - 6; ih = iw / a }
        const tc = document.createElement('canvas')
        tc.width = iw * 4; tc.height = ih * 4
        tc.getContext('2d')!.drawImage(canvas, 0, 0, tc.width, tc.height)
        doc.addImage(tc.toDataURL('image/jpeg', 0.7), 'JPEG', M + 3, baseY + 2, iw, ih, undefined, 'FAST')
      } catch {}
    }
    doc.setTextColor(140, 140, 140)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7)
    if (c1?.description) {
      const dl = toLines(doc, c1.description, cW - 6)
      let dy = baseY + maxH + 3
      for (const l of dl) { doc.text(l as string, M + 3, dy); dy += 4 }
    }

    // Col 2
    if (c2) {
      doc.setDrawColor(...accent)
      doc.setLineWidth(0.3)
      doc.rect(M + cW + gap, baseY, cW, maxH)
      if (c2.image) {
        try {
          const canvas = await loadImage(c2.image)
          const a = canvas.width / canvas.height
          let ih = maxH - 3, iw = ih * a
          if (iw > cW - 6) { iw = cW - 6; ih = iw / a }
          const tc = document.createElement('canvas')
          tc.width = iw * 4; tc.height = ih * 4
          tc.getContext('2d')!.drawImage(canvas, 0, 0, tc.width, tc.height)
          doc.addImage(tc.toDataURL('image/jpeg', 0.7), 'JPEG', M + cW + gap + 3, baseY + 2, iw, ih, undefined, 'FAST')
        } catch {}
      }
      doc.setTextColor(140, 140, 140)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7)
      if (c2.description) {
        const dl = toLines(doc, c2.description, cW - 6)
        let dy = baseY + maxH + 3
        for (const l of dl) { doc.text(l as string, M + cW + gap + 3, dy); dy += 4 }
      }
    }

    y = baseY + maxH + 12
  }

  return y
}

function drawSawTooth(doc: jsPDF, y: number, width: number, height: number, teeth: number): void {
  doc.setFillColor(220, 38, 38)
  const tw = width / teeth
  for (let i = 0; i < teeth; i++) {
    const x = i * tw
    doc.triangle(x, y, x + tw / 2, y - height, x + tw, y, 'F')
  }
}

function drawSawBlade(doc: jsPDF, cx: number, cy: number, r: number): void {
  // Draw a saw blade using triangles (teeth) around a circle
  const teeth = 12
  const outerR = r
  const innerR = r * 0.65
  doc.setFillColor(220, 38, 38)
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 0.5) / teeth) * Math.PI * 2 - Math.PI / 2
    const x1 = cx + Math.cos(a) * outerR
    const y1 = cy + Math.sin(a) * outerR
    const x2 = cx + Math.cos(a2) * innerR
    const y2 = cy + Math.sin(a2) * innerR
    const a3 = ((i + 1) / teeth) * Math.PI * 2 - Math.PI / 2
    const x3 = cx + Math.cos(a3) * outerR
    const y3 = cy + Math.sin(a3) * outerR
    doc.triangle(x1, y1, x2, y2, x3, y3, 'F')
  }
  doc.setFillColor(10, 10, 10)
  doc.circle(cx, cy, r * 0.22, 'F')
  doc.setFillColor(220, 38, 38)
  doc.circle(cx, cy, r * 0.1, 'F')
}

export async function generatePDF(issueData: PrintIssueData) {
  const doc = new jsPDF('p', 'mm', 'a4')

  // ═══════════════ PORTADA ═══════════════
  const portada = issueData.sections.find(s => s.type === 'portada')
  if (portada) {
    const c = portada.content
    const hasBg = !!portada.backgroundImage
    if (hasBg) await addBg(doc, portada.backgroundImage!)
    else { doc.setFillColor(5, 5, 5); doc.rect(0, 0, PW, PH, 'F') }

    // Double border frame (brand style)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.6)
    doc.rect(16, 25, PW - 32, PH - 50)

    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.12)
    doc.rect(20, 29, PW - 40, PH - 58)

    // Top saw-tooth bar
    drawSawTooth(doc, 50, PW - 40, 6, 40)

    // Saw blade icon
    drawSawBlade(doc, CX, 90, 14)

    // XERRAC! title - "XERRAC" in white, "!" in red
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(50)
    doc.setTextColor(255, 255, 255)
    doc.text('XERRAC', CX - 12, 118, { align: 'center' })
    doc.setTextColor(220, 38, 38)
    doc.text('!', CX + 58, 118, { align: 'center' })

    // Subtitle
    if (c.subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(180, 180, 180)
      doc.text(c.subtitle.toUpperCase(), CX, 140, { align: 'center' })
    }

    // Red divider
    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.5)
    doc.line(CX - 35, 150, CX + 35, 150)

    // Topic
    if (c.topic) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(c.topic, CX, 168, { align: 'center' })
    }

    // Issue number
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`NÚMERO ${issueData.number}`, CX, PH - 42, { align: 'center' })

    // Bottom saw-tooth bar
    drawSawTooth(doc, PH - 48, PW - 40, 6, 40)
  }

  // ═══════════════ SECTIONS ═══════════════
  for (const section of issueData.sections) {
    if (section.type === 'portada') continue

    doc.addPage()
    const hasBg = !!section.backgroundImage
    if (hasBg) await addBg(doc, section.backgroundImage!)

    const a = acc(section)
    const c = section.content

    // Title + optional subtitle + rule
    let y = M + 8
    y = titleBlock(doc, section, y)

    // ── EDITORIAL ──
    if (section.type === 'editorial' && c.body) {
      y = prose(doc, c.body, y, hasBg)
    }

    // ── ACLARIMENT CULTURAL ──
    if (section.type === 'aclariment_cultural' && c.body) {
      // Left accent bar
      doc.setFillColor(...a)
      doc.rect(M, y, 3, 80, 'F')
      y = prose(doc, c.body, y + 2, hasBg)
    }

    // ── VISITA ──
    if (section.type === 'visita' && c.body) {
      if (c.source) {
        y = brk(doc, y, 6)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(8.5)
        doc.setTextColor(130, 130, 130)
        doc.text(c.source, M, y)
        y += 8
      }

      // Large opening quote
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(36)
      doc.setTextColor(a[0], a[1], a[2])
      doc.text('"', M, y + 2)

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      const tc2: [number, number, number] = hasBg ? [225, 225, 225] : [60, 60, 60]
      doc.setTextColor(tc2[0], tc2[1], tc2[2])
      const blines = toLines(doc, stripHtml(c.body), COL_W - 10)
      for (const l of blines) {
        y = brk(doc, y, 5.5)
        doc.text(l as string, M + 10, y)
        y += 5.5
      }
      y += 4

      // Closing quote
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(36)
      doc.setTextColor(a[0], a[1], a[2])
      doc.text('"', PW - M - 14, y - 8)
      y += 6
    }

    // ── FADU CATALÀ ──
    if (c.entries) {
      for (let i = 0; i < c.entries.length; i++) {
        const entry = c.entries[i]
        const badge =
          entry.type === 'biography' ? 'Biografia apòcrifa' :
          entry.type === 'ucronia' ? 'Ucronia' : 'Personatge'
        y = entryCard(doc, entry.title, entry.body, badge, y, a, hasBg, i)
      }
    }

    // ── PÀGINES GROGUES ──
    if (c.proverbs) {
      for (const p of c.proverbs) {
        y = quoteCard(doc, p.text, p.author, y, a, hasBg)
      }
    }

    // ── CALAIX DE SASTRE ──
    if (c.interviews) {
      y = sectionLabelBar(doc, 'Entrevistes', y, a)
      for (const item of c.interviews) {
        y = entryCard(doc, item.subject, item.body, null, y, a, hasBg, 0)
      }
    }

    if (c.reviews) {
      y = sectionLabelBar(doc, 'Crítiques', y, a)
      for (const item of c.reviews) {
        y = entryCard(doc, item.title, item.body, null, y, a, hasBg, 0)
      }
    }

    // ── FULL MURAL ──
    if (c.collages) {
      y = brk(doc, y, 6)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(a[0], a[1], a[2])
      doc.text('COLLAGES', M, y)
      y += 8
      y = await collageGrid(doc, c.collages, y, a, hasBg)
    }

    // ── LUDITA ──
    if (c.crossword) {
      const cell = 7
      const gs = c.crossword.gridSize || 11
      const gp = gs * cell
      const sx = (PW - gp) / 2

      y = brk(doc, y, 6)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(a[0], a[1], a[2])
      doc.text('MOTS ENCREUATS', CX, y, { align: 'center' })
      y += 10

      // Grid
      doc.setDrawColor(140, 140, 140)
      doc.setLineWidth(0.3)
      for (let r = 0; r < gs; r++) {
        for (let cc = 0; cc < gs; cc++) {
          doc.rect(sx + cc * cell, y + r * cell, cell, cell)
        }
      }

      // Numbers
      doc.setFontSize(5)
      doc.setTextColor(160)
      const across = c.crossword.clues?.across || {}
      const down = c.crossword.clues?.down || {}
      for (const [num, clue] of Object.entries(across) as [string, any][]) {
        doc.text(num.toString(), sx + (clue.col || 0) * cell + 0.4, y + (clue.row || 0) * cell + 4.5)
      }
      for (const [num, clue] of Object.entries(down) as [string, any][]) {
        doc.text(num.toString(), sx + (clue.col || 0) * cell + 0.4, y + (clue.row || 0) * cell + 4.5)
      }

      y += gp + 10

      // Clues
      const textCol: [number, number, number] = hasBg ? [220, 220, 220] : [80, 80, 80]
      if (Object.keys(across).length > 0) {
        y = brk(doc, y, 8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(120, 120, 120)
        doc.text('Horitzontals', M, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(textCol[0], textCol[1], textCol[2])
        for (const [num, clue] of Object.entries(across) as [string, any][]) {
          const lines = toLines(doc, `${num}. ${clue.clue || ''}`, COL_W - 5)
          for (const l of lines) { y = brk(doc, y, 4.5); doc.text(l as string, M + 3, y); y += 4.5 }
        }
        y += 4
      }
      if (Object.keys(down).length > 0) {
        y = brk(doc, y, 8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(120, 120, 120)
        doc.text('Verticals', M, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(textCol[0], textCol[1], textCol[2])
        for (const [num, clue] of Object.entries(down) as [string, any][]) {
          const lines = toLines(doc, `${num}. ${clue.clue || ''}`, COL_W - 5)
          for (const l of lines) { y = brk(doc, y, 4.5); doc.text(l as string, M + 3, y); y += 4.5 }
        }
      }
    }

    // Footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text('Xerrac!', M, PH - 15)
    doc.text(section.title, CX, PH - 15, { align: 'center' })
  }

  doc.save(`xerrac-numero-${issueData.number}.pdf`)
  return doc
}
