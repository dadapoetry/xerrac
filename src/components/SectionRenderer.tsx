'use client'

import dynamic from 'next/dynamic'
import { SectionData } from '@/types'
import { SectionBackground } from './SectionBackground'

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
  assaig: ScrollySection,
  necrologiques: NecrologiquesSection,
}

export function SectionRenderer({ section, index }: { section: SectionData; index: number }) {
  const Component = sectionMap[section.type]

  if (!Component) {
    if (typeof window !== 'undefined') {
      console.warn(`Unknown section type: ${section.type}`)
    }
    return null
  }

  if (section.type === 'assaig' || section.type === 'necrologiques') {
    return <Component section={section} index={index} />
  }

  return (
    <div className="section-shell">
      <SectionBackground section={section} />
      <div className="section-container">
        <div className="relative z-[3] w-full">
          <Component section={section} index={index} />
        </div>
      </div>
    </div>
  )
}
