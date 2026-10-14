import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: 'Prototip — graella de revista' },
  robots: { index: false, follow: false },
}

export default function ProtoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} bg-[#0a0a0a]`}>{children}</div>
}
