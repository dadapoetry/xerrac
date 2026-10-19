'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { SectionData } from '@/types'
import { cloudinaryMobileUrl } from '@/lib/cloudinary'

const DEFAULT_GRADIENT = 'from-black/75 via-black/55 to-black/75'

// Fons d'una secció. La imatge NO s'estira fins a l'alçada del contingut: viu
// en una capa fixada a la finestra i només tan alta com el viewport. Abans, en
// una secció amb molt de text, l'alçada del contenidor podia ser de diverses
// pantalles i `background-size: cover` escalava la imatge fins a
// sobredimensionar-la (retallant-ne gairebé tot l'ample). Amb la capa sticky,
// la imatge es queda sempre a mida de pantalla.
export function SectionBackground({
  section,
  gradient = DEFAULT_GRADIENT,
  children,
}: {
  section: SectionData
  gradient?: string
  children?: ReactNode
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!section.backgroundImage) return null

  // Al mòbil, si l'editor no hi ha pujat una imatge pròpia, se'n demana una de
  // retallada vertical a Cloudinary; si la imatge no és de Cloudinary, cau a la
  // d'escriptori (ho resol la variable CSS --section-bg-mobile).
  const mobileImage =
    section.backgroundImageMobile ||
    cloudinaryMobileUrl(section.backgroundImage) ||
    section.backgroundImage

  return (
    <div className="section-bg-pane" aria-hidden="true">
      <div
        className={`section-bg absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={
          {
            '--section-bg-desktop': `url("${section.backgroundImage}")`,
            '--section-bg-mobile': `url("${mobileImage}")`,
          } as CSSProperties
        }
      />
      <div className={`absolute inset-0 z-[1] bg-gradient-to-b ${gradient}`} />
      {children}
    </div>
  )
}
