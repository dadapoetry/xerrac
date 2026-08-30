export function styleBlockquotes(html: string): string {
  if (!html) return ''
  return html.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_, inner: string) => {
      const trimmed = inner.trim()
      const hasAttribution = /—\s+\S/.test(trimmed)
      if (!hasAttribution) {
        return '<div class="xerrac-quote">' + trimmed + '</div>'
      }
      const split = trimmed.lastIndexOf('—')
      const quoteText = trimmed.substring(0, split).trim()
      const attribution = trimmed.substring(split).trim().replace(/^—\s*/, '')
      return (
        '<div class="xerrac-quote">' +
        quoteText +
        '<p class="xerrac-quote-attribution">&mdash; ' +
        attribution +
        '</p>' +
        '</div>'
      )
    }
  )
}

export function readingTime(html: string, wordsPerMinute = 200): number {
  if (!html) return 1
  const text = html.replace(/<[^>]*>/g, '').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}
