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

async function addBackgroundImage(doc: jsPDF, url: string): Promise<void> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const canvas = document.createElement('canvas')
    canvas.width = pageWidth * 4
    canvas.height = pageHeight * 4
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    doc.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
  } catch {
    doc.setFillColor(20, 20, 20)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
  }
}

function renderText(doc: jsPDF, text: string, margin: number, pageWidth: number, pageHeight: number, pos: { y: number }): void {
  const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
  for (const line of lines) {
    if (pos.y > pageHeight - margin) {
      doc.addPage()
      pos.y = margin
    }
    doc.text(line as string, margin, pos.y)
    pos.y += 6
  }
}

export async function generatePDF(issueData: PrintIssueData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  for (let i = 0; i < issueData.sections.length; i++) {
    const section = issueData.sections[i]

    if (i > 0) doc.addPage()

    if (section.backgroundImage) {
      await addBackgroundImage(doc, section.backgroundImage)
      doc.setTextColor(230)
    } else {
      doc.setTextColor(0)
    }

    doc.setFont('Courier', 'bold')
    doc.setFontSize(8)
    doc.text(section.type.toUpperCase() + ' — ' + section.title, margin, margin)

    let y = margin + 15

    const content = section.content

    if (content.subtitle) {
      doc.setFontSize(10)
      doc.text(content.subtitle, margin, y)
      y += 8
    }

    if (content.topic) {
      doc.setFont('Courier', 'italic')
      doc.setFontSize(9)
      doc.text(content.topic, margin, y)
      y += 10
    }

    if (content.body) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      renderText(doc, stripHtml(content.body), margin, pageWidth, pageHeight, { y })
      y += 4
    }

    if (content.proverbs) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      for (const p of content.proverbs) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        doc.setFont('Courier', 'italic')
        const lines = doc.splitTextToSize(`"${p.text}"`, pageWidth - margin * 2)
        for (const line of lines) {
          if (y > pageHeight - margin) { doc.addPage(); y = margin }
          doc.text(line as string, margin, y)
          y += 5
        }
        doc.setFont('Courier', 'normal')
        doc.text(`— ${p.author}`, margin, y + 2)
        y += 10
      }
    }

    if (content.entries) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      for (const entry of content.entries) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        doc.setFont('Courier', 'bold')
        doc.setFontSize(11)
        doc.text(entry.title, margin, y)
        y += 8
        doc.setFont('Courier', 'normal')
        doc.setFontSize(10)
        doc.text(`[${entry.type}]`, margin, y)
        y += 6
        if (entry.body) {
          renderText(doc, stripHtml(entry.body), margin, pageWidth, pageHeight, { y })
        }
        y += 6
      }
    }

    if (content.interviews) {
      for (const item of content.interviews) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        doc.setFont('Courier', 'bold')
        doc.setFontSize(11)
        doc.text(item.subject, margin, y)
        y += 8
        doc.setFont('Courier', 'normal')
        doc.setFontSize(10)
        if (item.body) {
          renderText(doc, stripHtml(item.body), margin, pageWidth, pageHeight, { y })
        }
        y += 6
      }
    }

    if (content.reviews) {
      for (const item of content.reviews) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        doc.setFont('Courier', 'bold')
        doc.setFontSize(11)
        doc.text(item.title, margin, y)
        y += 8
        doc.setFont('Courier', 'normal')
        doc.setFontSize(10)
        if (item.body) {
          renderText(doc, stripHtml(item.body), margin, pageWidth, pageHeight, { y })
        }
        y += 6
      }
    }

    if (content.collages) {
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      doc.text(`[${content.collages.length} collage(s)]`, margin, y)
      y += 6
      for (const item of content.collages) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        doc.text(`- ${item.description || '(sense descripció)'}`, margin, y)
        y += 6
      }
    }

    if (content.crossword) {
      doc.setFontSize(10)
      doc.text(`Crucigrama de ${content.crossword.gridSize}x${content.crossword.gridSize}.`, margin, y)
      y += 6
      doc.text(`Pistes: ${Object.keys(content.crossword.clues?.across || {}).length} horitzontals, ${Object.keys(content.crossword.clues?.down || {}).length} verticals.`, margin, y)
    }
  }

  doc.save(`xerrac-numero-${issueData.number}.pdf`)
  return doc
}
