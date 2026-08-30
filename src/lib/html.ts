export function styleBlockquotes(html: string, variant: 'line' | 'quoted' = 'line'): string {
  if (!html) return ''
  return html.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_, inner: string) => {
      const content = inner.trim()
      if (variant === 'quoted') {
        return (
          '<span class="xerrac-quote-quoted">' +
          '&ldquo;' +
          content +
          '&rdquo;' +
          '</span>'
        )
      }
      return '<div class="xerrac-quote">' + content + '</div>'
    }
  )
}

export function readingTime(html: string, wordsPerMinute = 200): number {
  if (!html) return 1
  const text = html.replace(/<[^>]*>/g, '').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}
