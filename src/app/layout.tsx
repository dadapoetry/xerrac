import type { Metadata, Viewport } from 'next'
import { Inter, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { getSiteUrl, ogImageUrl } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'

// Les tres famílies del lloc es carreguen com a fonts web, no com a fonts del
// sistema: 'Courier New' i 'Georgia' no existeixen a molts mòbils (o són unes
// altres), i això feia que la revista semblés escrita amb una tipografia al
// mòbil i amb una altra a l'escriptori.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' })

const siteUrl = getSiteUrl()

// iOS Safari: amb `viewport-fit=cover` la pàgina s'estén fins a dalt de tot i la
// capçalera, que hi va `sticky`, pot arribar a tapar la franja de la barra
// d'estat. Sense això, Safari deixa aquella franja fora del viewport i el
// contingut que hi passa pel darrere s'hi veu a través (damunt del rellotge i de
// la bateria). L'àrea segura resultant es compensa amb la classe `.safe-top`.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    default: 'Xerrac! — Revista d\'aclariment cultural',
    template: '%s — Xerrac!',
  },
  description: 'Revista d\'aclariment cultural',
  metadataBase: new URL(siteUrl),
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  manifest: '/api/manifest',
  alternates: {
    languages: {
      'ca': siteUrl,
      'x-default': siteUrl,
    },
    types: {
      'application/rss+xml': `${siteUrl}/api/feed`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Xerrac! — Revista d\'aclariment cultural',
    description: 'Revista d\'aclariment cultural',
    siteName: 'Xerrac!',
    type: 'website',
    locale: 'ca_ES',
    url: siteUrl,
    // Imatge OG per defecte: les pàgines de número i secció la sobreescriuen.
    images: [{ url: ogImageUrl(), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xerrac! — Revista d\'aclariment cultural',
    description: 'Revista d\'aclariment cultural',
    images: [ogImageUrl()],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={`${inter.variable} ${mono.variable} ${serif.variable}`}>
      <body className="antialiased">
        <Providers>
          <a
            href="#contingut"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
          >
            Salta al contingut
          </a>
          <div id="contingut" role="main" className="animate-fade-in">
            {children}
          </div>
        </Providers>
        <JsonLd />
      </body>
    </html>
  )
}
