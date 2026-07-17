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
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, tc.width, tc.height)
    doc.addImage(tc.toDataURL('image/jpeg', 0.7), 'JPEG', 0, 0, pw, ph, undefined, 'FAST')
  } catch {
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
  }
}

const M = 24
const PW = 210
const PH = 297
const COL_W = PW - M * 2
const CX = PW / 2

function brk(doc: jsPDF, y: number, need: number): number {
  return y + need > PH - M ? (doc.addPage(), M + 12) : y
}

function sectionH(doc: jsPDF, title: string, subtitle: string | null, num: number, y: number): number {
  // Number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(String(num).padStart(2, '0'), M, y)
  y += 8

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(250, 250, 250)
  const tlines = toLines(doc, title.toUpperCase(), COL_W)
  for (const l of tlines) { doc.text(l as string, M, y); y += 10 }
  y += 2

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(subtitle.toUpperCase(), M, y)
    y += 7
  }

  // Red rule
  doc.setDrawColor(239, 68, 68)
  doc.setLineWidth(0.4)
  doc.line(M, y, M + 30, y)
  y += 10

  return y
}

function prose(doc: jsPDF, text: string, y: number): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(190, 190, 190)
  const lines = toLines(doc, stripHtml(text), COL_W)
  for (const l of lines) {
    y = brk(doc, y, 5.5)
    doc.text(l as string, M, y)
    y += 5.5
  }
  return y + 4
}

function tinyLabel(doc: jsPDF, label: string, y: number): number {
  y = brk(doc, y, 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text(label.toUpperCase(), M, y)
  return y + 6
}

export async function generatePDF(issueData: PrintIssueData) {
  const doc = new jsPDF('p', 'mm', 'a4')

  // ═══════════════ PORTADA ═══════════════
  const portada = issueData.sections.find(s => s.type === 'portada')
  if (portada) {
    const c = portada.content
    const hasBg = !!portada.backgroundImage
    if (hasBg) await addBg(doc, portada.backgroundImage!)
    else { doc.setFillColor(0, 0, 0); doc.rect(0, 0, PW, PH, 'F') }

    // XERRAC!
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(56)
    doc.setTextColor(250, 250, 250)
    doc.text('XERRAC', CX - 14, 118, { align: 'center' })
    doc.setTextColor(239, 68, 68)
    doc.text('!', CX + 66, 118, { align: 'center' })

    // Red rule
    doc.setDrawColor(239, 68, 68)
    doc.setLineWidth(0.4)
    doc.line(CX - 30, 130, CX + 30, 130)

    // Subtitle
    if (c.subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(160, 160, 160)
      doc.text(c.subtitle.toUpperCase(), CX, 148, { align: 'center' })
    }

    // Topic
    if (c.topic) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.text(c.topic, CX, 165, { align: 'center' })
    }

    // Issue number
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(`NÚMERO ${issueData.number}`, CX, PH - 35, { align: 'center' })
  }

  // ═══════════════ SECTIONS ═══════════════
  let secNum = 0
  for (const section of issueData.sections) {
    if (section.type === 'portada') continue
    secNum++

    doc.addPage()
    const hasBg = !!section.backgroundImage
    if (hasBg) await addBg(doc, section.backgroundImage!)

    const c = section.content
    let y = M + 10

    const subMap: Record<string, string | null> = {
      fadu_catala: "Refundació de l'humor negre",
      pagines_grogues: "Proverbis accidentals",
      full_mural: "Collages i contribucions dels lectors",
      ludita: "Mots encreuats d'aclariment",
    }
    const sub = subMap[section.type] || null

    y = sectionH(doc, section.title, sub, secNum, y)

    // ── Body sections ──
    if (c.body) {
      if (section.type === 'aclariment_cultural') {
        // Left accent bar
        doc.setFillColor(239, 68, 68)
        doc.rect(M, y, 1.5, 60, 'F')
        const indent = M + 6
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(190, 190, 190)
        const lines = toLines(doc, stripHtml(c.body), COL_W - 8)
        for (const l of lines) {
          y = brk(doc, y, 5.5)
          doc.text(l as string, indent, y)
          y += 5.5
        }
        y += 4
      } else if (section.type === 'visita') {
        if (c.source) {
          y = brk(doc, y, 6)
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(8.5)
          doc.setTextColor(120, 120, 120)
          doc.text(c.source, M, y)
          y += 8
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(36)
        doc.setTextColor(239, 68, 68)
        doc.setTextColor(239, 68, 68, 0.2)
        doc.text('"', M, y + 4)

        doc.setFont('helvetica', 'italic')
        doc.setFontSize(10)
        doc.setTextColor(190, 190, 190)
        const blines = toLines(doc, stripHtml(c.body), COL_W - 10)
        for (const l of blines) {
          y = brk(doc, y, 5.5)
          doc.text(l as string, M + 10, y)
          y += 5.5
        }
        y += 4
      } else {
        y = prose(doc, c.body, y)
      }
    }

    // ── Proverbs ──
    if (c.proverbs) {
      for (const p of c.proverbs) {
        y = brk(doc, y, 14)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(11)
        doc.setTextColor(220, 220, 220)
        const plines = toLines(doc, `"${p.text}"`, COL_W)
        for (const l of plines) {
          y = brk(doc, y, 5.5)
          doc.text(l as string, M, y)
          y += 5.5
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        doc.text(`— ${p.author}`, M, y + 2)
        y += 10
      }
    }

    // ── Fadu entries ──
    if (c.entries) {
      for (const entry of c.entries) {
        y = brk(doc, y, 10)

        const typeLabel =
          entry.type === 'biography' ? 'Biografia apòcrifa' :
          entry.type === 'ucronia' ? 'Ucronia' : 'Personatge'

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(239, 68, 68)
        doc.text(typeLabel.toUpperCase(), M, y)
        y += 5

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(250, 250, 250)
        const tlines = toLines(doc, entry.title, COL_W)
        for (const l of tlines) {
          y = brk(doc, y, 6)
          doc.text(l as string, M, y)
          y += 6.5
        }

        if (entry.body) {
          y = prose(doc, entry.body, y)
        }

        // Thin separator between entries
        doc.setDrawColor(40, 40, 40)
        doc.setLineWidth(0.2)
        doc.line(M, y, PW - M, y)
        y += 6
      }
    }

    // ── Interviews ──
    if (c.interviews) {
      y = tinyLabel(doc, 'Entrevistes', y)
      for (const item of c.interviews) {
        y = brk(doc, y, 8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(250, 250, 250)
        const slines = toLines(doc, item.subject, COL_W)
        for (const l of slines) {
          doc.text(l as string, M, y)
          y += 6
        }
        if (item.body) y = prose(doc, item.body, y)
        doc.setDrawColor(40, 40, 40)
        doc.setLineWidth(0.2)
        doc.line(M, y, PW - M, y)
        y += 6
      }
    }

    // ── Reviews ──
    if (c.reviews) {
      y = tinyLabel(doc, 'Crítiques', y)
      for (const item of c.reviews) {
        y = brk(doc, y, 8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(250, 250, 250)
        const tlines = toLines(doc, item.title, COL_W)
        for (const l of tlines) {
          doc.text(l as string, M, y)
          y += 6
        }
        if (item.body) y = prose(doc, item.body, y)
        doc.setDrawColor(40, 40, 40)
        doc.setLineWidth(0.2)
        doc.line(M, y, PW - M, y)
        y += 6
      }
    }

    // ── Investigació ──
    if (c.investigacio) {
      y = tinyLabel(doc, 'Investigació', y)
      for (const item of c.investigacio) {
        y = brk(doc, y, 8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(250, 250, 250)
        const tlines = toLines(doc, item.title, COL_W)
        for (const l of tlines) {
          doc.text(l as string, M, y)
          y += 6
        }
        if (item.body) y = prose(doc, item.body, y)
        doc.setDrawColor(40, 40, 40)
        doc.setLineWidth(0.2)
        doc.line(M, y, PW - M, y)
        y += 6
      }
    }

    // ── Collages ──
    if (c.collages) {
      const gap = 5
      const cW = (COL_W - gap) / 2
      const maxH = 42

      y = brk(doc, y, 6)
      for (let i = 0; i < c.collages.length; i += 2) {
        const c1 = c.collages[i]
        const c2 = c.collages[i + 1]
        y = brk(doc, y, maxH + 12)
        const baseY = y

        // Col 1
        doc.setDrawColor(60, 60, 60)
        doc.setLineWidth(0.25)
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
        if (c1?.description) {
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(7)
          doc.setTextColor(120, 120, 120)
          const dl = toLines(doc, c1.description, cW - 6)
          let dy = baseY + maxH + 3
          for (const l of dl) { doc.text(l as string, M + 3, dy); dy += 4 }
        }

        // Col 2
        if (c2) {
          doc.setDrawColor(60, 60, 60)
          doc.setLineWidth(0.25)
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
          if (c2.description) {
            doc.setFont('helvetica', 'italic')
            doc.setFontSize(7)
            doc.setTextColor(120, 120, 120)
            const dl = toLines(doc, c2.description, cW - 6)
            let dy = baseY + maxH + 3
            for (const l of dl) { doc.text(l as string, M + cW + gap + 3, dy); dy += 4 }
          }
        }

        y = baseY + maxH + 12
      }
    }

    // ── Crossword ──
    if (c.crossword) {
      const cell = 6.5
      const gs = c.crossword.gridSize || 11
      const gp = gs * cell
      const sx = (PW - gp) / 2

      y = brk(doc, y, 10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(239, 68, 68)
      doc.text('MOTS ENCREUATS', M, y)
      y += 10

      doc.setDrawColor(120, 120, 120)
      doc.setLineWidth(0.25)
      for (let r = 0; r < gs; r++) {
        for (let cc = 0; cc < gs; cc++) {
          doc.rect(sx + cc * cell, y + r * cell, cell, cell)
        }
      }

      doc.setFontSize(4.5)
      doc.setTextColor(140)
      const across = c.crossword.clues?.across || {}
      const down = c.crossword.clues?.down || {}
      for (const [num, clue] of Object.entries(across) as [string, any][]) {
        doc.text(num.toString(), sx + (clue.col || 0) * cell + 0.4, y + (clue.row || 0) * cell + 4)
      }
      for (const [num, clue] of Object.entries(down) as [string, any][]) {
        doc.text(num.toString(), sx + (clue.col || 0) * cell + 0.4, y + (clue.row || 0) * cell + 4)
      }

      y += gp + 10

      if (Object.keys(across).length > 0) {
        y = brk(doc, y, 6)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(140, 140, 140)
        doc.text('Horitzontals', M, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(180, 180, 180)
        for (const [num, clue] of Object.entries(across) as [string, any][]) {
          const lines = toLines(doc, `${num}. ${clue.clue || ''}`, COL_W)
          for (const l of lines) { y = brk(doc, y, 4); doc.text(l as string, M + 3, y); y += 4 }
        }
        y += 3
      }
      if (Object.keys(down).length > 0) {
        y = brk(doc, y, 6)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(140, 140, 140)
        doc.text('Verticals', M, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(180, 180, 180)
        for (const [num, clue] of Object.entries(down) as [string, any][]) {
          const lines = toLines(doc, `${num}. ${clue.clue || ''}`, COL_W)
          for (const l of lines) { y = brk(doc, y, 4); doc.text(l as string, M + 3, y); y += 4 }
        }
      }
    }

    // Page footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(80, 80, 80)
    doc.text('XERRAC!', M, PH - 15)
    doc.text(`N.${issueData.number} · ${secNum}`, CX, PH - 15, { align: 'center' })
  }

  doc.save(`xerrac-numero-${issueData.number}.pdf`)
  return doc
}
