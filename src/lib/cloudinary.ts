export const CLOUDINARY_CLOUD = 'lqdzlah5'
export const CLOUDINARY_PRESET = 'xerrac'
export const CLOUDINARY_FOLDER = 'xerrac-imatges'
export const MAX_UPLOAD_MB = 8

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

export async function uploadImageToCloudinary(file: File, transforms = 'f_auto,q_auto'): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El fitxer no és una imatge (JPG, PNG, WebP o GIF).')
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`La imatge supera els ${MAX_UPLOAD_MB} MB. Restringeix-la abans.`)
  }
  const publicId = sanitizePublicId(file.name)
  const sigRes = await fetch('/api/cloudinary/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  })
  const sig = await sigRes.json().catch(() => ({}))
  if (!sigRes.ok || !sig.signature) {
    throw new Error(sig?.error || "No s'ha pogut preparar la pujada.")
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
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data?.error?.message || "No s'ha pogut pujar la imatge. Torna-ho a provar.")
  }
  let url = (data.secure_url as string) || ''
  url = url.replace(/\/v\d+\//, '/')
  url = url.replace('/image/upload/', `/image/upload/${transforms}/`)
  url = url.replace(/\.[^.]+$/, '')
  if (!url.startsWith('https://')) {
    throw new Error("No s'ha pogut generar la URL de la imatge.")
  }
  return url
}