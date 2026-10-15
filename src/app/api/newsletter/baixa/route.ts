import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/actions'
import { getSiteUrl } from '@/lib/site'

// Els tokens són identificadors opacs; els validem abans de fer-los servir per
// no arrossegar res estrany cap a l'HTML de confirmació.
const TOKEN_RE = /^[A-Za-z0-9_-]{8,128}$/

// El GET no ha de canviar res. Els escàners de correu (Outlook, etc.) visiten
// els enllaços dels missatges i donarien de baixa el subscriptor tot sols. Per
// això el GET només mostra una confirmació; la baixa de debò la fa el POST.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!TOKEN_RE.test(token)) {
    return NextResponse.redirect(new URL('/', getSiteUrl()))
  }

  const html = `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Cancel·lar la subscripció — Xerrac!</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#0a0a0a; color:#e5e5e5; padding:24px;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  .card { max-width:26rem; width:100%; border:1px solid #262626; padding:32px; text-align:center; }
  h1 { font-size:1rem; letter-spacing:.08em; text-transform:uppercase; margin:0 0 12px; }
  p { color:#a3a3a3; font-size:14px; line-height:1.6; margin:0 0 24px; }
  button { background:#dc2626; color:#fff; border:0; padding:14px 24px; font-size:13px;
    letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
  a { color:#a3a3a3; font-size:12px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Cancel·lar la subscripció</h1>
    <p>Confirma que vols deixar de rebre el butlletí de Xerrac!.</p>
    <form method="post" action="/api/newsletter/baixa?token=${token}">
      <button type="submit">Confirma la baixa</button>
    </form>
    <p style="margin:16px 0 0"><a href="/">Tornar a la revista</a></p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  const dest = new URL('/', getSiteUrl())

  if (!TOKEN_RE.test(token)) {
    dest.searchParams.set('unsubscribed', 'invalid')
    return NextResponse.redirect(dest, { status: 303 })
  }

  try {
    const result = await unsubscribeByToken(token)
    dest.searchParams.set('unsubscribed', result.removed ? 'ok' : 'invalid')
  } catch {
    dest.searchParams.set('unsubscribed', 'invalid')
  }
  return NextResponse.redirect(dest, { status: 303 })
}