'use client'

import { useState } from 'react'
import { sendIssueNewsletter } from '@/lib/actions'
import { useToast } from './Toast'
import { Modal } from './Modal'

interface Props {
  issueId: string
  issueTitle?: string
  issueNumber?: number
  confirmedSubscribers?: number
}

export function SendNewsletterButton({
  issueId,
  issueTitle,
  issueNumber,
  confirmedSubscribers,
}: Props) {
  const { toast } = useToast()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [confirming, setConfirming] = useState(false)

  const recipients = confirmedSubscribers ?? 0
  const label = issueTitle
    ? `${issueNumber !== undefined ? `Núm. ${issueNumber} · ` : ''}«${issueTitle}»`
    : 'Aquest número'

  const handleSend = async () => {
    setConfirming(false)
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
    <span className="inline-flex flex-wrap items-center gap-2 align-middle">
      <button
        onClick={() => setConfirming(true)}
        disabled={status === 'sending'}
        className="text-xs px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 uppercase tracking-wider"
      >
        {status === 'sending' ? 'Enviant...' : status === 'done' ? 'Tornar a enviar' : 'Enviar butlletí'}
      </button>
      {(status === 'done' || status === 'error') && (
        <>
          <span
            className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-green-500'}`}
            role="status"
          >
            {msg}
          </span>
          <button
            onClick={() => { setStatus('idle'); setMsg('') }}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            D&apos;acord
          </button>
        </>
      )}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleSend}
        title="Enviar el butlletí?"
        message={
          recipients === 0
            ? `${label} s'enviarà als subscriptors confirmats. Actualment no n'hi ha cap, així que no arribarà a ningú.`
            : `${label} s'enviarà a ${recipients} subcriptor${recipients === 1 ? '' : 's'} confirmat${recipients === 1 ? '' : 's'}. Aquesta acció no es pot desfer.`
        }
        confirmLabel="Sí, enviar"
        variant="danger"
      />
    </span>
  )
}