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
      dh = ph
      dw = ph * imgAspect
      dx = (pw - dw) / 2
      dy = 0
    } else {
      dw = pw
      dh = pw / imgAspect
      dx = 0
      dy = (ph - dh) / 2
    }

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = pw * 4
    tempCanvas.height = ph * 4
    const ctx = tempCanvas.getContext('2d')!
    ctx.drawImage(canvas, dx * 4, dy * 4, dw * 4, dh * 4)
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.7)
    doc.addImage(dataUrl, 'JPEG', 0, 0, pw, ph, undefined, 'FAST')
  } catch {
    doc.setFillColor(20, 20, 20)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
  }
}

function renderText(doc: jsPDF, text: string, margin: number, pw: number, ph: number, pos: { y: number }, center = false): void {
  const lines = doc.splitTextToSize(text, pw - margin * 2)
  for (const line of lines) {
    if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
    if (center) {
      const w = doc.getTextWidth(line as string)
      doc.text(line as string, (pw - w) / 2, pos.y)
    } else {
      doc.text(line as string, margin, pos.y)
    }
    pos.y += 6
  }
}

function drawCrossword(doc: jsPDF, crossword: any, margin: number, pw: number, y: number): number {
  const cellSize = 3.5
  const gridPixel = crossword.gridSize * cellSize
  const startX = (pw - gridPixel) / 2

  doc.setDrawColor(150)
  doc.setLineWidth(0.2)

  for (let r = 0; r < crossword.gridSize; r++) {
    for (let c = 0; c < crossword.gridSize; c++) {
      const x = startX + c * cellSize
      const y2 = y + r * cellSize
      doc.rect(x, y2, cellSize, cellSize)
    }
  }

  const across = crossword.clues?.across || {}
  const down = crossword.clues?.down || {}

  doc.setFontSize(6)
  doc.setTextColor(0)
  for (const [num, clue] of Object.entries(across) as [string, any][]) {
    const cx = startX + (clue.col || 0) * cellSize + 0.3
    const cy = y + (clue.row || 0) * cellSize + 0.3
    doc.text(num, cx, cy)
  }
  for (const [num, clue] of Object.entries(down) as [string, any][]) {
    const cx = startX + (clue.col || 0) * cellSize + 0.3
    const cy = y + (clue.row || 0) * cellSize + 0.3
    doc.text(num, cx, cy)
  }

  return y + gridPixel + 8
}

function renderClues(doc: jsPDF, crossword: any, margin: number, pw: number, ph: number, pos: { y: number }): void {
  const across = crossword.clues?.across || {}
  const down = crossword.clues?.down || {}

  doc.setFontSize(8)
  doc.setFont('Courier', 'bold')
  if (Object.keys(across).length > 0) {
    if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
    doc.text('Horitzontals:', margin, pos.y)
    pos.y += 5
    doc.setFont('Courier', 'normal')
    doc.setFontSize(7)
    for (const [num, clue] of Object.entries(across) as [string, any][]) {
      if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
      const txt = `${num}. ${clue.clue || ''} (${(clue.answer || '').length} lletres)`
      const lines = doc.splitTextToSize(txt, pw - margin * 2 - 10)
      for (const line of lines) {
        doc.text(line as string, margin + 5, pos.y)
        pos.y += 4.5
      }
    }
    pos.y += 3
  }

  if (Object.keys(down).length > 0) {
    if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
    doc.setFont('Courier', 'bold')
    doc.setFontSize(8)
    doc.text('Verticals:', margin, pos.y)
    pos.y += 5
    doc.setFont('Courier', 'normal')
    doc.setFontSize(7)
    for (const [num, clue] of Object.entries(down) as [string, any][]) {
      if (pos.y > ph - margin) { doc.addPage(); pos.y = margin }
      const txt = `${num}. ${clue.clue || ''} (${(clue.answer || '').length} lletres)`
      const lines = doc.splitTextToSize(txt, pw - margin * 2 - 10)
      for (const line of lines) {
        doc.text(line as string, margin + 5, pos.y)
        pos.y += 4.5
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
    tempCanvas.width = iw * 4
    tempCanvas.height = ih * 4
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
  const margin = 20

  for (let i = 0; i < issueData.sections.length; i++) {
    const section = issueData.sections[i]
    if (i > 0) doc.addPage()

    if (section.backgroundImage) {
      await addBackgroundImage(doc, section.backgroundImage)
      doc.setTextColor(240)
    } else {
      doc.setTextColor(0)
    }

    const content = section.content
    const centerY = ph / 2 - 20
    let y = centerY
    let pageStarted = false

    const checkPage = () => {
      if (y > ph - margin) {
        doc.addPage()
        y = margin
        pageStarted = false
      }
    }

    if (section.type === 'portada') {
      doc.setFont('Courier', 'bold')
      doc.setFontSize(24)
      doc.text('XERRAC!', pw / 2, ph / 2 - 30, { align: 'center' })
      doc.setFontSize(12)
      doc.setFont('Courier', 'normal')
      if (content.subtitle) {
        doc.text(content.subtitle, pw / 2, ph / 2 - 12, { align: 'center' })
      }
      if (content.topic) {
        doc.setFontSize(10)
        doc.setTextColor(120)
        doc.text(content.topic, pw / 2, ph / 2 + 6, { align: 'center' })
      }
      continue
    }

    doc.setFont('Courier', 'bold')
    doc.setFontSize(10)
    doc.text(section.title, pw / 2, y, { align: 'center' })
    y += 10

    if (content.body) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(9)
      renderText(doc, stripHtml(content.body), margin, pw, ph, { y })
      y += 4
    }

    if (content.proverbs) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(9)
      for (const p of content.proverbs) {
        checkPage()
        doc.setFont('Courier', 'italic')
        const lines = doc.splitTextToSize(`"${p.text}"`, pw - margin * 2)
        for (const line of lines) {
          checkPage()
          doc.text(line as string, margin, y)
          y += 5
        }
        doc.setFont('Courier', 'normal')
        doc.setTextColor(130)
        doc.text(`— ${p.author}`, margin, y + 2)
        y += 9
        doc.setTextColor(section.backgroundImage ? 240 : 0)
      }
    }

    if (content.entries) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(9)
      for (const entry of content.entries) {
        checkPage()
        doc.setFont('Courier', 'bold')
        doc.setFontSize(10)
        doc.text(entry.title, margin, y)
        y += 7
        doc.setFont('Courier', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(120)
        doc.text(`[${entry.type}]`, margin, y)
        y += 5
        doc.setTextColor(section.backgroundImage ? 240 : 0)
        if (entry.body) {
          renderText(doc, stripHtml(entry.body), margin, pw, ph, { y })
        }
        y += 5
      }
    }

    if (content.interviews) {
      for (const item of content.interviews) {
        checkPage()
        doc.setFont('Courier', 'bold')
        doc.setFontSize(10)
        doc.text(item.subject, margin, y)
        y += 7
        doc.setFont('Courier', 'normal')
        doc.setFontSize(9)
        if (item.body) {
          renderText(doc, stripHtml(item.body), margin, pw, ph, { y })
        }
        y += 5
      }
    }

    if (content.reviews) {
      for (const item of content.reviews) {
        checkPage()
        doc.setFont('Courier', 'bold')
        doc.setFontSize(10)
        doc.text(item.title, margin, y)
        y += 7
        doc.setFont('Courier', 'normal')
        doc.setFontSize(9)
        if (item.body) {
          renderText(doc, stripHtml(item.body), margin, pw, ph, { y })
        }
        y += 5
      }
    }

    if (content.collages) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(9)
      doc.text(`Collages (${content.collages.length}):`, margin, y)
      y += 6
      for (const item of content.collages) {
        checkPage()
        if (item.image) {
          await renderCollageImage(doc, item.image, margin, pw, ph, { y })
        } else {
          doc.setTextColor(120)
          doc.text(`- ${item.description || 'sense descripció'}`, margin, y)
          y += 5
          doc.setTextColor(section.backgroundImage ? 240 : 0)
        }
      }
    }

    if (content.crossword) {
      doc.setFont('Courier', 'bold')
      doc.setFontSize(10)
      doc.text('Mots Encreuats', margin, y)
      y += 8
      doc.setFont('Courier', 'normal')
      doc.setFontSize(9)
      y = drawCrossword(doc, content.crossword, margin, pw, y)
      renderClues(doc, content.crossword, margin, pw, ph, { y })
    }
  }

  doc.save(`xerrac-numero-${issueData.number}.pdf`)
  return doc
}
