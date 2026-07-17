'use client'

import { useState } from 'react'
import { sendIssueNewsletter } from '@/lib/actions'

export function SendNewsletterButton({ issueId }: { issueId: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleSend = async () => {
    setStatus('sending')
    try {
      const result = await sendIssueNewsletter(issueId)
      setStatus('done')
      setMsg(result.message)
    } catch (err: any) {
      setStatus('error')
      setMsg(err?.message || 'Error en enviar')
    }
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={status === 'sending'}
        className="text-xs px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 uppercase tracking-wider"
      >
        {status === 'sending' ? 'Enviant...' : status === 'done' ? 'Tornar a enviar' : 'Enviar butlletí'}
      </button>
      {msg && (
        <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {msg}
        </p>
      )}
      {(status === 'done' || status === 'error') && (
        <button
          onClick={() => { setStatus('idle'); setMsg('') }}
          className="text-xs text-gray-500 hover:text-gray-300 ml-2 underline"
        >
          D'acord
        </button>
      )}
    </div>
  )
}
