export function styleBlockquotes(html: string): string {
  if (!html) return ''
  return html.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_, inner: string) => {
      const trimmed = inner.trim()
      const hasAttribution = /—\s+\S/.test(trimmed)
      let quoteText = trimmed
      let attribution = ''
      if (hasAttribution) {
        const split = trimmed.lastIndexOf('—')
        quoteText = trimmed.substring(0, split).trim()
        attribution = trimmed.substring(split).trim()
      }
      return [
        '<blockquote class="xerrac-quote my-8" style="border-left: 2px solid var(--accent); padding-left: 1.25rem;">',
        '<div class="xerrac-quote-text"><span class="xerrac-quote-mark" aria-hidden="true">&ldquo;</span>' + quoteText + '</div>',
        attribution ? '<p class="xerrac-quote-attribution">&mdash; ' + attribution.replace(/^—\s*/, '') + '</p>' : '',
        '</blockquote>'
      ].join('')
    }
  )
}

export function readingTime(html: string, wordsPerMinute = 200): number {
  if (!html) return 1
  const text = html.replace(/<[^>]*>/g, '').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}
