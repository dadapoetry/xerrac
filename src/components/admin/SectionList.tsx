'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteSection, reorderSections } from '@/lib/actions'
import { SECTION_LABELS, SectionData } from '@/types'
import { Modal } from './Modal'
import { useToast } from './Toast'

interface SectionListProps {
  issueId: string
  sections: SectionData[]
}

export function SectionList({ issueId, sections }: SectionListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [sorted, setSorted] = useState(() => [...sections].sort((a, b) => a.order - b.order))
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSection(deleteTarget)
      setSorted((prev) => prev.filter((s) => s.id !== deleteTarget))
      toast('Secció eliminada', 'success')
      router.refresh()
    } catch (e: any) {
      toast(e?.message || 'Error en eliminar la secció', 'error')
    }
    setDeleteTarget(null)
  }

  const moveUp = async (index: number) => {
    if (index <= 0) return
    const newSorted = [...sorted];
    [newSorted[index - 1], newSorted[index]] = [newSorted[index], newSorted[index - 1]]
    setSorted(newSorted)

    try {
      const a = sorted[index]
      const b = sorted[index - 1]
      await reorderSections([
        { id: a.id, order: b.order },
        { id: b.id, order: a.order },
      ])
      router.refresh()
    } catch (e: any) {
      setSorted([...sections].sort((a, b) => a.order - b.order))
      toast(e?.message || 'Error en reordenar', 'error')
    }
  }

  const moveDown = async (index: number) => {
    if (index >= sorted.length - 1) return
    const newSorted = [...sorted];
    [newSorted[index], newSorted[index + 1]] = [newSorted[index + 1], newSorted[index]]
    setSorted(newSorted)

    try {
      const a = sorted[index]
      const b = sorted[index + 1]
      await reorderSections([
        { id: a.id, order: b.order },
        { id: b.id, order: a.order },
      ])
      router.refresh()
    } catch (e: any) {
      setSorted([...sections].sort((a, b) => a.order - b.order))
      toast(e?.message || 'Error en reordenar', 'error')
    }
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
            <div className="flex items-center gap-2">
              <div className="flex mr-1">
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="text-gray-600 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed px-1"
                  title="Moure amunt"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === sorted.length - 1}
                  className="text-gray-600 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed px-1"
                  title="Moure avall"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <Link
                href={`/admin/seccions/${issueId}/${section.id}`}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Editar
              </Link>
              <a
                href={`/?issue=${issueId}#s-${i}`}
                target="_blank"
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                title="Vista prèvia"
              >
                Previsualitzar
              </a>
              <button
                onClick={() => setDeleteTarget(section.id)}
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

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar secció"
        message="Estàs segur? Aquesta acció no es pot desfer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
