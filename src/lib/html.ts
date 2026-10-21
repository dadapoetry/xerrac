/* Espais no separables (`\u00a0`). Quan s'enganxa text d'un processador de
   textos (Word, Google Docs, un PDF), els espais entre paraules arriben amb
   aquest caràcter, que no permet salt de línia: el text no es pot partir i
   «se'n surt» de la columna. Cap part del disseny no en fa servir, per a la
   composició, així que els tornem a espais normals. Es fa en pintar perquè el
   contingut ja desat amb aquest soroll es vegi bé sense tocar la base de dades,
   i també en desar (vegeu `sanitize.ts`) perquè no hi torni a entrar. */
import { safeParse } from './utils'

export function normalizeNonBreakingSpaces(html: string): string {
  if (!html) return html
  return html.replace(/\u00a0/g, ' ')
}

/* Paràgrafs buits. Quill 1 desava les línies en blanc com `<p><br /></p>` i
   Quill 2 les desa com `<p></p>`; el segon no fa alçada i el navegador el
   col·lapsa, de manera que la línia en blanc desapareixia en editar i tornar a
   desar. Tornem la forma antiga a tots dos casos perquè el text vell i el nou
   es vegin igual. */
export function restoreBlankLines(html: string): string {
  if (!html) return html
  return html.replace(/<p([^>]*)>\s*<\/p>/gi, '<p$1><br></p>')
}

export function styleBlockquotes(html: string, variant: 'line' | 'quoted' = 'line'): string {
  if (!html) return ''
  return html.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_, inner: string) => {
      const content = inner.trim()
      if (variant === 'quoted') {
        return (
          '<span class="xerrac-quote-quoted">' +
          '«' +
          content +
          '»' +
          '</span>'
        )
      }
      return '<div class="xerrac-quote">' + content + '</div>'
    }
  )
}

/* Prepara un cos HTML per pintar-lo: treu el soroll d'enganxada (espais no
   separables) i restaura les línies en blanc que Quill 2 desa buides. Els
   cossos que a més duen cites passen per `styleBlockquotes` després. */
export function prepareBody(html: string): string {
  return restoreBlankLines(normalizeNonBreakingSpaces(html))
}

export function readingTime(html: string, wordsPerMinute = 200): number {
  if (!html) return 1
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}

/**
 * Calcula el temps de lectura d'una secció segons el seu tipus, replicant
 * la lògica que cada component de secció ja fa servir (perquè el sumari
 * mostri el mateix valor que la secció).
 */
export function sectionReadingTime(section: any): number {
  if (!section) return 1
  const content = (typeof section.content === 'string' ? safeParse(section.content) : section.content) || {}
  const type = section.type
  let body = ''
  try {
    switch (type) {
      case 'editorial':
      case 'aclariment_cultural':
      case 'visita':
        body = content.body || ''
        break
      case 'fadu_catala':
        body = (content.entries || []).map((e: any) => e.body || '').join(' ')
        break
      case 'calaix_sastre':
        body = [
          ...(content.interviews || []).map((i: any) => i.body || ''),
          ...(content.reviews || []).map((r: any) => r.body || ''),
          ...(content.investigacio || []).map((i: any) => i.body || ''),
        ].join(' ')
        break
      case 'pagines_grogues':
        body = (content.proverbs || []).map((p: any) => p.text || '').join(' ')
        break
      case 'full_mural':
        body = (content.collages || []).map((c: any) => c.description || '').join(' ')
        break
      case 'assaig':
        body = (content.steps || []).map((s: any) => (s.text || '') + ' ' + (s.title || '')).join(' ')
        break
      case 'necrologiques':
        body = (content.entries || []).map((e: any) => (e.name || '') + ' ' + (e.epitaph || '')).join(' ')
        break
      default:
        body = content.body || content.text || ''
        break
    }
  } catch {
    body = ''
  }
  if (!body || !body.trim()) return 1
  return readingTime(body)
}
