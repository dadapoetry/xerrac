import { NextRequest, NextResponse } from 'next/server'
import { confirmSubscription, getSubscriptionStatus } from '@/lib/actions'
import { getSiteUrl } from '@/lib/site'

const PAGE = (title: string, body: string) => `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${title}</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;padding:24px}
  .card{max-width:460px;width:100%;background:#141414;border:1px solid #2a2a2a;border-radius:14px;padding:32px;text-align:center}
  h1{font-size:22px;font-weight:800;letter-spacing:-0.4px;margin:0 0 12px}
  p{color:#bbb;font-size:15px;line-height:1.6;margin:0 0 24px}
  button{background:#ef4444;color:#fff;border:0;border-radius:10px;padding:13px 26px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
  a{color:#ef4444}
  .rule{width:36px;height:2px;background:#ef4444;margin:0 auto 20px;opacity:.7}
</style>
</head>
<body>
  <div class="card">
    <div class="rule"></div>
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new NextResponse(PAGE('Enllaç invàlid', '<p>Ens falta el codi de confirmació. Torna a subscriure\'t per rebre\'n un de nou.</p>'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  let status: { confirmed: boolean } | null = null
  try {
    status = await getSubscriptionStatus(token)
  } catch {
    status = null
  }

  if (!status) {
    return new NextResponse(PAGE('Enllaç invàlid', '<p>Aquest enllaç de confirmació no és vàlid o ja s\'ha fet servir. Si ja t\'has subscrit, no cal fer res més.</p>'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  if (status.confirmed) {
    return new NextResponse(PAGE('Ja estàs subscrit', `<p>La teva subscripció ja estava confirmada. Quan publiquem un número nou t\'arribarà al correu.</p><p><a href="${getSiteUrl()}/">Torna a la portada</a></p>`), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  return new NextResponse(
    PAGE(
      'Confirma la teva subscripció',
      `<p>Volíem que el correu fos real, així que necessitem que ho confirmis tu mateix.</p>
       <form method="POST" action="${getSiteUrl()}/api/newsletter/confirm">
         <input type="hidden" name="token" value="${token.replace(/[^a-zA-Z0-9]/g, '')}" />
         <button type="submit">Confirmar subscripció</button>
       </form>`,
    ),
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  const raw = form?.get('token')
  const token = typeof raw === 'string' ? raw : ''
  if (!token) {
    return NextResponse.redirect(new URL('/?subscribed=error', getSiteUrl()))
  }

  try {
    const result = await confirmSubscription(token)
    const dest = new URL('/', getSiteUrl())
    dest.searchParams.set('subscribed', result.ok ? 'ok' : 'error')
    return NextResponse.redirect(dest)
  } catch {
    return NextResponse.redirect(new URL('/?subscribed=error', getSiteUrl()))
  }
}
