import type { Metadata } from 'next'
import { SawIcon } from '@/components/SawIcon'
import { SubscribeForm } from '@/components/SubscribeForm'
import { getSiteUrl, ogImageUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Subscri-te al butlletí',
  description:
    'Subscri-te al butlletí de Xerrac! per rebre cada número de la revista d\'aclariment cultural.',
  alternates: { canonical: `${getSiteUrl()}/subscriu` },
  openGraph: {
    title: 'Xerrac! — Subscri-te al butlletí',
    description: 'Cada número de la revista, al teu correu. Sense spam.',
    type: 'website',
    url: `${getSiteUrl()}/subscriu`,
    images: [{ url: ogImageUrl({ title: 'Subscri-te al butlletí' }), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xerrac! — Subscri-te al butlletí',
    description: 'Cada número de la revista, al teu correu. Sense spam.',
    images: [ogImageUrl({ title: 'Subscri-te al butlletí' })],
  },
}

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <span style={{ color: 'var(--accent-text)' }}>
            <SawIcon className="w-4 h-4" />
          </span>
          <span className="text-2xs text-gray-500 font-mono tracking-[0.3em] uppercase">
            Butlletí
          </span>
          <div className="h-px w-12" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.4)' }} />
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-1">
          Encara no t&apos;hi has subscrit?
        </h1>
        <p className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-6" style={{ color: 'var(--accent-text)' }}>
          Aclareix-te!
        </p>

        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          Cada número de <span className="text-white">Xerrac!</span> Revista
          d&apos;aclariment cultural al teu correu.
        </p>

        <SubscribeForm />
      </div>
    </div>
  )
}
