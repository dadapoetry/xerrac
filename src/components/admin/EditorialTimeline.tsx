'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Section {
  id: string
  type: string
  title: string
  status: string
  order: number
  backgroundImage: string
  content: string
}

interface Issue {
  id: string
  number: number
  title: string
  date: Date
  published: boolean
  status: string
  targetDate: Date | null
  accentColor: string
  sections: Section[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Esborrany', color: 'bg-gray-800 text-gray-500' },
  in_progress: { label: 'En curs', color: 'bg-yellow-900/30 text-yellow-500' },
  review: { label: 'Revisió', color: 'bg-blue-900/30 text-blue-400' },
  published: { label: 'Publicat', color: 'bg-green-900/50 text-green-400' },
}

function sectionReady(s: Section): boolean {
  if (!s.title || !s.title.trim()) return false
  try {
    const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content
    if (s.type === 'portada') return !!c?.topic
    if (s.type === 'editorial' || s.type === 'aclariment_cultural' || s.type === 'visita') return !!c?.body
    if (s.type === 'full_mural') return (c?.collages || []).length > 0
    if (s.type === 'assaig') return (c?.steps || []).length > 0
    if (s.type === 'calaix_sastre') return (c?.interviews || []).length > 0 || (c?.reviews || []).length > 0 || (c?.investigacio || []).length > 0
    if (s.type === 'fadu_catala') return (c?.entries || []).length > 0
    if (s.type === 'pagines_grogues') return (c?.proverbs || []).length > 0
    if (s.type === 'necrologiques') return (c?.entries || []).length > 0
    if (s.type === 'ludita') return !!c?.crossword
    return true
  } catch { return false }
}

function hasImage(s: Section): boolean {
  return !!s.backgroundImage && s.backgroundImage.trim() !== ''
}

export function EditorialTimeline({ issues }: { issues: Issue[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (issues.length === 0) {
    return (
      <div className="border border-gray-800 p-8 text-center text-gray-600">
        No hi ha números. <Link href="/admin/numeros/nou" className="text-red-400 hover:text-red-300">Crea'n un.</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {issues.map((issue) => {
        const sections = [...(issue.sections || [])].sort((a, b) => a.order - b.order)
        const total = sections.length
        const ready = sections.filter(sectionReady).length
        const withImage = sections.filter(hasImage).length
        const progress = total > 0 ? Math.round((ready / total) * 100) : 0
        const statusInfo = STATUS_LABELS[issue.status] || STATUS_LABELS.draft
        const isExpanded = expanded === issue.number
        const targetDate = issue.targetDate ? new Date(issue.targetDate) : null
        const isOverdue = targetDate && !issue.published && targetDate < new Date()

        return (
          <div key={issue.id} className="border border-gray-800">
            {/* Header */}
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : issue.number)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-900/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-2xl font-black text-white tabular-nums shrink-0">
                  {String(issue.number).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{issue.title}</p>
                  <p className="text-xs text-gray-600">
                    {issue.published
                      ? `Publicat ${new Date(issue.date).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : targetDate
                        ? `Objectiu: ${targetDate.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Sense data objectiu'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 tabular-nums w-10 text-right">
                  {ready}/{total}
                </span>
                <span className="text-gray-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-gray-800 p-4 space-y-4">
                {isOverdue && (
                  <p className="text-xs text-red-400 bg-red-900/20 border border-red-900 px-3 py-2">
                    ⚠ Data objectiu passada. El número no està publicat.
                  </p>
                )}

                {/* Progress summary */}
                <div className="flex gap-6 text-xs text-gray-500">
                  <span>Contingut: <span className="text-white">{ready}/{total}</span></span>
                  <span>Imatges: <span className="text-white">{withImage}/{total}</span></span>
                  <span>Progrés: <span className="text-white">{progress}%</span></span>
                </div>

                {/* Section list */}
                <div className="space-y-1">
                  {sections.map((s, i) => {
                    const ready = sectionReady(s)
                    const img = hasImage(s)
                    return (
                      <Link
                        key={s.id}
                        href={`/admin/numeros/${issue.id}`}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-900/50 transition-colors group"
                      >
                        <span className="text-xs text-gray-600 font-mono tabular-nums w-6">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-gray-500 w-28 shrink-0">
                          {s.type}
                        </span>
                        <span className="text-sm text-gray-300 truncate flex-1 group-hover:text-white transition-colors">
                          {s.title || '(sense títol)'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-2xs ${ready ? 'text-green-500' : 'text-red-500'}`}>
                            {ready ? '✓' : '✗'} text
                          </span>
                          <span className={`text-2xs ${img ? 'text-green-500' : 'text-gray-600'}`}>
                            {img ? '✓' : '✗'} img
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Publication checklist */}
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Checklist de publicació</p>
                  <div className="space-y-1.5 text-sm">
                    <CheckItem label="Totes les seccions tenen contingut" ok={ready === total && total > 0} />
                    <CheckItem label="Número té títol" ok={!!issue.title && issue.title.trim() !== ''} />
                    <CheckItem label="Número té data objectiu" ok={!!targetDate} />
                    <CheckItem label="Full de Mur amb peça trobada" ok={sections.some(s => s.type === 'full_mural' && sectionReady(s))} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Link
                    href={`/admin/numeros/${issue.id}`}
                    className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    Editar número →
                  </Link>
                  <Link
                    href={`/admin/numeros/${issue.id}/seccions`}
                    className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    Gestionar seccions →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CheckItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${ok ? 'text-green-500' : 'text-gray-700'}`}>
        {ok ? '✓' : '○'}
      </span>
      <span className={`text-xs ${ok ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  )
}
