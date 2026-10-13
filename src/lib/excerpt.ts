export function extractExcerpt(content: any, maxLen = 200): string {
  if (!content || typeof content !== 'object') return ''
  if (content.topic) return String(content.topic).slice(0, maxLen)
  if (content.subtitle) return String(content.subtitle).slice(0, maxLen)
  if (content.source) return `Entrevista a ${content.source}`.slice(0, maxLen)
  if (content.body) return String(content.body).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen)
  if (content.proverbs) return content.proverbs.map((e: any) => e.text).filter(Boolean).join(' · ').slice(0, maxLen)
  if (content.entries) {
    return content.entries
      .map((e: any) => e.title || e.name || e.epitaph || '')
      .filter(Boolean)
      .join(' · ')
      .slice(0, maxLen)
  }
  if (content.steps) {
    return content.steps.map((e: any) => e.text || e.title || '').filter(Boolean).join(' ').slice(0, maxLen)
  }
  if (content.interviews) return content.interviews.map((e: any) => e.subject || e.body).filter(Boolean).join(', ').slice(0, maxLen)
  if (content.reviews) return content.reviews.map((e: any) => e.title).filter(Boolean).join(', ').slice(0, maxLen)
  if (content.investigacio) return content.investigacio.map((e: any) => e.title).filter(Boolean).join(', ').slice(0, maxLen)
  if (content.collages) return content.collages.map((e: any) => e.description).filter(Boolean).join(' ').slice(0, maxLen)
  if (content.crossword) return 'Encreuat'
  return ''
}
