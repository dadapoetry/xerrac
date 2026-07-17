import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const issueId = searchParams.get('issue')

  let title = 'XERRAC!'
  let subtitle = "Revista d'aclariment cultural"
  let number = ''

  if (issueId) {
    try {
      const { getIssue } = await import('@/lib/actions')
      const issue = await getIssue(issueId)
      if (issue) {
        title = issue.title.toUpperCase()
        subtitle = `Núm. ${issue.number}`
        number = String(issue.number).padStart(2, '0')
      }
    } catch {}
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: number ? 72 : 160,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            color: '#fafafa',
            display: 'flex',
            gap: '8px',
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          {title}
          <span style={{ color: '#ef4444' }}>!</span>
        </div>
        <div
          style={{
            fontSize: 24,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginTop: 20,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
        {number && (
          <div
            style={{
              fontSize: 14,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginTop: 12,
              fontWeight: 400,
            }}
          >
            Xerrac! — Revista d&apos;aclariment cultural
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
