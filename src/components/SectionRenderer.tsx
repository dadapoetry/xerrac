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

  const bgStyle = section.backgroundImage
    ? {
        backgroundImage: `url(${section.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  return (
    <>
      <div
        id={`section-${section.id}`}
        className={`section-container ${section.backgroundImage ? 'has-bg' : ''}`}
        style={section.backgroundImage ? { ...bgStyle } : {}}
      >
        <span className="section-number">{section.type.toUpperCase()}</span>
        <Component section={section} />
      </div>
      <div className="section-divider" />
    </>
  )
}
