'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateIssue } from '@/lib/actions'
import { useToast } from './Toast'

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  const handleToggle = async () => {
    if (pending) return
    setPending(true)
    try {
      await updateIssue(id, { published: !published })
      router.refresh()
    } catch (e: any) {
      toast(e?.message || 'Error en canviar l\'estat de publicació', 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      aria-busy={pending}
      className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-colors
        disabled:opacity-50 disabled:cursor-wait ${
          published
            ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
            : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
        }`}
      title={published ? 'Despublicar' : 'Publicar'}
    >
      {pending ? 'Canviant...' : published ? 'Publicat' : 'Esborrany'}
    </button>
  )
}