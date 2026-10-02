import Link from 'next/link'

export function PrivacyNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] text-gray-600 leading-relaxed ${className}`}>
      En subscriure&apos;t, acceptes la nostra{' '}
      <Link href="/privacitat" className="underline hover:text-gray-400 transition-colors">
        política de privacitat
      </Link>
      . Trobaràs un enllaç per cancel·lar la subscripció al peu de cada butlletí.
    </p>
  )
}
