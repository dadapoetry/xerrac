import { NextRequest, NextResponse } from 'next/server'
import { getIssue } from '@/lib/data'
import { safeParse } from '@/lib/utils'
import { computeLayout } from '@/lib/layoutEngine'
import { buildPrintHTML } from '@/lib/printHtml'
import { getSetting } from '@/lib/settings'
import { getSiteUrl } from '@/lib/site'

const PAGE_W = 1580
const PAGE_H = 1120
const MASTHEAD_H = 148
const FOOTER_H = 32
const PDFSPARK_URL = 'https://pdfspark.dev/api/v1/pdf/from-html'

function parseIssue(issue: any) {
  return {
    ...issue,
    sections: (issue.sections || []).map((s: any) => ({
      ...s,
      content: typeof s.content === 'string' ? safeParse(s.content) : s.content,
    })),
  }
}

const PDF_CACHE_TTL_MS = 10 * 60 * 1000
const pdfCache = new Map<string, { at: number; buffer: ArrayBuffer; filename: string }>()

export async function GET(
  _request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  const cached = pdfCache.get(params.issueId)
  if (cached && Date.now() - cached.at < PDF_CACHE_TTL_MS) {
    return pdfResponse(cached.buffer, cached.filename)
  }

  const rawIssue = await getIssue(params.issueId)
  if (!rawIssue) return NextResponse.json({ error: 'Issue no trobada' }, { status: 404 })

  try {
    const issue = parseIssue(rawIssue)
    const issn = await getSetting('footer_issn')
    const layout = computeLayout(issue, PAGE_W, PAGE_H, MASTHEAD_H, FOOTER_H)
    const baseUrl = getSiteUrl()
    const html = buildPrintHTML(issue, layout.slots, layout.rowFractions, issn, baseUrl)

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
      console.error('[pdf] PDFSpark error', response.status, (await response.text()).slice(0, 300))
      return NextResponse.json({ error: 'No s\'ha pogut generar el PDF ara mateix.' }, { status: 502 })
    }

    const filename = `xerrac-${String(issue.number).padStart(2, '0')}.pdf`
    const pdfBuffer = await response.arrayBuffer()
    if (pdfCache.size > 20) pdfCache.clear()
    pdfCache.set(params.issueId, { at: Date.now(), buffer: pdfBuffer, filename })

    return pdfResponse(pdfBuffer, filename)
  } catch (err) {
    console.error('[pdf]', err)
    return NextResponse.json({ error: 'Error generant el PDF' }, { status: 500 })
  }
}

function pdfResponse(buffer: ArrayBuffer, filename: string) {
  return new Response(new Blob([buffer], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
