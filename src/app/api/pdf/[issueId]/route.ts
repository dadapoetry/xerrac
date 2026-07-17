import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'pdfs', `${params.issueId}.pdf`)
    const buffer = await readFile(pdfPath)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="xerrac.pdf"',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'PDF no trobat. Genera\'l des del panell d\'administració.' }, { status: 404 })
  }
}
