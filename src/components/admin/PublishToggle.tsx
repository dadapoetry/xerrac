'use client'

import { useRouter } from 'next/navigation'
import { updateIssue } from '@/lib/actions'

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter()

  const handleToggle = async () => {
    await updateIssue(id, { published: !published })
    router.refresh()
  }

  return (
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
  )
}
