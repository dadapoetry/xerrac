import { ImageResponse } from 'next/og'
import { getOgFonts } from '@/lib/ogFonts'
import { getOgBackground } from '@/lib/ogImage'

export const runtime = 'nodejs'
export const alt = 'Xerrac! — Revista d\'aclariment cultural'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

export default async function Image() {
  let background: string | null = null
  try {
    const { getLatestIssue } = await import('@/lib/data')
    const latest = await getLatestIssue()
    const cover = (((latest?.sections as any[]) || []).find((s) => s.type === 'portada')?.backgroundImage) || ''
    background = await getOgBackground(cover)
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          position: 'relative',
          display: 'flex',
        }}
      >
        {background && (
          <img
            src={background}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {background && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(10,10,10,0.78)',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
      </div>
    ),
    { ...size, fonts: await getOgFonts() },
  )
}
