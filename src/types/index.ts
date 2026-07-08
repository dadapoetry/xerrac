export interface CrosswordCell {
  value: string
  isBlack: boolean
  number?: number
}

export interface CrosswordClue {
  clue: string
  answer: string
  row: number
  col: number
  number?: number
}

export interface CrosswordData {
  gridSize: number
  clues: {
    across: Record<string, CrosswordClue>
    down: Record<string, CrosswordClue>
  }
  grid?: string[][]
}

export interface Proverb {
  text: string
  author: string
}

export interface InterviewEntry {
  subject: string
  body: string
}

export interface ReviewEntry {
  title: string
  body: string
}

export interface CollageEntry {
  image: string
  description: string
}

export interface FaduEntry {
  type: 'biography' | 'ucronia' | 'character'
  title: string
  body: string
}

export interface PortadaContent {
  subtitle: string
  topic: string
}

export interface EditorialContent {
  body: string
}

export interface ExpansioCriticaContent {
  body: string
}

export interface FaduCatalaContent {
  entries: FaduEntry[]
}

export interface PaginesGroquesContent {
  proverbs: Proverb[]
}

export interface CalaixSastreContent {
  interviews: InterviewEntry[]
  reviews: ReviewEntry[]
}

export interface VisitaContent {
  source: string
  body: string
}

export interface FullMuralContent {
  collages: CollageEntry[]
}

export interface LuditaContent {
  crossword: CrosswordData
}

export type SectionContent =
  | PortadaContent
  | EditorialContent
  | ExpansioCriticaContent
  | FaduCatalaContent
  | PaginesGroquesContent
  | CalaixSastreContent
  | VisitaContent
  | FullMuralContent
  | LuditaContent

export interface SectionData {
  id: string
  issueId: string
  type: string
  order: number
  title: string
  content: SectionContent
  backgroundImage: string
}

export interface IssueData {
  id: string
  number: number
  title: string
  date: Date
  published: boolean
  sections: SectionData[]
}

export const SECTION_LABELS: Record<string, string> = {
  portada: 'Portada',
  editorial: 'Editorial',
  expansio_critica: 'Expansió Crítica',
  fadu_catala: 'Fadu Català',
  pagines_grogues: 'Pàgines Groguess',
  calaix_sastre: 'Calaix de Sastre',
  visita: 'Visita',
  full_mural: 'Full Mural',
  ludita: 'Ludita',
}

export const SECTION_TYPES = [
  'portada',
  'editorial',
  'expansio_critica',
  'fadu_catala',
  'pagines_grogues',
  'calaix_sastre',
  'visita',
  'full_mural',
  'ludita',
] as const
