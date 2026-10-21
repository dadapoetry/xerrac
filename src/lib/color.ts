// L'accent d'un número ha de poder fer dos papers alhora: farcit (amb text a
// sobre) i text sobre el fons fosc. No sempre el mateix color serveix per a tots
// dos. El vermell #ef4444, per exemple, dona 4,83:1 amb blanc a sobre (farcit ✓)
// pero nomes 3,76:1 com a text sobre negre (✗). Aquestes funcions deriven, a
// partir d'un sol accent, els colors que falten.

// El fons real del lloc és gairebé negre (#0a0a0a, vegeu `body` a globals.css).
const DARK_BG = '#0a0a0a'
const WHITE = '#ffffff'
const BLACK = '#000000'

type Rgb = [number, number, number]

function parseHex(hex: string): Rgb {
  const h = (hex || '').replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(n)) return [220, 38, 38]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex([r, g, b]: Rgb): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

function luminance([r, g, b]: Rgb): number {
  const chan = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)
}

function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function lighten(rgb: Rgb, t: number): Rgb {
  return [rgb[0] + (255 - rgb[0]) * t, rgb[1] + (255 - rgb[1]) * t, rgb[2] + (255 - rgb[2]) * t]
}

const DARK = parseHex(DARK_BG)

/**
 * Accent com a text sobre fons fosc. Si el color ja hi arriba (4,5:1), es
 * retorna tal qual; si no, s'aclareix cap al blanc just fins a arribar-hi.
 */
export function accentTextColor(hex: string): string {
  const base = parseHex(hex)
  if (contrast(base, DARK) >= 4.5) return toHex(base)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (contrast(lighten(base, mid), DARK) >= 4.5) hi = mid
    else lo = mid
  }
  return toHex(lighten(base, hi))
}

/** Text que va damunt del farcit de l'accent: blanc o negre, el que contrasti més. */
export function accentOnColor(hex: string): string {
  const base = parseHex(hex)
  return contrast(base, parseHex(WHITE)) >= contrast(base, parseHex(BLACK)) ? WHITE : '#0a0a0a'
}

/** `#rrggbb` → `r, g, b`, per encastar dins `rgba(...)` al CSS. */
export function hexToRgb(hex: string): string {
  return parseHex(hex).join(', ')
}

/**
 * Les variables CSS que defineixen l'accent d'un número, per aplicar-les a
 * un subconjunt del lloc (el peu, les pàgines soltes). Permet que el peu
 * adopti el color del número que s'està llegint, encara que el peu visqui
 * fora del visor, on aquestes variables només existeixen com a valors per
 * defecte.
 */
export function accentStyle(hex: string): React.CSSProperties {
  return {
    '--accent': hex,
    '--accent-rgb': hexToRgb(hex),
    '--accent-text': accentTextColor(hex),
    '--accent-on': accentOnColor(hex),
  } as React.CSSProperties
}
