export const XERRAC_REF_BLOT = 'referencia'
export const XERRAC_REF_CLASS = 'xerrac-ref'

let registered = false

// Una referència bibliogràfica és un bloc de text (un paràgraf) amb tractament
// propi: cos mono, mida petita i sagnat penjant. Es registra com un bloc de
// Quill (com `blockquote` o `header`) amb una classe pròpia, de manera que el
// format sobreviu en desar i el text queda clicable si porta un enllaç.
// Rebut la instància de Quill de react-quill (ReactQuill.Quill) per no dependre
// del paquet quill directament. Només s'ha d'executar al client, abans que
// react-quill munti l'editor.
export function registerXerracRef(Quill: any): void {
  if (registered || !Quill) return
  const Block = Quill.import('blots/block')

  class XerracRef extends Block {
    // `BlockBlot.formats` retorna undefined per als blots amb tagName P (el P és
    // el bloc genèric), i aleshores el format no es desaria. Sobreescriure'l,
    // com fan els blots de bloc no-P de Quill, fixa el valor del format.
    static formats() {
      return true
    }
  }

  XerracRef.blotName = XERRAC_REF_BLOT
  XerracRef.tagName = 'P'
  XerracRef.className = XERRAC_REF_CLASS

  Quill.register(XerracRef, true)
  registered = true
}
