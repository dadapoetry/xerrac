'use client'

import { useState } from 'react'
import { generateIssuePdf } from '@/lib/actions'

export function GeneratePdfButton({ issueId, hasPdf }: { issueId: string; hasPdf: boolean }) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleGenerate = async () => {
    setStatus('generating')
    setMsg('')
    try {
      const result = await generateIssuePdf(issueId)
      setStatus('done')
      setMsg(result.message)
    } catch (err: any) {
      setStatus('error')
      setMsg(err?.message || 'Error en generar el PDF')
    }
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={status === 'generating'}
        className="text-xs px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 uppercase tracking-wider"
      >
        {status === 'generating' ? 'Generant...' : hasPdf ? 'Regenerar PDF' : 'Generar PDF'}
      </button>
      {msg && (
        <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {msg}
        </p>
      )}
    </div>
  )
}
