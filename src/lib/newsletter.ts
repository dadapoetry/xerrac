const FROM = process.env.NEWSLETTER_FROM || 'Xerrac! <contacte@xerrac.cat>'

async function sendEmail({
  to, subject, html,
}: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY no configurada')
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

export async function sendConfirmation(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/api/newsletter/confirm?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Confirma la teva subscripció',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="font-size:18px;margin:0 0 8px">Xerrac<span style="color:#ef4444">!</span></h1>
        <p style="color:#666;font-size:14px;line-height:1.5">
          Gràcies per subscriure't! Fes clic al botó per confirmar:
        </p>
        <a href="${url}"
           style="display:inline-block;background:#ef4444;color:#fff;padding:10px 24px;border-radius:4px;text-decoration:none;font-size:14px;margin:16px 0">
          Confirmar subscripció
        </a>
        <p style="color:#999;font-size:12px">Si no has sol·licitat això, ignora aquest correu.</p>
      </div>
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
  const issueUrl = `${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/?issue=${issue.id}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/api/newsletter/baixa?token=${token}`

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
                  <td style="vertical-align:middle;line-height:0">
                    <svg width="14" height="14" viewBox="0 0 100 100" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8,20 L92,20 L92,32 L88,32 L76,68 L64,32 L58,32 L46,68 L34,32 L28,32 L18,68 L8,32 Z" />
                    </svg>
                  </td>
                </tr>
              </table>
              <h3 style="font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#fff;margin:8px 0 4px;letter-spacing:-0.5px;line-height:1.2">
                ${s.title}
              </h3>
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

               <!-- Hero with cover background -->
              <tr>
                <td ${coverImage ? `background="${coverImage}"` : ''} bgcolor="#000000" style="${heroBg};border:1px solid #222">
                  <!--[if gte mso 9]>
                  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:540px">
                    <v:fill type="frame" src="${coverImage}" color="#000000" />
                    <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                  <![endif]-->
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
                  <!--[if gte mso 9]>
                    </v:textbox>
                  </v:rect>
                  <![endif]-->
                </td>
              </tr>

              <tr><td style="height:32px"></td></tr>

              <!-- Sections -->
              ${sectionsHtml}

              <!-- Footer -->
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
