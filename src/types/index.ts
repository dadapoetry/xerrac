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

export interface ResearchEntry {
  title: string
  body: string
}

export interface CollageEntry {
  image: string
  description: string
}

export interface FaduEntry {
  type: 'biography' | 'ucronia' | 'artefacte'
  title: string
  body: string
}

export interface PortadaContent {
  topic: string
}

export interface EditorialContent {
  body: string
}

export interface AclarimentCulturalContent {
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
  investigacio: ResearchEntry[]
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
  | AclarimentCulturalContent
  | FaduCatalaContent
  | PaginesGroquesContent
  | CalaixSastreContent
  | VisitaContent
  | FullMuralContent
  | LuditaContent
  | ScrollyContent
  | NecrologiquesContent

export interface ScrollyStep {
  media?: string
  caption?: string
  text: string
}

export interface ScrollyContent {
  subtitle?: string
  steps: ScrollyStep[]
}

export interface NecrologicaEntry {
  name: string
  years?: string
  epitaph: string
}

export interface NecrologiquesContent {
  entries: NecrologicaEntry[]
}

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
  accentColor?: string
  sections: SectionData[]
}

export const SECTION_LABELS: Record<string, string> = {
  portada: 'Portada',
  editorial: 'Editorial',
  aclariment_cultural: 'Aclariment cultural',
  fadu_catala: 'Fadu Català',
  pagines_grogues: 'Pàgines Grogues',
  calaix_sastre: 'Calaix de Sastre',
  visita: 'Visita',
  full_mural: 'Full Mural',
  ludita: 'Ludita',
  scrolly: 'Assaig visual',
  necrologiques: 'Necrològiques',
}

export const SECTION_TYPES = [
  'portada',
  'editorial',
  'aclariment_cultural',
  'fadu_catala',
  'pagines_grogues',
  'calaix_sastre',
  'visita',
  'full_mural',
  'ludita',
  'scrolly',
  'necrologiques',
] as const
