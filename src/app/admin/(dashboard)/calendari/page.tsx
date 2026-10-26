import Link from 'next/link'
import { getEditorialCalendar } from '@/lib/data'
import { EditorialTimeline } from '@/components/admin/EditorialTimeline'

export const dynamic = 'force-dynamic'

export default async function CalendariPage() {
  const issues = await getEditorialCalendar()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendari editorial</h1>
          <p className="text-gray-500 text-sm mt-1">
            Estat de tots els números i les seves seccions
          </p>
        </div>
        <Link
          href="/admin/numeros/nou"
          className="px-4 py-2 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 transition-colors"
        >
          + Nou número
        </Link>
      </div>

      <EditorialTimeline issues={issues} />
    </div>
  )
}
