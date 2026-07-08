'use client'

import { SectionData } from '@/types'
import { PortadaSection } from './sections/PortadaSection'
import { EditorialSection } from './sections/EditorialSection'
import { ExpansioCriticaSection } from './sections/ExpansioCriticaSection'
import { FaduCatalaSection } from './sections/FaduCatalaSection'
import { PaginesGroquesSection } from './sections/PaginesGroquesSection'
import { CalaixSastreSection } from './sections/CalaixSastreSection'
import { VisitaSection } from './sections/VisitaSection'
import { FullMuralSection } from './sections/FullMuralSection'
import { LuditaSection } from './sections/LuditaSection'

const sectionMap: Record<string, React.FC<{ section: SectionData }>> = {
  portada: PortadaSection,
  editorial: EditorialSection,
  expansio_critica: ExpansioCriticaSection,
  fadu_catala: FaduCatalaSection,
  pagines_grogues: PaginesGroquesSection,
  calaix_sastre: CalaixSastreSection,
  visita: VisitaSection,
  full_mural: FullMuralSection,
  ludita: LuditaSection,
}

export function SectionRenderer({ section }: { section: SectionData }) {
  const Component = sectionMap[section.type]
  if (!Component) return null

  return (
    <>
      <div className="section-container">
        {section.backgroundImage && (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
              style={{ backgroundImage: `url("${section.backgroundImage}")` }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
          </>
        )}
        <div className="relative z-[3] w-full">
          <Component section={section} />
        </div>
      </div>
      <div className="section-divider" />
    </>
  )
}
