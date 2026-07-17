'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteIssue } from '@/lib/actions'
import { Modal } from './Modal'
import { useToast } from './Toast'

export function DeleteIssueButton({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteIssue(id)
      toast('Número eliminat', 'success')
      router.refresh()
    } catch (e: any) {
      toast(e?.message || 'Error en eliminar el número', 'error')
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-red-600 hover:text-red-400 transition-colors"
      >
        Eliminar
      </button>
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar número"
        message="Estàs segur? Aquesta acció no es pot desfer. Totes les seccions associades s'eliminaran."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  )
}
