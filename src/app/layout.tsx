import type { Metadata } from 'next'
import { Inter, Fraunces, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Xerrac! — Revista d\'aclariment cultural',
  description: 'Revista d\'aclariment cultural',
  icons: { icon: '/favicon.svg' },
  manifest: '/api/manifest',
  openGraph: {
    title: 'Xerrac! — Revista d\'aclariment cultural',
    description: 'Revista d\'aclariment cultural',
    siteName: 'Xerrac!',
    type: 'website',
    locale: 'ca_ES',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
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
      <body className={`${inter.variable} ${fraunces.variable} ${sourceSerif.variable} antialiased`}>
        <Providers>
          <div className="animate-fade-in">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
