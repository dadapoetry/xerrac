import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'sup', 'sub', 'small', 'mark', 'abbr', 'cite', 'q', 'time',
  'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
]

const SAFE_VALUE = /^[^();<>\\]*$/
const SAFE_STYLE_PROPS = [
  'background-color',
  'color',
  'text-align',
  'font-size',
  'font-weight',
  'font-style',
  'font-family',
  'text-decoration',
  'text-transform',
  'line-height',
  'letter-spacing',
  'vertical-align',
  'white-space',
  'width',
  'height',
  'max-width',
  'max-height',
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'padding',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'border',
  'border-bottom',
  'border-radius',
  'opacity',
]

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    '*': ['style', 'class'],
    a: ['href', 'title', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    span: ['role', 'aria-label', 'title'],
  },
  allowedStyles: {
    '*': Object.fromEntries(SAFE_STYLE_PROPS.map((prop) => [prop, [SAFE_VALUE]])),
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
}

export function sanitizeHtmlFragment(html: string): string {
  return normalizeNonBreakingSpaces(sanitizeHtml(html, OPTIONS))
}

/* En enganxar text d'un processador de textos (Word, Google Docs, un PDF), els
   espais entre paraules arriben com a espais no separables (`\u00a0`). Com que
   no permeten salt de línia, el text no es pot partir i desborda el seu
   contenidor: el cos «se'n surt» de la columna. Cap part del disseny no fa
   servir l'espai no separable per a la composició, així que els tornem tots a
   espais normals i el text recupera el plegat de línia. */
function normalizeNonBreakingSpaces(html: string): string {
  return html.replace(/\u00a0/g, ' ')
}

function isHtmlLike(value: string): boolean {
  return /<\s*[a-zA-Z/!]/.test(value)
}

function walk(value: unknown): unknown {
  if (typeof value === 'string') return isHtmlLike(value) ? sanitizeHtmlFragment(value) : value
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) out[key] = walk(item)
    return out
  }
  return value
}

export function sanitizeSectionContent(content: string): string {
  try {
    return JSON.stringify(walk(JSON.parse(content)))
  } catch {
    return isHtmlLike(content) ? sanitizeHtmlFragment(content) : content
  }
}

export function sanitizeImageUrl(url: string): string {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed
  return ''
}
