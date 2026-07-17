import { getSiteUrl } from './site'

const FROM = process.env.NEWSLETTER_FROM || 'Xerrac! <contacte@xerrac.cat>'
const BASE_URL = getSiteUrl().replace(/\/+$/, '')
const SAW_IMG = `<img src="${BASE_URL}/saw-icon.svg" width="20" height="20" alt="" style="display:inline-block;vertical-align:middle;line-height:0;font-size:0;width:20px;height:20px" />`

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 15000, ...fetchOptions } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function sendEmail({
  to, subject, html,
}: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY no configurada')
  }
  const res = await fetchWithTimeout('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
    timeout: 20000,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

export async function sendConfirmation(email: string, token: string) {
  const url = `${BASE_URL}/api/newsletter/confirm?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Xerrac! — Confirma la teva subscripció',
    html: `
      <table style="width:100%;background:#0a0a0a;font-family:Arial,sans-serif">
        <tr>
          <td style="padding:40px 16px">
            <table style="max-width:480px;margin:0 auto;width:100%;border-collapse:collapse">

              <tr>
                <td style="text-align:center;padding:0 0 24px;border-bottom:1px solid #222">
                  <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:-1px">
                    XERRAC<span style="color:#ef4444">!</span>
                  </h1>
                  <div style="height:3px;background:#ef4444;width:60px;margin:10px auto 8px;opacity:0.5"></div>
                  <p style="font-size:12px;color:#666;letter-spacing:3px;text-transform:uppercase;margin:0;font-family:'Courier New',monospace">
                    Butlletí
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 0;text-align:center">
                  ${SAW_IMG}
                  <div style="height:12px"></div>
                  <h2 style="font-size:20px;font-weight:900;color:#fff;margin:0 0 8px;letter-spacing:-0.5px">
                    Gairebé ho tenim!
                  </h2>
                  <p style="font-size:14px;color:#bbb;line-height:1.6;margin:0 0 24px;max-width:360px;margin-left:auto;margin-right:auto">
                    Gràcies per subscriure't al butlletí de Xerrac! Fes clic al botó per confirmar l'adreça:
                  </p>
                  <a href="${url}"
                     style="display:inline-block;background:#ef4444;color:#fff;padding:14px 32px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase">
                    Confirmar subscripció
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0;border-top:1px solid #222;text-align:center">
                  <p style="font-size:12px;color:#555;margin:0;line-height:1.5">
                    Si no has sol·licitat aquesta subscripció, ignora aquest correu.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `,
  })
}

export async function sendNewsletterEmail(
  email: string,
  token: string,
  issue: { id: string; number: number; title: string; date: Date },
  sections: { title: string; summary: string; image?: string; origIndex: number }[],
  coverImage?: string,
) {
  const issueUrl = `${BASE_URL}/?issue=${issue.id}`
  const unsubscribeUrl = `${BASE_URL}/api/newsletter/baixa?token=${token}`

  const sectionsHtml = sections.map((s) => `
    <tr>
      <td style="padding:0 0 0 0">
        <table style="width:100%;border-collapse:collapse;border:1px solid #222;margin-bottom:20px">
          ${s.image ? `
          <tr>
            <td style="display:block;line-height:0">
              <img src="${s.image}" alt="" style="width:100%;height:auto;display:block" />
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:16px 20px">
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="width:20px;vertical-align:middle;line-height:0;font-size:0;padding-right:10px">
                    ${SAW_IMG}
                  </td>
                  <td style="vertical-align:middle">
                    <h3 style="font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#fff;margin:0;letter-spacing:-0.5px;line-height:1.2">
                      ${s.title}
                    </h3>
                  </td>
                </tr>
              </table>
              <div style="width:36px;height:2px;background:#ef4444;margin:8px 0 10px;opacity:0.6"></div>
              ${s.summary ? `
                <p style="font-size:14px;color:#bbb;line-height:1.6;margin:0 0 12px">
                  ${s.summary}
                </p>
              ` : ''}
              <a href="${issueUrl}#s-${s.origIndex}"
                 style="display:inline-block;font-size:12px;color:#ef4444;text-decoration:none;font-weight:600;letter-spacing:1px;text-transform:uppercase">
                Llegeix més →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  const dateStr = new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })
  const heroBg = coverImage
    ? `background-image:url('${coverImage}');background-size:cover;background-position:center;background-repeat:no-repeat`
    : ''

  await sendEmail({
    to: email,
    subject: `Xerrac! — ${issue.title}`,
    html: `
      <table style="width:100%;background:#0a0a0a;font-family:Arial,sans-serif">
        <tr>
          <td style="padding:40px 16px">
            <table style="max-width:540px;margin:0 auto;width:100%;border-collapse:collapse">

              <tr>
                <td ${coverImage ? `background="${coverImage}"` : ''} bgcolor="#000000" style="${heroBg};border:1px solid #222">
                  <div style="background:rgba(0,0,0,0.55);padding:40px 24px;text-align:center">
                    <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:-1px">
                      XERRAC<span style="color:#ef4444">!</span>
                    </h1>
                    <div style="height:3px;background:#ef4444;width:60px;margin:10px auto 8px;opacity:0.5"></div>
                    <p style="font-size:12px;color:#ccc;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;font-family:'Courier New',monospace">
                      Núm. ${String(issue.number).padStart(2, '0')} · ${dateStr}
                    </p>
                    <h2 style="font-size:22px;font-weight:900;color:#fff;margin:0 0 16px;letter-spacing:-0.5px;line-height:1.3">
                      ${issue.title}
                    </h2>
                    <a href="${issueUrl}"
                       style="display:inline-block;background:#ef4444;color:#fff;padding:12px 28px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase">
                      Llegir el número sencer
                    </a>
                  </div>
                </td>
              </tr>

              <tr><td style="height:32px"></td></tr>

              ${sectionsHtml}

              <tr>
                <td style="padding:20px 0 0;border-top:1px solid #222">
                  <p style="font-size:11px;color:#555;margin:0 0 4px;text-align:center">
                    Has rebut aquest correu perquè estàs subscrit al butlletí de Xerrac!
                  </p>
                  <p style="font-size:11px;color:#555;margin:0;text-align:center">
                    <a href="${unsubscribeUrl}" style="color:#666;text-decoration:underline">Donar-me de baixa</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `,
  })
}
