'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  query: string
  filter: string
}

export function SubscriberFilters({ query, filter }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(query)

  const apply = (f: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (f !== 'all') params.set('f', f)
    router.push(`/admin/subscriptors${params.toString() ? `?${params}` : ''}`)
  }

  const exportCsv = () => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (filter !== 'all') params.set('f', filter)
    window.location.href = `/admin/subscriptors/export?${params}`
  }

  const tabs: { key: string; label: string }[] = [
    { key: 'all', label: 'Tots' },
    { key: 'confirmed', label: 'Confirmats' },
    { key: 'pending', label: 'Pendents' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
      <form
        onSubmit={(e) => { e.preventDefault(); apply(filter) }}
        className="flex gap-2 flex-1"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca per correu..."
          className="flex-1 px-4 py-2.5 bg-black border border-gray-800 text-white text-sm
            focus:outline-none focus:border-red-500/50 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-800 text-gray-300 text-sm uppercase tracking-wider
            hover:bg-gray-700 transition-colors"
        >
          Cerca
        </button>
      </form>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => apply(t.key)}
            className={`px-3 py-2.5 text-xs uppercase tracking-wider transition-colors
              ${filter === t.key
                ? 'bg-red-600 text-white'
                : 'bg-black border border-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={exportCsv}
          title="Descarrega el filtrat actual en CSV"
          className="px-3 py-2.5 text-xs uppercase tracking-wider bg-black border border-gray-800
            text-gray-400 hover:text-white transition-colors"
        >
          CSV
        </button>
      </div>
    </div>
  )
}
