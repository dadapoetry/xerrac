import { getLatestPublishedIssue } from '@/lib/data'
import { accentStyle } from '@/lib/color'

/**
 * Àmbit d'accent per a les pàgines que no tenen número propi (/sobre,
 * /subscriu, /privacitat, /arxiu). Adopten el color del darrer número
 * publicat, de manera que tota la web parla amb la veu del número vigent.
 */
export async function AccentScope({ children }: { children: React.ReactNode }) {
  let latest: any = null
  try {
    latest = await getLatestPublishedIssue()
  } catch {
    latest = null
  }
  const accent = latest?.accentColor || '#ef4444'
  return <div style={accentStyle(accent)}>{children}</div>
}
