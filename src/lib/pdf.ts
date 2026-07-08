'use client'

import jsPDF from 'jspdf'

interface PrintIssueData {
  number: number
  title: string
  date: Date
  sections: {
    type: string
    title: string
    content: any
  }[]
}

export async function generatePDF(issueData: PrintIssueData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  for (let i = 0; i < issueData.sections.length; i++) {
    const section = issueData.sections[i]

    if (i > 0) doc.addPage()

    doc.setFont('Courier', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(section.type.toUpperCase(), margin, margin)

    doc.setFontSize(24)
    doc.setTextColor(0)
    doc.text(section.title, margin, margin + 20)

    let y = margin + 35

    if (section.content.body) {
      const textContent = section.content.body.replace(/<[^>]*>/g, '')
      const lines = doc.splitTextToSize(textContent, pageWidth - margin * 2)
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += 6
      })
    }

    if (section.content.proverbs) {
      section.content.proverbs.forEach((p: any) => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.setFont('Courier', 'italic')
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(`"${p.text}" — ${p.author}`, pageWidth - margin * 2)
        lines.forEach((line: string) => {
          doc.text(line, margin, y)
          y += 6
        })
        y += 4
      })
    }

    if (section.content.entries) {
      section.content.entries.forEach((entry: any) => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.setFont('Courier', 'bold')
        doc.setFontSize(12)
        doc.text(entry.title, margin, y)
        y += 8
        doc.setFont('Courier', 'normal')
        doc.setFontSize(10)
        const text = entry.body.replace(/<[^>]*>/g, '')
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += 6
        })
        y += 6
      })
    }

    if (section.content.interviews) {
      section.content.interviews.forEach((item: any) => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.setFont('Courier', 'bold')
        doc.setFontSize(12)
        doc.text(item.subject, margin, y)
        y += 8
        doc.setFont('Courier', 'normal')
        doc.setFontSize(10)
        const text = item.body.replace(/<[^>]*>/g, '')
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += 6
        })
        y += 6
      })
    }

    if (section.content.reviews) {
      section.content.reviews.forEach((item: any) => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.setFont('Courier', 'bold')
        doc.setFontSize(12)
        doc.text(item.title, margin, y)
        y += 8
        doc.setFont('Courier', 'normal')
        doc.setFontSize(10)
        const text = item.body.replace(/<[^>]*>/g, '')
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += 6
        })
        y += 6
      })
    }
  }

  doc.save(`xerrac-numero-${issueData.number}.pdf`)
  return doc
}
