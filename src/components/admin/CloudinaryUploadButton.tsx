'use client'

import { useRef, useState } from 'react'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

interface Props {
  onUploaded: (url: string) => void
  label?: string
  transforms?: string
  overwriteFrom?: string
}

export function CloudinaryUploadButton({ onUploaded, label = 'Pujar', transforms, overwriteFrom }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setStatus('uploading')
    setMsg('')
    try {
      const url = await uploadImageToCloudinary(f, transforms, overwriteFrom)
      onUploaded(url)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setMsg(err instanceof Error ? err.message : "No s'ha pogut pujar la imatge.")
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={status === 'uploading'}
        className="text-[11px] text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors uppercase tracking-wider"
      >
        {status === 'uploading' ? 'Pujant...' : `+ ${label}`}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {status === 'error' && <span className="text-red-400 text-xs">{msg}</span>}
    </div>
  )
}