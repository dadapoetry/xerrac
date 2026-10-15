import Link from 'next/link'

export function PrivacyNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] text-gray-600 leading-relaxed ${className}`}>
      Doble confirmació de correu requerida. Consulta la nostra{' '}
      <Link href="/privacitat" className="underline hover:text-gray-400 transition-colors">
        política de privacitat
      </Link>
      . Baixa disponible a peu de cada butlletí.
    </p>
  )
}
