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
        '<blockquote class="my-12" style="border-left: 2px solid var(--accent); padding-left: 1.5rem;">',
        '<span style="display:block; font-family: Georgia, \'Times New Roman\', serif; font-size: 3.75rem; line-height: 0.7; margin-bottom: -0.35em; color: var(--accent);" aria-hidden="true">&ldquo;</span>',
        '<div class="italic font-medium text-xl md:text-2xl leading-snug text-white">' + quoteText + '</div>',
        attribution ? '<p class="mt-5 font-mono text-xs uppercase tracking-[0.15em]" style="color: var(--accent);">&mdash; ' + attribution.replace(/^—\s*/, '') + '</p>' : '',
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
