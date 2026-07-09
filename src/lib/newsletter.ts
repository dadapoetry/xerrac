const FROM = process.env.NEWSLETTER_FROM || 'Xerrac! <contacte@xerrac.cat>'

async function sendEmail({
  to, subject, html,
}: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return
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
  sections: { title: string; summary: string; image?: string }[],
) {
  const issueUrl = `${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/?issue=${issue.id}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_URL || 'https://xerrac.vercel.app'}/api/newsletter/baixa?token=${token}`

  const sectionsHtml = sections.map((s, i) => `
    <tr>
      ${s.image ? `
        <td style="width:120px;vertical-align:top;padding:0 16px 12px 0">
          <img src="${s.image}" alt="" style="width:120px;height:auto;border-radius:4px" />
        </td>
      ` : ''}
      <td style="vertical-align:top;padding:0 0 12px 0">
        <h3 style="font-size:14px;margin:0 0 4px;color:#111">${s.title}</h3>
        <p style="font-size:13px;color:#666;line-height:1.4;margin:0 0 6px">${s.summary}</p>
        <a href="${issueUrl}#s-${i}" style="font-size:12px;color:#ef4444">Llegeix més →</a>
      </td>
    </tr>
  `).join('')

  await sendEmail({
    to: email,
    subject: `Xerrac! — Número ${issue.number} publicat`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;margin:0 0 4px">Xerrac<span style="color:#ef4444">!</span></h1>
        <p style="font-size:13px;color:#999;margin:0 0 16px">Núm. ${issue.number} · ${new Date(issue.date).toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' })}</p>
        <h2 style="font-size:16px;margin:0 0 16px">${issue.title}</h2>
        <table style="width:100%;border-collapse:collapse">${sectionsHtml}</table>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
        <a href="${unsubscribeUrl}" style="font-size:11px;color:#999">Donar-me de baixa</a>
      </div>
    `,
  })
}
