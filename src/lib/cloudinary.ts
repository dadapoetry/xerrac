export const CLOUDINARY_CLOUD = 'lqdzlah5'
export const CLOUDINARY_PRESET = 'xerrac'
export const CLOUDINARY_FOLDER = 'xerrac-imatges'
export const MAX_UPLOAD_MB = 8
const SIGNATURE_TIMEOUT_MS = 20_000
const UPLOAD_TIMEOUT_MS = 180_000

type UploadStage = 'signature' | 'upload'

function describeUploadError(err: unknown, stage: UploadStage): Error {
  if (err instanceof DOMException) {
    if (err.name === 'TimeoutError') {
      return new Error(
        stage === 'signature'
          ? "El servidor no ha respost a temps en preparar la pujada. Torna-ho a provar."
          : "La pujada a Cloudinary s'ha quedat penjada sense resposta. Comprova la connexió i torna-ho a provar."
      )
    }
    if (err.name === 'AbortError') return new Error('Pujada cancel·lada.')
  }
  if (err instanceof TypeError) {
    return new Error(
      stage === 'signature'
        ? "No s'ha pogut connectar amb el servidor. Torna-ho a provar."
        : "No s'ha pogut connectar amb Cloudinary. Si tens extensions de privadesa, VPN o bloquejadors de contingut, permet api.cloudinary.com i torna-ho a provar."
    )
  }
  return err instanceof Error ? err : new Error("No s'ha pogut pujar la imatge.")
}

export function cloudinaryMobileUrl(url: string, transform = 'f_auto,q_auto,w_1080,h_1920,c_fill,g_auto'): string | null {
  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const base = url.slice(0, idx + marker.length)
  const rest = url.slice(idx + marker.length)
  const folderIdx = rest.indexOf(CLOUDINARY_FOLDER)
  if (folderIdx === -1) return null
  const pid = rest.slice(folderIdx)
  return `${base}${transform}/${pid}`
}

export function sanitizePublicId(name: string): string {
  const base = name.replace(/\.[^/.]+$/, '')
  return (
    base
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'imatge'
  )
}

export function publicIdFromUrl(url: string): string | null {
  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const rest = url.slice(idx + marker.length)
  const folderIdx = rest.indexOf(CLOUDINARY_FOLDER + '/')
  if (folderIdx === -1) return null
  const pid = rest.slice(folderIdx + CLOUDINARY_FOLDER.length + 1).split('?')[0]
  return pid || null
}

export async function uploadImageToCloudinary(
  file: File,
  transforms = 'f_auto,q_auto,w_1600',
  overwriteFrom?: string,
  externalSignal?: AbortSignal
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El fitxer no és una imatge (JPG, PNG, WebP o GIF).')
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`La imatge supera els ${MAX_UPLOAD_MB} MB. Restringeix-la abans.`)
  }
  const publicId = (overwriteFrom && publicIdFromUrl(overwriteFrom)) || sanitizePublicId(file.name)
  // Cap dels dos.fetch pot quedar pendent: sense Senyal d'abort, una resposta
  // que no arriba deixa la interfície en "Pujant..." indefinidament.
  const ctrl = new AbortController()
  let stage: UploadStage = 'signature'
  let timer = setTimeout(
    () => ctrl.abort(new DOMException('Temps esgotat', 'TimeoutError')),
    SIGNATURE_TIMEOUT_MS
  )
  const forwardAbort = () => ctrl.abort()
  externalSignal?.addEventListener('abort', forwardAbort)
  try {
    const sigRes = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
      signal: ctrl.signal,
    })
    const sig = await sigRes.json().catch(() => ({}))
    if (!sigRes.ok || !sig.signature) {
      throw new Error(`${sig?.error || 'No s\u2019ha pogut preparar la pujada'} (sig ${sigRes.status})`)
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('api_key', sig.apiKey)
    fd.append('timestamp', sig.timestamp)
    fd.append('signature', sig.signature)
    fd.append('public_id', publicId)
    fd.append('folder', CLOUDINARY_FOLDER)
    fd.append('overwrite', 'true')
    fd.append('invalidate', 'true')
    stage = 'upload'
    clearTimeout(timer)
    timer = setTimeout(
      () => ctrl.abort(new DOMException('Temps esgotat', 'TimeoutError')),
      UPLOAD_TIMEOUT_MS
    )
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: fd,
      signal: ctrl.signal,
    })
    const data = await res.json()
    if (!res.ok || data.error) {
      const err = data?.error?.message || 'Sense resposta de Cloudinary'
      throw new Error(`Cloudinary (${res.status}): ${err}`)
    }
    let url = (data.secure_url as string) || ''
    url = url.replace(/\/v\d+\//, '/')
    url = url.replace('/image/upload/', `/image/upload/${transforms}/`)
    url = url.replace(/\.[^.]+$/, '')
    if (!url.startsWith('https://')) {
      throw new Error("No s'ha pogut generar la URL de la imatge.")
    }
    const expectedPid = publicId.startsWith(`${CLOUDINARY_FOLDER}/`) ? publicId : `${CLOUDINARY_FOLDER}/${publicId}`
    if (data.public_id && data.public_id !== expectedPid) {
      throw new Error(
        `Cloudinary ha guardat «${data.public_id}» en lloc de «${expectedPid}» — per això no es substitueix. Revisa el mode de carpetes i el public_id que s'envia.`
      )
    }
    return `${url}?v=${Date.now()}`
  } catch (err) {
    throw describeUploadError(err, stage)
  } finally {
    clearTimeout(timer)
    externalSignal?.removeEventListener('abort', forwardAbort)
  }
}