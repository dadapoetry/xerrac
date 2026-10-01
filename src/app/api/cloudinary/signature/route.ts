import { createHash } from 'crypto'

const CLOUDINARY_FOLDER = 'xerrac-imatges'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const publicId: unknown = (body as { publicId?: unknown }).publicId
  const cloud = process.env.CLOUDINARY_CLOUD
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (
    !cloud || !apiKey || !apiSecret ||
    typeof publicId !== 'string' ||
    !/^[a-zA-Z0-9_-]+$/.test(publicId)
  ) {
    return Response.json(
      { error: 'Configuració de Cloudinary no disponible o public ID no admès.' },
      { status: 400 }
    )
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const params: Record<string, string> = {
    folder: CLOUDINARY_FOLDER,
    invalidate: 'true',
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  }
  const pairs = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  const signature = createHash('sha1').update(pairs + apiSecret).digest('hex')

  return Response.json({ cloudName: cloud, apiKey, timestamp, signature })
}