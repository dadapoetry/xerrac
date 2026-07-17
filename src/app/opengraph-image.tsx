import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Xerrac! — Revista d\'aclariment cultural'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
            fontSize: 160,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            color: '#fafafa',
            display: 'flex',
            gap: '8px',
          }}
        >
          XERRAC
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
          Revista d&apos;aclariment cultural
        </div>
      </div>
    ),
    { ...size },
  )
}
