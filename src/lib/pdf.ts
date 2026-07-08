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

async function addBackgroundImage(doc: jsPDF, url: string): Promise<void> {
  try {
    const canvas = await loadImage(url)
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    const imgAspect = canvas.width / canvas.height
    const pageAspect = pw / ph
    let dw: number, dh: number, dx: number, dy: number
    if (imgAspect > pageAspect) {
      dh = ph; dw = ph * imgAspect; dx = (pw - dw) / 2; dy = 0
    } else {
      dw = pw; dh = pw / imgAspect; dx = 0; dy = (ph - dh) / 2
    }
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = pw * 4; tempCanvas.height = ph * 4
    const ctx = tempCanvas.getContext('2d')!
    ctx.drawImage(canvas, dx * 4, dy * 4, dw * 4, dh * 4)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.7)
    doc.addImage(dataUrl, 'JPEG', 0, 0, pw, ph, undefined, 'FAST')
  } catch {
    doc.setFillColor(20, 20, 20)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
  }
}

function renderText(doc: jsPDF, text: string, margin: number, pw: number, ph: number, pos: { y: number }): void {
  const lines = doc.splitTextToSize(text, pw - margin * 2)
  for (const line of lines) {
    if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
    doc.text(line as string, margin, pos.y)
    pos.y += 5
  }
}

function drawCrossword(doc: jsPDF, crossword: any, margin: number, pw: number, y: number): number {
  const cellSize = 7
  const gridSize = crossword.gridSize || 11
  const gridPixel = gridSize * cellSize
  const startX = (pw - gridPixel) / 2

  const numbered = new Set<string>()
  const across = crossword.clues?.across || {}
  const down = crossword.clues?.down || {}

  for (const [num, clue] of Object.entries(across) as [string, any][]) {
    numbered.add(`${clue.row || 0}-${clue.col || 0}`)
  }
  for (const [num, clue] of Object.entries(down) as [string, any][]) {
    numbered.add(`${clue.row || 0}-${clue.col || 0}`)
  }

  doc.setDrawColor(100)
  doc.setLineWidth(0.3)
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      doc.rect(startX + c * cellSize, y + r * cellSize, cellSize, cellSize)
    }
  }

  doc.setFontSize(5)
  doc.setTextColor(120)
  for (const [num, clue] of Object.entries(across) as [string, any][]) {
    const cx = startX + (clue.col || 0) * cellSize + 0.5
    const cy = y + (clue.row || 0) * cellSize + 0.5
    doc.text(num.toString(), cx, cy + 4)
  }
  for (const [num, clue] of Object.entries(down) as [string, any][]) {
    const key = `${clue.row || 0}-${clue.col || 0}`
    if (!(num.toString() in across)) {
      const cx = startX + (clue.col || 0) * cellSize + 0.5
      const cy = y + (clue.row || 0) * cellSize + 0.5
      doc.text(num.toString(), cx, cy + 4)
    }
  }

  return y + gridPixel + 10
}

function renderClues(doc: jsPDF, crossword: any, margin: number, pw: number, ph: number, pos: { y: number }): void {
  const across = crossword.clues?.across || {}
  const down = crossword.clues?.down || {}

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)

  if (Object.keys(across).length > 0) {
    if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
    doc.text('Horitzontals', margin, pos.y)
    pos.y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    for (const [num, clue] of Object.entries(across) as [string, any][]) {
      if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
      const lines = doc.splitTextToSize(`${num}. ${clue.clue || ''}`, pw - margin * 2 - 5)
      for (const line of lines) {
        doc.text(line as string, margin + 3, pos.y)
        pos.y += 4
      }
    }
    pos.y += 3
  }

  if (Object.keys(down).length > 0) {
    if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Verticals', margin, pos.y)
    pos.y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    for (const [num, clue] of Object.entries(down) as [string, any][]) {
      if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
      const lines = doc.splitTextToSize(`${num}. ${clue.clue || ''}`, pw - margin * 2 - 5)
      for (const line of lines) {
        doc.text(line as string, margin + 3, pos.y)
        pos.y += 4
      }
    }
  }
}

async function renderCollageImage(doc: jsPDF, url: string, margin: number, pw: number, ph: number, pos: { y: number }): Promise<void> {
  try {
    const canvas = await loadImage(url)
    const maxW = pw - margin * 2
    const maxH = 80
    const aspect = canvas.width / canvas.height
    let iw = maxW, ih = maxW / aspect
    if (ih > maxH) { ih = maxH; iw = maxH * aspect }
    if (pos.y + ih > ph - margin) { doc.addPage(); pos.y = margin }
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = iw * 4; tempCanvas.height = ih * 4
    const ctx = tempCanvas.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height)
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.7)
    doc.addImage(dataUrl, 'JPEG', margin, pos.y, iw, ih, undefined, 'FAST')
    pos.y += ih + 6
  } catch {
    pos.y += 4
  }
}

export async function generatePDF(issueData: PrintIssueData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margin = 22

  for (let i = 0; i < issueData.sections.length; i++) {
    const section = issueData.sections[i]
    if (i > 0) doc.addPage()

    if (section.backgroundImage) {
      await addBackgroundImage(doc, section.backgroundImage)
      doc.setTextColor(245)
    } else {
      doc.setTextColor(0)
    }

    const content = section.content
    const centerY = ph / 2 - 15
    let y = Math.min(centerY, margin + 10)

    if (section.type === 'portada') {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(32)
      doc.text('XERRAC!', pw / 2, ph / 2 - 35, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(14)
      if (content.subtitle) {
        doc.text(content.subtitle, pw / 2, ph / 2 - 12, { align: 'center' })
      }
      if (content.topic) {
        doc.setFontSize(11)
        doc.setTextColor(120)
        doc.text(content.topic, pw / 2, ph / 2 + 8, { align: 'center' })
      }
      continue
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(section.title, pw / 2, y, { align: 'center' })
    y += 10

    if (content.body) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      renderText(doc, stripHtml(content.body), margin, pw, ph, { y })
      y += 4
    }

    if (content.proverbs) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      for (const p of content.proverbs) {
        const rY = () => Math.min(ph / 2 - 15, margin + 10)
        if (y > ph - margin) { doc.addPage(); y = rY(); if (section.backgroundImage) await addBackgroundImage(doc, section.backgroundImage); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(section.title + ' (cont.)', pw / 2, y, { align: 'center' }); y += 10; doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5) }

        doc.setFont('helvetica', 'italic')
        const lines = doc.splitTextToSize(`"${p.text}"`, pw - margin * 2)
        for (const line of lines) {
          if (y > ph - margin) { doc.addPage(); y = rY(); }
          doc.text(line as string, margin, y)
          y += 5
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(130)
        doc.text(`— ${p.author}`, margin, y + 2)
        y += 8
        doc.setTextColor(section.backgroundImage ? 245 : 0)
        doc.setFontSize(9.5)
      }
    }

    if (content.entries) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      for (const entry of content.entries) {
        if (y > ph - margin) { doc.addPage(); y = Math.min(ph / 2 - 15, margin + 10); }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(entry.title, margin, y)
        y += 7
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(120)
        doc.text(`[${entry.type}]`, margin, y)
        y += 5
        doc.setTextColor(section.backgroundImage ? 245 : 0)
        doc.setFontSize(9.5)
        if (entry.body) {
          renderText(doc, stripHtml(entry.body), margin, pw, ph, { y })
        }
        y += 4
      }
    }

    if (content.interviews) {
      for (const item of content.interviews) {
        if (y > ph - margin) { doc.addPage(); y = Math.min(ph / 2 - 15, margin + 10); }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(item.subject, margin, y)
        y += 7
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        if (item.body) {
          renderText(doc, stripHtml(item.body), margin, pw, ph, { y })
        }
        y += 4
      }
    }

    if (content.reviews) {
      for (const item of content.reviews) {
        if (y > ph - margin) { doc.addPage(); y = Math.min(ph / 2 - 15, margin + 10); }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(item.title, margin, y)
        y += 7
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        if (item.body) {
          renderText(doc, stripHtml(item.body), margin, pw, ph, { y })
        }
        y += 4
      }
    }

    if (content.collages) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(section.backgroundImage ? 245 : 0)
      doc.text(`Collages (${content.collages.length}):`, margin, y)
      y += 6
      for (const item of content.collages) {
        if (y > ph - margin) { doc.addPage(); y = Math.min(ph / 2 - 15, margin + 10); }
        if (item.image) {
          await renderCollageImage(doc, item.image, margin, pw, ph, { y })
        } else {
          doc.setTextColor(120)
          doc.text(`- ${item.description || 'sense descripció'}`, margin, y)
          y += 5
          doc.setTextColor(section.backgroundImage ? 245 : 0)
        }
      }
    }
    if (content.crossword) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Mots Encreuats', margin, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      const gridBottom = drawCrossword(doc, content.crossword, margin, pw, y)
      y = gridBottom + 2
      renderClues(doc, content.crossword, margin, pw, ph, { y })
    }
  }

  doc.save(`xerrac-numero-${issueData.number}.pdf`)
  return doc
}
