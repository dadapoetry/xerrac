import { getSubscribers, getSubscriberStats, SubscriberFilter } from '@/lib/subscribers'
import { SubscriberFilters } from '@/components/admin/SubscriberFilters'

export const dynamic = 'force-dynamic'

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: string; p?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const filter = (['all', 'confirmed', 'pending'].includes(sp.f || '')
    ? sp.f
    : 'all') as SubscriberFilter
  const page = Math.max(1, parseInt(sp.p || '1', 10) || 1)

  const [result, stats] = await Promise.all([
    getSubscribers(query, filter, page, 50),
    getSubscriberStats(),
  ])

  const totalPages = Math.ceil(result.total / 50)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Subscriptors</h1>
        <p className="text-gray-500 text-sm mt-1">
          {stats.total} en total · <span className="text-white">{stats.confirmed}</span> confirmats
          {stats.pending > 0 && (
            <> · <span className="text-yellow-500">{stats.pending}</span> pendents de confirmar</>
          )}
        </p>
      </div>

      <SubscriberFilters query={query} filter={filter} />

      <div className="border border-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-900 text-left">
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-normal">
                Correu
              </th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-normal w-32">
                Estat
              </th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-900/60 hover:bg-gray-900/30">
                <td className="px-4 py-3 text-white break-all">{r.email}</td>
                <td className="px-4 py-3">
                  {r.confirmed ? (
                    <span className="text-green-500 text-xs uppercase tracking-wider">
                      Confirmat
                    </span>
                  ) : (
                    <span className="text-yellow-500 text-xs uppercase tracking-wider">
                      Pendent
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-gray-600 text-sm italic">
                  {query ? 'Cap resultat per a aquesta cerca.' : 'Encara no hi ha subscriptors.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-600">
            Pàgina {page} de {totalPages} ({result.total} subscriptors)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/subscriptors?q=${encodeURIComponent(query)}&f=${filter}&p=${page - 1}`}
                className="px-3 py-1.5 text-xs border border-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/subscriptors?q=${encodeURIComponent(query)}&f=${filter}&p=${page + 1}`}
                className="px-3 py-1.5 text-xs border border-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                Següent →
              </a>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-700 mt-4 leading-relaxed">
        Només els subscriptors <span className="text-gray-500">confirmats</span> reben el
        butlletí. Els pendents s&apos;envien el correu de confirmació i no entren a l&apos;enviament.
      </p>
    </div>
  )
}
