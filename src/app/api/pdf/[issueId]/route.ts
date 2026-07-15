import { NextRequest, NextResponse } from 'next/server'
import { getIssue } from '@/lib/actions'
import { computeLayout } from '@/lib/layoutEngine'
import { buildPrintHTML } from '@/lib/printHtml'

const PAGE_W = 1580
const PAGE_H = 1120
const MASTHEAD_H = 148
const FOOTER_H = 32
const PDFSPARK_URL = 'https://pdfspark.dev/api/v1/pdf/from-html'

export async function GET(
  _request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  const issue = await getIssue(params.issueId)
  if (!issue) return NextResponse.json({ error: 'Issue no trobada' }, { status: 404 })

  try {
    const layout = computeLayout(issue, PAGE_W, PAGE_H, MASTHEAD_H, FOOTER_H)
    const html = buildPrintHTML(issue, layout.slots, layout.rowFractions)

    const response = await fetch(PDFSPARK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        options: {
          format: 'A3',
          landscape: true,
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
          filename: `xerrac-${String(issue.number).padStart(2, '0')}.pdf`,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `PDFSpark: ${err}` }, { status: 502 })
    }

    const filename = `xerrac-${String(issue.number).padStart(2, '0')}.pdf`

    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error generant el PDF' }, { status: 500 })
  }
}
