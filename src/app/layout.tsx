import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { getSiteUrl } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: 'Xerrac! — Revista d\'aclariment cultural',
    template: '%s — Xerrac!',
  },
  description: 'Revista d\'aclariment cultural',
  metadataBase: new URL(siteUrl),
  icons: { icon: '/favicon.svg' },
  manifest: '/api/manifest',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xerrac! — Revista d\'aclariment cultural',
    description: 'Revista d\'aclariment cultural',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="animate-fade-in">
            {children}
          </div>
        </Providers>
        <JsonLd />
      </body>
    </html>
  )
}
