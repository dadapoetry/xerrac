export function styleBlockquotes(html: string): string {
  return html.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_, inner: string) => {
      const trimmed = inner.trim()
      return [
        '<div class="-mx-4 md:-mx-12 px-4 md:px-12 border-l-2 my-8" style="border-color: rgba(var(--accent-rgb), 0.1);">',
        '<span class="text-7xl font-serif leading-none block -mb-8 -ml-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" style="color: rgba(var(--accent-rgb), 0.2);">&ldquo;</span>',
        '<div class="pl-8 md:pl-12 pr-4 relative">',
        '<div class="text-gray-300 leading-relaxed text-[15px] md:text-base italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">' + trimmed + '</div>',
        '</div>',
        '<span class="text-7xl font-serif leading-none block text-right -mt-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" style="color: rgba(var(--accent-rgb), 0.2);">&rdquo;</span>',
        '</div>'
      ].join('')
    }
  )
}
