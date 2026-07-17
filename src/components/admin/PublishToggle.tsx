'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateIssue } from '@/lib/actions'

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleToggle = async () => {
    try {
      await updateIssue(id, { published: !published })
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Error en canviar estat')
    }
  }

  return (
    <div className="relative">
      {error && <span className="absolute -top-5 left-0 text-[10px] text-red-400 whitespace-nowrap">{error}</span>}
      <button
        onClick={handleToggle}
        className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
          published
            ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
            : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
        }`}
        title={published ? 'Despublicar' : 'Publicar'}
      >
        {published ? 'Publicat' : 'Esborrany'}
      </button>
    </div>
  )
}
