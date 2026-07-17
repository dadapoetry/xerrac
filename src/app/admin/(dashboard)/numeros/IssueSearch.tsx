'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DeleteIssueButton } from '@/components/admin/DeleteIssueButton'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { batchUpdateIssues } from '@/lib/actions'

interface IssueRow {
  id: string
  number: number
  title: string
  date: string | Date
  published: boolean
}

export function IssueSearch({ issues }: { issues: IssueRow[] }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const filtered = issues.filter((issue) =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    String(issue.number).includes(search)
  )

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((i) => i.id)))
    }
  }

  const batchPublish = useCallback(async (published: boolean) => {
    if (selected.size === 0) return
    setLoading(true)
    try {
      await batchUpdateIssues(Array.from(selected).map((id) => ({ id, published })))
      setSelected(new Set())
      router.refresh()
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selected, router])

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per títol o número..."
          className="w-full max-w-md bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
        />
        {selected.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => batchPublish(true)}
              disabled={loading}
              className="px-3 py-1.5 bg-green-700 text-white text-xs uppercase tracking-wider
                hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Publicar ({selected.size})
            </button>
            <button
              onClick={() => batchPublish(false)}
              disabled={loading}
              className="px-3 py-1.5 bg-gray-700 text-white text-xs uppercase tracking-wider
                hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Despublicar ({selected.size})
            </button>
          </div>
        )}
      </div>

      <div className="border border-gray-800">
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-gray-800
          text-xs uppercase tracking-wider text-gray-500 items-center">
          <button
            onClick={toggleAll}
            className={`w-4 h-4 border ${selected.size === filtered.length && filtered.length > 0 ? 'bg-red-600 border-red-600' : 'border-gray-600'} flex-shrink-0`}
          >
            {selected.size === filtered.length && filtered.length > 0 && (
              <span className="text-white text-[10px] block leading-[14px] text-center">✓</span>
            )}
          </button>
          <span>Núm.</span>
          <span>Títol</span>
          <span>Data</span>
          <span>Estat</span>
          <span>PDF</span>
          <span>Accions</span>
        </div>
        {filtered.map((issue) => (
          <div key={issue.id}
            className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-gray-800
              items-center hover:bg-gray-900 transition-colors"
          >
            <button
              onClick={() => toggleSelect(issue.id)}
              className={`w-4 h-4 border ${selected.has(issue.id) ? 'bg-red-600 border-red-600' : 'border-gray-600'} flex-shrink-0`}
            >
              {selected.has(issue.id) && (
                <span className="text-white text-[10px] block leading-[14px] text-center">✓</span>
              )}
            </button>
            <span className="text-white font-mono">{issue.number}</span>
            <Link href={`/admin/numeros/${issue.id}`} className="text-white hover:text-red-400 transition-colors">
              {issue.title}
            </Link>
            <span className="text-sm text-gray-500">
              {new Date(issue.date).toLocaleDateString('ca-ES')}
            </span>
            <PublishToggle id={issue.id} published={!!issue.published} />
            <Link
              href={`/compilar/${issue.id}`}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              target="_blank"
            >
              Compilar
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/admin/numeros/${issue.id}`}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Editar
              </Link>
              <DeleteIssueButton id={issue.id} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            {search ? 'No hi ha números que coincideixin amb la cerca.' : 'No hi ha números. Crea\'n un de nou.'}
          </div>
        )}
      </div>
    </div>
  )
}
