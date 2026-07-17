'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DeleteIssueButton } from '@/components/admin/DeleteIssueButton'
import { PublishToggle } from '@/components/admin/PublishToggle'

interface IssueRow {
  id: string
  number: number
  title: string
  date: string | Date
  published: boolean
}

export function IssueSearch({ issues }: { issues: IssueRow[] }) {
  const [search, setSearch] = useState('')

  const filtered = issues.filter((issue) =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    String(issue.number).includes(search)
  )

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per títol o número..."
          className="w-full max-w-md bg-gray-900 border border-gray-700 px-4 py-2 text-white
            text-sm focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>

      <div className="border border-gray-800">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-gray-800
          text-xs uppercase tracking-wider text-gray-500">
          <span>Núm.</span>
          <span>Títol</span>
          <span>Data</span>
          <span>Estat</span>
          <span>PDF</span>
          <span>Accions</span>
        </div>
        {filtered.map((issue) => (
          <div key={issue.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-gray-800
              items-center hover:bg-gray-900 transition-colors"
          >
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
