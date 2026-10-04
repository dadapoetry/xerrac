'use client'

import { useEffect, useMemo, useState } from 'react'
import { SectionRenderer } from '@/components/SectionRenderer'
import { safeParse } from '@/lib/utils'
import { sanitizeImageUrl, sanitizeSectionContent } from '@/lib/sanitize'
import type { SectionData } from '@/types'

interface Props {
  type: string
  title: string
  bgImage: string
  bgImageMobile: string
  content: string
}

export function SectionPreview({ type, title, bgImage, bgImageMobile, content }: Props) {
  // El sanejament no és gratuït: en textos llargs fer-lo a cada pulsació
  // endarreriria el tipus, així que la previsualització va amb retard.
  const [delayedContent, setDelayedContent] = useState(content)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedContent(content), 400)
    return () => clearTimeout(timer)
  }, [content])

  // Es passa pel mateix sanejament del servidor perquè el que es veu aquí
  // és exactament el que quedarà desat.
  const section = useMemo<SectionData>(
    () => ({
      id: 'preview',
      issueId: 'preview',
      type,
      order: 0,
      title,
      backgroundImage: sanitizeImageUrl(bgImage),
      backgroundImageMobile: sanitizeImageUrl(bgImageMobile),
      content: safeParse(sanitizeSectionContent(delayedContent)),
    }),
    [type, title, bgImage, bgImageMobile, delayedContent]
  )

  return (
    <div className="preview-root bg-black">
      <SectionRenderer section={section} index={0} />
    </div>
  )
}