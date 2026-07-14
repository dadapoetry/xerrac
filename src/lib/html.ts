export function styleBlockquotes(html: string): string {
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
        '<div class="-mx-4 md:-mx-12 px-4 md:px-12 border-l-2 my-10" style="border-color: rgba(var(--accent-rgb), 0.15);">',
        '<span class="text-8xl font-serif leading-none block -mb-10 -ml-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" style="color: rgba(var(--accent-rgb), 0.15);">&ldquo;</span>',
        '<div class="pl-8 md:pl-12 pr-4 relative">',
        '<div class="text-gray-100 leading-relaxed text-lg md:text-xl font-light italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">' + quoteText + '</div>',
        attribution ? '<p class="text-xs text-gray-500 text-right mt-4 mr-2 font-mono tracking-wide">' + attribution + '</p>' : '',
        '</div>',
        '</div>'
      ].join('')
    }
  )
}

export function readingTime(html: string, wordsPerMinute = 200): number {
  const text = html.replace(/<[^>]*>/g, '').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}
