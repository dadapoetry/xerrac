import { styleBlockquotes, prepareBody } from '@/lib/html'

interface EditorialArticleProps {
  body: string
  /** 'quoted' wraps blockquotes as pull-quotes (Aclariment Cultural). */
  style?: 'default' | 'quoted'
  /** Whether to apply the shared drop cap (capitular). Default true. */
  capitular?: boolean
  /** Extra classes merged onto the article container. */
  className?: string
}

/**
 * Component compartit per a tots els articles editorials de Xerrac.
 *
 * Centralitza en un sol lloc el que abans cada secció aplicava a mà alçada:
 *  - drop-shadow del text (ara viu a `.editorial-body` a globals.css),
 *  - mida i interlineat del cos de text llarg,
 *  - capitular (classe `.capitular`, definida globalment).
 *
 * La mida és la mateixa que a la resta de seccions de text llarg
 * (`text-sm md:text-md`): el cos de la revista no canvia de mida segons la
 * secció ni segons la finestra. L'Editorial i l'Aclariment Cultural es
 * diferencien per l'interlineat una mica més obert, pel capitular i per la
 * mesura de columna, no per uns pixels més de cos.
 *
 * Així el tractament és idèntic a totes les seccions i canviar-lo no implica
 * tocar N fitxers.
 */
export function EditorialArticle({ body, style = 'default', capitular = true, className = '' }: EditorialArticleProps) {
  const html = style === 'quoted' ? styleBlockquotes(prepareBody(body), 'quoted') : styleBlockquotes(prepareBody(body))
  return (
    <div
      className={`editorial-body ${capitular ? 'capitular' : ''} text-justify hyphens-auto text-gray-200 text-sm md:text-md leading-[1.8] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
