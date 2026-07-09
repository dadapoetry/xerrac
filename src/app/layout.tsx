import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Xerrac! — Revista d\'aclariment cultural',
  description: 'Revista d\'aclariment cultural',
  icons: { icon: '/favicon.svg' },
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
      </body>
    </html>
  )
}
