export const XERRAC_ICON_BLOT = 'xerracIcon'
export const XERRAC_ICON_CLASS = 'xerrac-mark'

let registered = false

// Registra el logo de Xerrac com un objecte inline (com una emoticona): es desa
// com a <span class="xerrac-mark">, no com una imatge. El dibuix el fa el CSS.
// Rebut la instància de Quill de react-quill (ReactQuill.Quill) per no dependre
// del paquet quill directament. Només s'ha d'executar al client, abans que
// react-quill munti l'editor.
export function registerXerracIcon(Quill: any): void {
  if (registered || !Quill) return
  const Embed = Quill.import('blots/embed')

  class XerracIcon extends Embed {
    static create(value: boolean) {
      const node = super.create(value) as HTMLElement
      node.setAttribute('class', XERRAC_ICON_CLASS)
      node.setAttribute('role', 'img')
      node.setAttribute('aria-label', 'Xerrac!')
      return node
    }
    static value() {
      return true
    }
  }

  XerracIcon.blotName = XERRAC_ICON_BLOT
  XerracIcon.tagName = 'span'
  XerracIcon.className = XERRAC_ICON_CLASS

  Quill.register(XerracIcon, true)
  registered = true
}
