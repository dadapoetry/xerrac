import { IssueData, SectionData } from '@/types'

export interface SectionProfile {
  priority: number
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

const PROFILES: Record<string, SectionProfile> = {
  editorial:          { priority: 10, minCols: 3, weight: 8,  baseFontSize: 12 },
  fadu_catala:        { priority:  9, minCols: 3, weight: 8,  baseFontSize: 11 },
  visita:             { priority:  8, minCols: 2, weight: 6,  baseFontSize: 11 },
  aclariment_cultural:{ priority:  7, minCols: 2, weight: 6,  baseFontSize: 11 },
  calaix_sastre:      { priority:  6, minCols: 2, weight: 6,  baseFontSize: 11 },
  pagines_grogues:    { priority:  4, minCols: 1, weight: 2,  baseFontSize: 10 },
  full_mural:         { priority:  3, minCols: 2, weight: 5,  baseFontSize: 11 },
  ludita:             { priority:  1, minCols: 3, weight: 10, baseFontSize: 9  },
}

const DEFAULTS: SectionProfile = { priority: 5, minCols: 1, weight: 4, baseFontSize: 11 }

const COLS = 8
const CROSSWORD_ROW_MULT = 1.9

const ROW_SIZE_PLANS: Record<number, number[]> = {
  1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [2, 3],
  6: [2, 2, 2], 7: [2, 3, 2], 8: [2, 3, 3], 9: [3, 3, 3],
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function getTextLength(section: SectionData): number {
  const c = section.content as any
  switch (section.type) {
    case 'editorial':
    case 'aclariment_cultural':
      return stripHtml(c.body || '').length
    case 'visita':
      return stripHtml(c.body || '').length + (c.source || '').length
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
      return (c.collages || []).length * 400
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

function buildRows(items: LayoutItem[]): LayoutItem[][] {
  const crosswords = items.filter(s => s.section.type === 'ludita')
  const content = items.filter(s => s.section.type !== 'ludita')
    .sort((a, b) => b.profile.priority - a.profile.priority)

  if (content.length === 0) return crosswords.length > 0 ? [crosswords] : []

  const plan = ROW_SIZE_PLANS[content.length] || [content.length]
  const rows: LayoutItem[][] = []
  let idx = 0
  for (const size of plan) {
    rows.push(content.slice(idx, idx + size))
    idx += size
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

function pickPattern(n: number, hasCW: boolean, isTop: boolean, prevSig: string | null): number[] {
  if (n === 1) return [COLS]

  if (n === 2) {
    if (isTop) return [5, 3]
    if (hasCW) return [5, 3]
    if (prevSig === '5-3' || prevSig === '3-5') return [4, 4]
    return [5, 3]
  }

  if (hasCW) {
    return [2, 2, 4]
  }

  if (isTop) return [4, 2, 2]

  if (prevSig === '4-2-2') return [3, 3, 2]
  if (prevSig === '3-3-2') return [2, 4, 2]
  if (prevSig === '2-4-2') return [4, 2, 2]
  if (prevSig === '5-3') return [3, 3, 2]
  if (prevSig === '3-5') return [2, 4, 2]

  return [3, 3, 2]
}

function patternSignature(spans: number[]): string {
  return spans.join('-')
}

function assignSpansToRow(items: LayoutItem[], pattern: number[]): number[] {
  const n = items.length
  if (n === 0) return []
  if (n === 1) return [COLS]

  const cwIdx = items.findIndex(s => s.section.type === 'ludita')
  let spans = new Array(n).fill(0)

  if (cwIdx >= 0) {
    const cwTarget = pattern[cwIdx]
    const nonCWIndices = items.map((_, i) => i).filter(i => i !== cwIdx)
    const nonCWItems = nonCWIndices.map(i => ({ item: items[i], origIdx: i }))
      .sort((a, b) => b.item.profile.priority - a.item.profile.priority)
    const nonCWPattern = pattern.filter((_, i) => i !== cwIdx)
    const nonCWSizes = [...nonCWPattern].sort((a, b) => b - a)
    nonCWItems.forEach((entry, si) => { spans[entry.origIdx] = nonCWSizes[si] })
    spans[cwIdx] = cwTarget
  } else {
    const sortedItems = items
      .map((item, i) => ({ item, origIdx: i }))
      .sort((a, b) => b.item.profile.priority - a.item.profile.priority)
    const sortedPattern = [...pattern].sort((a, b) => b - a)
    sortedItems.forEach((entry, si) => { spans[entry.origIdx] = sortedPattern[si] })
  }

  spans = spans.map((v, i) => Math.max(v, items[i].profile.minCols))

  const totalLength = items.reduce((s, it) => s + it.textLength, 0)
  if (totalLength > 0) {
    spans = spans.map((v, i) => {
      if (items[i].section.type === 'ludita') return v
      const ratio = items[i].textLength / totalLength
      const avg = 1 / n
      if (ratio > avg * 1.5 && v < COLS - n + 1) return v + 1
      if (ratio < avg * 0.5 && v > items[i].profile.minCols) return v - 1
      return v
    })
  }

  let sum = spans.reduce((a, b) => a + b, 0)
  let iter = 0
  while (sum !== COLS && iter < 30) {
    iter++
    if (sum < COLS) {
      const cands = spans
        .map((v, i) => ({ i, v, max: COLS - n + 1 }))
        .filter(c => c.v < c.max)
      if (cands.length === 0) break
      cands.sort((a, b) => items[b.i].profile.priority - items[a.i].profile.priority)
      spans[cands[0].i]++; sum++
    } else {
      const cands = spans
        .map((v, i) => ({ i, v, min: items[i].profile.minCols }))
        .filter(c => c.v > c.min)
      if (cands.length === 0) break
      cands.sort((a, b) => items[a.i].profile.priority - items[b.i].profile.priority)
      spans[cands[0].i]--; sum--
    }
  }

  return spans
}

function calculateRowFractions(rows: LayoutItem[][]): number[] {
  if (rows.length === 0) return []
  return rows.map(row => {
    const hasCW = row.some(r => r.section.type === 'ludita')
    const baseWeight = row.reduce((s, r) => s + r.profile.weight + Math.log(r.textLength + 1) * 0.3, 0)
    return hasCW ? baseWeight * CROSSWORD_ROW_MULT : baseWeight
  })
}

function calcFontSize(textLen: number, slotW: number, slotH: number, baseFontSize: number): number {
  if (textLen < 10) return Math.min(baseFontSize + 4, 18)
  if (slotW < 1 || slotH < 1) return Math.max(baseFontSize - 2, 8)
  const f = Math.sqrt((slotW * slotH) / (Math.max(textLen, 1) * 0.55 * 1.5))
  const blended = Math.round(f * 0.6 + baseFontSize * 0.4)
  return Math.max(8, Math.min(blended, 18))
}

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

  const rows = buildRows(ordered)

  const slots: LayoutSlot[] = []
  let prevSig: string | null = null

  rows.forEach((row, ri) => {
    const hasCW = row.some(s => s.section.type === 'ludita')
    const pattern = pickPattern(row.length, hasCW, ri === 0, prevSig)
    const spans = assignSpansToRow(row, pattern)
    const sig = patternSignature(spans)

    let col = 0
    row.forEach((item, ci) => {
      slots.push({
        section: item.section,
        row: ri,
        col,
        colSpan: spans[ci],
        slotW: 0,
        slotH: 0,
        fontSize: 0,
      })
      col += spans[ci]
    })

    prevSig = sig
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
    const slotW = (slot.colSpan / COLS) * (pageW - 28) - 20

    slot.slotW = Math.max(slotW, 50)
    slot.slotH = Math.max(slotH, 50)

    const item = ordered.find(i => i.section.id === slot.section.id)
    if (item) {
      slot.fontSize = calcFontSize(item.textLength, slot.slotW, slot.slotH, item.profile.baseFontSize)
    }
  })

  return { slots, rowFractions, numRows: rows.length }
}
