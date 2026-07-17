'use client'

import { useState } from 'react'
import { sendIssueNewsletter } from '@/lib/actions'
import { useToast } from './Toast'

export function SendNewsletterButton({ issueId }: { issueId: string }) {
  const { toast } = useToast()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleSend = async () => {
    setStatus('sending')
    try {
      const result = await sendIssueNewsletter(issueId)
      setStatus('done')
      setMsg(result.message)
      toast(result.message, 'success')
    } catch (err: any) {
      setStatus('error')
      const m = err?.message || 'Error en enviar'
      setMsg(m)
      toast(m, 'error')
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={handleSend}
        disabled={status === 'sending'}
        className="text-xs px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 uppercase tracking-wider"
      >
        {status === 'sending' ? 'Enviant...' : status === 'done' ? 'Tornar a enviar' : 'Enviar butlletí'}
      </button>
      {(status === 'done' || status === 'error') && (
        <button
          onClick={() => { setStatus('idle'); setMsg('') }}
          className="text-xs text-gray-500 hover:text-gray-300 underline"
        >
          D'acord
        </button>
      )}
    </span>
  )
}
