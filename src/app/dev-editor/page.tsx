'use client'

import { useState } from 'react'
import { RichTextEditor } from '@/components/RichTextEditor'

// Pàgina temporal de depuració (no forma part del producte).
export default function DevEditorPage() {
  const [value, setValue] = useState(
    '<p>Un text de prova prou llarg per col·locar el cursor al mig.</p><p>Segon paràgraf amb més text per omplir.</p><p>Tercer paràgraf.</p>'
  )

  return (
    <div style={{ padding: 24, background: '#111', minHeight: '200vh' }}>
      <div style={{ maxWidth: 720 }}>
        <RichTextEditor value={value} onChange={setValue} />
      </div>
      <pre data-testid="out" style={{ color: '#8f8', fontSize: 11, marginTop: 16, whiteSpace: 'pre-wrap' }}>
        {value}
      </pre>
    </div>
  )
}
