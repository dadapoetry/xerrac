'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { SectionData } from '@/types'

type SectionProps = { section: SectionData; index: number }

const PortadaSection = dynamic<SectionProps>(() => import('./sections/PortadaSection').then(m => m.PortadaSection))
const EditorialSection = dynamic<SectionProps>(() => import('./sections/EditorialSection').then(m => m.EditorialSection))
const AclarimentCulturalSection = dynamic<SectionProps>(() => import('./sections/AclarimentCulturalSection').then(m => m.AclarimentCulturalSection))
const FaduCatalaSection = dynamic<SectionProps>(() => import('./sections/FaduCatalaSection').then(m => m.FaduCatalaSection))
const PaginesGroquesSection = dynamic<SectionProps>(() => import('./sections/PaginesGroquesSection').then(m => m.PaginesGroquesSection))
const CalaixSastreSection = dynamic<SectionProps>(() => import('./sections/CalaixSastreSection').then(m => m.CalaixSastreSection))
const VisitaSection = dynamic<SectionProps>(() => import('./sections/VisitaSection').then(m => m.VisitaSection))
const FullMuralSection = dynamic<SectionProps>(() => import('./sections/FullMuralSection').then(m => m.FullMuralSection))
const LuditaSection = dynamic<SectionProps>(() => import('./sections/LuditaSection').then(m => m.LuditaSection))
const ScrollySection = dynamic<SectionProps>(() => import('./sections/ScrollySection').then(m => m.ScrollySection))
const NecrologiquesSection = dynamic<SectionProps>(() => import('./sections/NecrologiquesSection').then(m => m.NecrologiquesSection))

const sectionMap: Record<string, React.ComponentType<SectionProps>> = {
  portada: PortadaSection,
  editorial: EditorialSection,
  aclariment_cultural: AclarimentCulturalSection,
  fadu_catala: FaduCatalaSection,
  pagines_grogues: PaginesGroquesSection,
  calaix_sastre: CalaixSastreSection,
  visita: VisitaSection,
  full_mural: FullMuralSection,
  ludita: LuditaSection,
  scrolly: ScrollySection,
  necrologiques: NecrologiquesSection,
}

export function SectionRenderer({ section, index }: { section: SectionData; index: number }) {
  const [bgReady, setBgReady] = useState(false)
  const Component = sectionMap[section.type]

  useEffect(() => {
    setBgReady(true)
  }, [])
  if (!Component) {
    if (typeof window !== 'undefined') {
      console.warn(`Unknown section type: ${section.type}`)
    }
    return null
  }

  if (section.type === 'scrolly' || section.type === 'necrologiques') {
    return <Component section={section} index={index} />
  }

  return (
    <>
      <div className="section-container">
        {section.backgroundImage && (
          <div
            className={`absolute inset-x-0 top-0 h-[70svh] z-0 bg-cover bg-center transition-opacity duration-700 ${bgReady ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.55) 55%, rgba(0,0,0,0)), url("${section.backgroundImage}")`,
              maskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-[3] w-full">
          <Component section={section} index={index} />
        </div>
      </div>
    </>
  )
}
