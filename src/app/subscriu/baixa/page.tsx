import type { Metadata } from 'next'
import { NewsletterResult } from '@/components/NewsletterResult'

export const metadata: Metadata = {
  title: 'Baixa del butlletí',
  robots: { index: false, follow: false },
}

// Pàgina d'arribada després de confirmar la baixa del butlletí.
export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { estat?: string }
}) {
  return <NewsletterResult mode="baixa" ok={searchParams.estat === 'ok'} />
}
