import { getSubscribers, getSubscriberStats, SubscriberFilter } from '@/lib/subscribers'
import { SubscriberFilters } from '@/components/admin/SubscriberFilters'

export const dynamic = 'force-dynamic'

const dateFmt = new Intl.DateTimeFormat('ca-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: { q?: string; f?: string }
}) {
  const query = searchParams.q || ''
  const filter = (['all', 'confirmed', 'pending'].includes(searchParams.f || '')
    ? searchParams.f
    : 'all') as SubscriberFilter

  const [rows, stats] = await Promise.all([
    getSubscribers(query, filter),
    getSubscriberStats(),
  ])

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
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-normal w-40">
                Alta
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {dateFmt.format(r.createdAt)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-gray-600 text-sm italic">
                  {query ? 'Cap resultat per a aquesta cerca.' : 'Encara no hi ha subscriptors.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-700 mt-4 leading-relaxed">
        Només els subscriptors <span className="text-gray-500">confirmats</span> reben el
        butlletí. Els pendents s&apos;envien el correu de confirmació i no entren a l&apos;enviament.
      </p>
    </div>
  )
}
