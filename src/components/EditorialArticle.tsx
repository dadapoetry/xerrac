import { styleBlockquotes, prepareBody } from '@/lib/html'

interface EditorialArticleProps {
  body: string
  /** 'quoted' wraps blockquotes as pull-quotes (Aclariment Cultural). */
  style?: 'default' | 'quoted'
  /** Extra classes merged onto the article container. */
  className?: string
}

/**
 * Component compartit per a tots els articles editorials de Xerrac.
 *
 * Centralitza en un sol lloc el que abans cada secció aplicava a mà alçada:
 *  - drop-shadow del text (ara viu a `.editorial-body` a globals.css),
 *  - espaiat vertical unificat (gap 2rem, definit a `.editorial-body`),
 *  - capitular (classe `.capitular`, definida globalment).
 *
 * Així el tractament és idèntic a totes les seccions i canviar-lo no implica
 * tocar N fitxers.
 */
export function EditorialArticle({ body, style = 'default', className = '' }: EditorialArticleProps) {
  const html = style === 'quoted' ? styleBlockquotes(prepareBody(body), 'quoted') : styleBlockquotes(prepareBody(body))
  return (
    <div
      className={`editorial-body capitular text-justify hyphens-auto text-gray-200 leading-[1.75] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
