import type { Metadata } from 'next'
import { NewsletterResult } from '@/components/NewsletterResult'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Baixa del butlletí',
  robots: { index: false, follow: false },
  alternates: { canonical: `${getSiteUrl()}/subscriu/baixa` },
}

// Pàgina d'arribada després de confirmar la baixa del butlletí.
export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ estat?: string }>
}) {
  const { estat } = await searchParams
  return <NewsletterResult mode="baixa" ok={estat === 'ok'} />
}
