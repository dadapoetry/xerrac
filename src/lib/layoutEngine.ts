import { IssueData, SectionData } from '@/types'

// ── Types ────────────────────────────────────────────────────────────

export interface SectionProfile {
  priority: number
  idealCols: number
  minCols: number
  weight: number
  baseFontSize: number
}

export interface LayoutItem {
  section: SectionData
  profile: SectionProfile
  textLength: number
}

export interface LayoutSlot {
  section: SectionData
  row: number
  col: number
  colSpan: number
  slotW: number
  slotH: number
  fontSize: number
}

export interface LayoutResult {
  slots: LayoutSlot[]
  rowFractions: number[]
  numRows: number
}

// ── Section Profiles ─────────────────────────────────────────────────

const PROFILES: Record<string, SectionProfile> = {
  editorial:          { priority: 10, idealCols: 4, minCols: 3, weight: 8,  baseFontSize: 12 },
  fadu_catala:        { priority:  9, idealCols: 4, minCols: 3, weight: 8,  baseFontSize: 11 },
  visita:             { priority:  8, idealCols: 3, minCols: 2, weight: 6,  baseFontSize: 11 },
  aclariment_cultural:{ priority:  7, idealCols: 3, minCols: 2, weight: 6,  baseFontSize: 11 },
  calaix_sastre:      { priority:  6, idealCols: 3, minCols: 2, weight: 6,  baseFontSize: 11 },
  pagines_grogues:    { priority:  4, idealCols: 2, minCols: 1, weight: 2,  baseFontSize: 10 },
  full_mural:         { priority:  3, idealCols: 2, minCols: 2, weight: 2,  baseFontSize: 10 },
  ludita:             { priority:  1, idealCols: 4, minCols: 2, weight: 10, baseFontSize: 9  },
}

const DEFAULTS: SectionProfile = { priority: 5, idealCols: 2, minCols: 1, weight: 4, baseFontSize: 11 }

// ── Text Length ──────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function getTextLength(section: SectionData): number {
  const c = section.content as any
  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
    case 'visita':
      return stripHtml(c.body || '').length
    case 'fadu_catala': {
      const t = (c.entries || []).map((e: any) => e.title + ' ' + stripHtml(e.body)).join(' ')
      return t.length
    }
    case 'pagines_grogues':
      return (c.proverbs || []).map((p: any) => p.text + p.author).join(' ').length
    case 'calaix_sastre': {
      const i = (c.interviews || []).map((x: any) => x.subject + ' ' + stripHtml(x.body)).join(' ')
      const r = (c.reviews || []).map((x: any) => x.title + ' ' + stripHtml(x.body)).join(' ')
      return i.length + r.length
    }
    case 'full_mural':
      return (c.collages || []).filter((x: any) => x.description).length * 200
    case 'ludita': {
      const cw = c.crossword
      if (cw) {
        const clues = Object.keys(cw.clues.across).length + Object.keys(cw.clues.down).length
        return cw.gridSize * cw.gridSize * 3 + clues * 40
      }
      return 300
    }
    default:
      return 0
  }
}

// ── Row Distribution ─────────────────────────────────────────────────

function distributeIntoRows(items: LayoutItem[]): LayoutItem[][] {
  const crosswords = items.filter(s => s.section.type === 'ludita')
  const content = items.filter(s => s.section.type !== 'ludita')
    .sort((a, b) => b.profile.priority - a.profile.priority)

  if (content.length === 0) return crosswords.length > 0 ? [crosswords] : []

  const rows: LayoutItem[][] = [[]]
  let currentRowCols = 0

  for (const item of content) {
    const ideal = item.profile.idealCols
    if (currentRowCols + ideal <= COLS && rows[rows.length - 1].length < 3) {
      rows[rows.length - 1].push(item)
      currentRowCols += ideal
    } else {
      rows.push([item])
      currentRowCols = ideal
    }
  }

  if (crosswords.length > 0) {
    if (rows[rows.length - 1].length >= 3) {
      rows.push(crosswords)
    } else {
      rows[rows.length - 1].push(...crosswords)
    }
  }

  return rows
}

// ── Column Span Allocation ───────────────────────────────────────────

const COLS = 8

function allocateColSpans(items: LayoutItem[]): number[] {
  const n = items.length
  if (n === 0) return []
  if (n === 1) return [COLS]

  const totalLength = items.reduce((s, it) => s + it.textLength, 0)
  const avgRatio = 1 / n

  let spans = items.map((item, i) => {
    let adj = item.profile.idealCols
    const ratio = totalLength > 0 ? item.textLength / totalLength : avgRatio

    if (ratio > avgRatio * 1.5 && adj < COLS - n + 1) adj++
    else if (ratio < avgRatio * 0.5 && adj > item.profile.minCols) adj--

    return Math.max(adj, item.profile.minCols)
  })

  let sum = spans.reduce((a, b) => a + b, 0)

  while (sum !== COLS) {
    if (sum < COLS) {
      const candidates = spans
        .map((v, i) => ({ idx: i, cur: v, max: COLS - n + 1 }))
        .filter(c => c.cur < c.max)
      if (candidates.length === 0) break
      candidates.sort((a, b) => items[b.idx].profile.priority - items[a.idx].profile.priority)
      spans[candidates[0].idx]++
      sum++
    } else {
      const candidates = spans
        .map((v, i) => ({ idx: i, cur: v, min: items[i].profile.minCols }))
        .filter(c => c.cur > c.min)
      if (candidates.length === 0) break
      candidates.sort((a, b) => items[a.idx].profile.priority - items[b.idx].profile.priority)
      spans[candidates[0].idx]--
      sum--
    }
  }

  return spans
}

// ── Row Fractions ────────────────────────────────────────────────────

const CROSSWORD_ROW_MULT = 1.8

function calculateRowFractions(rows: LayoutItem[][]): number[] {
  if (rows.length === 0) return []
  return rows.map(row => {
    const hasCW = row.some(r => r.section.type === 'ludita')
    const baseWeight = row.reduce((s, r) => s + r.profile.weight + Math.log(r.textLength + 1) * 0.3, 0)
    return hasCW ? baseWeight * CROSSWORD_ROW_MULT : baseWeight
  })
}

// ── Font Size ────────────────────────────────────────────────────────

function calcFontSize(textLen: number, slotW: number, slotH: number, baseFontSize: number): number {
  if (textLen < 10) return Math.min(baseFontSize + 4, 18)
  if (slotW < 1 || slotH < 1) return Math.max(baseFontSize - 2, 8)
  const f = Math.sqrt((slotW * slotH) / (Math.max(textLen, 1) * 0.55 * 1.5))
  const blended = Math.round(f * 0.6 + baseFontSize * 0.4)
  return Math.max(8, Math.min(blended, 18))
}

// ── Main Layout Computation ──────────────────────────────────────────

export function computeLayout(
  issue: IssueData,
  pageW: number,
  pageH: number,
  mastheadH: number,
  footerH: number,
): LayoutResult {
  const sectH = pageH - mastheadH - footerH

  const items: LayoutItem[] = issue.sections
    .filter(s => s.type !== 'portada')
    .slice(0, 9)
    .map(s => ({
      section: s,
      profile: PROFILES[s.type] || DEFAULTS,
      textLength: getTextLength(s),
    }))

  const crosswords = items.filter(s => s.section.type === 'ludita')
  const content = items.filter(s => s.section.type !== 'ludita')
    .sort((a, b) => b.profile.priority - a.profile.priority || b.textLength - a.textLength)
  const ordered = [...content, ...crosswords]

  if (ordered.length === 0) return { slots: [], rowFractions: [], numRows: 0 }

  const rows = distributeIntoRows(ordered)

  const slots: LayoutSlot[] = []
  rows.forEach((row, ri) => {
    const colSpans = allocateColSpans(row)
    let col = 0
    row.forEach((item, ci) => {
      slots.push({
        section: item.section,
        row: ri,
        col,
        colSpan: colSpans[ci],
        slotW: 0,
        slotH: 0,
        fontSize: 0,
      })
      col += colSpans[ci]
    })
  })

  let rowFractions = calculateRowFractions(rows)
  const fracSum = rowFractions.reduce((a, b) => a + b, 0)
  const targetSum = rows.length * 2
  rowFractions = fracSum > 0
    ? rowFractions.map(f => Math.max(f / fracSum * targetSum, 0.5))
    : rows.map(() => 2)

  const normSum = rowFractions.reduce((a, b) => a + b, 0)
  slots.forEach(slot => {
    const rowFrac = rowFractions[slot.row]
    const rowH = normSum > 0 ? (rowFrac / normSum) * sectH : sectH / rows.length
    const slotH = rowH - 52
    const slotW = (slot.colSpan / COLS) * (pageW - 28) - GUTTER

    slot.slotW = Math.max(slotW, 50)
    slot.slotH = Math.max(slotH, 50)

    const item = ordered.find(i => i.section.id === slot.section.id)
    if (item) {
      slot.fontSize = calcFontSize(item.textLength, slot.slotW, slot.slotH, item.profile.baseFontSize)
    }
  })

  return { slots, rowFractions, numRows: rows.length }
}

const GUTTER = 20
