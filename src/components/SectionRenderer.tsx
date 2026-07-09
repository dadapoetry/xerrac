'use client'

import { SectionData } from '@/types'
import { PortadaSection } from './sections/PortadaSection'
import { EditorialSection } from './sections/EditorialSection'
import { AclarimentCulturalSection } from './sections/AclarimentCulturalSection'
import { FaduCatalaSection } from './sections/FaduCatalaSection'
import { PaginesGroquesSection } from './sections/PaginesGroquesSection'
import { CalaixSastreSection } from './sections/CalaixSastreSection'
import { VisitaSection } from './sections/VisitaSection'
import { FullMuralSection } from './sections/FullMuralSection'
import { LuditaSection } from './sections/LuditaSection'

const sectionMap: Record<string, React.FC<{ section: SectionData; index: number }>> = {
  portada: PortadaSection,
  editorial: EditorialSection,
  aclariment_cultural: AclarimentCulturalSection,
  fadu_catala: FaduCatalaSection,
  pagines_grogues: PaginesGroquesSection,
  calaix_sastre: CalaixSastreSection,
  visita: VisitaSection,
  full_mural: FullMuralSection,
  ludita: LuditaSection,
}

export function SectionRenderer({ section, index }: { section: SectionData; index: number }) {
  const Component = sectionMap[section.type]
  if (!Component) {
    if (typeof window !== 'undefined') {
      console.warn(`Unknown section type: ${section.type}`)
    }
    return null
  }

  return (
    <>
      <div className="section-container">
        {section.backgroundImage && (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${section.backgroundImage}")` }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/55 to-black/75" />
          </>
        )}
        <div className="relative z-[3] w-full">
          <Component section={section} index={index} />
        </div>
      </div>
      <div className="section-divider" />
    </>
  )
}
