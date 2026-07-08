import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Xerrac! — Revista d\'aclariment cultural',
  description: 'Revista d\'aclariment cultural. Serra, no martell.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
