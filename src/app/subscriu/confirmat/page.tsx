import type { Metadata } from 'next'
import { NewsletterResult } from '@/components/NewsletterResult'

export const metadata: Metadata = {
  title: 'Subscripció confirmada',
  robots: { index: false, follow: false },
}

// Pàgina d'arribada després de prémer el botó de confirmació del correu.
// `estat=ok` només l'hi posa el POST de /api/newsletter/confirm; qualsevol
// altra cosa (accés directe inclòs) es tracta com un error, per prudència.
export default async function SubscriptionConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ estat?: string }>
}) {
  const { estat } = await searchParams
  return <NewsletterResult mode="subscripcio" ok={estat === 'ok'} />
}
