import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type OgFont = {
  name: 'Inter'
  data: ArrayBuffer
  weight: 400 | 900
  style: 'normal'
}

let cached: Promise<OgFont[]> | null = null

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

export function getOgFonts(): Promise<OgFont[]> {
  if (!cached) {
    cached = (async () => {
      const dir = join(process.cwd(), 'src', 'app', 'api', 'og', 'fonts')
      const [regular, black] = await Promise.all([
        readFile(join(dir, 'Inter-Regular.ttf')),
        readFile(join(dir, 'Inter-Black.ttf')),
      ])
      return [
        { name: 'Inter', data: toArrayBuffer(regular), weight: 400, style: 'normal' },
        { name: 'Inter', data: toArrayBuffer(black), weight: 900, style: 'normal' },
      ]
    })()
  }
  return cached
}
