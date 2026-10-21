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
 * mostri el mateix valor que la secció). Retorna `undefined` per a les
 * seccions que no mostren temps de lectura (portada, assaig, necrològiques,
 * full mural, ludita, pàgines grogues).
 */
export function sectionReadingTime(section: any): number | undefined {
  if (!section) return undefined
  const type = section.type
  // Seccions que mostren temps de lectura al seu SectionHeader:
  const showsReadingTime = ['editorial', 'aclariment_cultural', 'fadu_catala', 'calaix_sastre', 'visita'].includes(type)
  if (!showsReadingTime) return undefined

  const content = (typeof section.content === 'string' ? safeParse(section.content) : section.content) || {}
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
    }
  } catch {
    body = ''
  }
  if (!body || !body.trim()) return undefined
  return readingTime(body)
}
