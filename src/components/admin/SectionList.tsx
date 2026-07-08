'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteSection } from '@/lib/actions'
import { SECTION_LABELS, SECTION_TYPES, SectionData } from '@/types'

interface SectionListProps {
  issueId: string
  sections: SectionData[]
}

export function SectionList({ issueId, sections }: SectionListProps) {
  const router = useRouter()
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  const handleDelete = async (id: string) => {
    if (!confirm('Estàs segur?')) return
    await deleteSection(id)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Link
        href={`/admin/seccions/${issueId}/nova`}
        className="block p-4 border border-dashed border-gray-700 text-center
          text-sm text-gray-500 hover:border-red-800 hover:text-red-400
          transition-colors"
      >
        + Afegir secció
      </Link>

      {sorted.map((section, i) => (
        <div
          key={section.id}
          className="p-4 border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 font-mono">#{i + 1}</span>
              <span className="text-xs uppercase tracking-wider text-red-400">
                {SECTION_LABELS[section.type] || section.type}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/seccions/${issueId}/${section.id}`}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Editar
              </Link>
              <button
                onClick={() => handleDelete(section.id)}
                className="text-xs text-red-600 hover:text-red-400 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
          {section.title && (
            <p className="text-sm text-white truncate">{section.title}</p>
          )}
          {section.backgroundImage && (
            <p className="text-xs text-gray-700 mt-1 truncate">
              BG: {section.backgroundImage}
            </p>
          )}
        </div>
      ))}

      {sections.length === 0 && (
        <p className="text-sm text-gray-600 text-center py-8">
          Aquest número no té seccions. Afegeix-ne una.
        </p>
      )}
    </div>
  )
}
