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
        '<div class="xerrac-quote -mx-4 md:-mx-12 px-4 md:px-12 border-l-2 my-10" style="border-color: rgba(var(--accent-rgb), 0.15);">',
        '<span class="xerrac-quote-mark" aria-hidden="true">&ldquo;</span>',
        '<div class="pl-8 md:pl-12 pr-4 xerrac-quote-text">' + quoteText + '</div>',
        '<span class="xerrac-quote-mark xerrac-quote-mark-end" aria-hidden="true">&rdquo;</span>',
        attribution ? '<p class="xerrac-quote-attribution pl-8 md:pl-12">&mdash; ' + attribution.replace(/^—\s*/, '') + '</p>' : '',
        '</div>'
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
