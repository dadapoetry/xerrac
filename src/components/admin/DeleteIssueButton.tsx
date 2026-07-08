'use client'

import { useRouter } from 'next/navigation'
import { deleteIssue } from '@/lib/actions'

export function DeleteIssueButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Estàs segur? Aquesta acció no es pot desfer.')) return
    await deleteIssue(id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-600 hover:text-red-400 transition-colors"
    >
      Eliminar
    </button>
  )
}
