export const CLOUDINARY_CLOUD = 'lqdzlah5'
export const CLOUDINARY_PRESET = 'xerrac'
export const CLOUDINARY_FOLDER = 'xerrac-imatges'
export const MAX_UPLOAD_MB = 8

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
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUDINARY_PRESET)
  fd.append('public_id', sanitizePublicId(file.name))
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