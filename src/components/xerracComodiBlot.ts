export const XERRAC_COMODI_BLOT = 'comodi'
export const XERRAC_COMODI_CLASS = 'xerrac-comodi'

let registered = false

// El "mot comodí" és un format inline de Quill (no un embed): embolcalla el text
// seleccionat en un <span class="xerrac-comodi"> sense substituir-lo, de manera
// que la paraula continua essent text editable. El ratllat de serra el dibuixa
// el CSS (.xerrac-comodi a globals.css). Es registra com el `bold` integrat:
// estenent `blots/inline` amb un `tagName` de text i una classe pròpia.
// Rebut la instància de Quill de react-quill (ReactQuill.Quill) per no dependre
// del paquet quill directament. Només s'ha d'executar al client, abans que
// react-quill munti l'editor.
export function registerXerracComodi(Quill: any): void {
  if (registered || !Quill) return
  const Inline = Quill.import('blots/inline')

  class XerracComodi extends Inline {
    static create(value: any) {
      const node = super.create(value) as HTMLElement
      node.setAttribute('title', 'Mot comodí')
      return node
    }
    // `InlineBlot.formats` retorna undefined per als blots amb tagName SPAN
    // (el SPAN és el tag genèric de la classe base), i aleshores `optimize`
    // desfaria el nostre span. Sobreescriure'l, com fa el `bold` integrat,
    // fixa el valor del format i el manté.
    static formats() {
      return true
    }
  }

  XerracComodi.blotName = XERRAC_COMODI_BLOT
  XerracComodi.tagName = 'span'
  XerracComodi.className = XERRAC_COMODI_CLASS

  Quill.register(XerracComodi, true)
  registered = true
}
