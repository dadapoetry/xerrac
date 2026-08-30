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
        '<blockquote class="my-10" style="border-left: 3px solid var(--accent); padding-left: 1.5rem;">',
        '<div class="italic font-light text-xl md:text-2xl leading-relaxed text-gray-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">&ldquo;' + quoteText + '&rdquo;</div>',
        attribution ? '<p class="mt-4 font-mono text-xs tracking-wide" style="color: var(--accent);">&mdash; ' + attribution.replace(/^—\s*/, '') + '</p>' : '',
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
