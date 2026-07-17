import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autoritzat' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_MIME[file.type]) {
      return Response.json({ error: 'Format no permès. Usa JPG, PNG, GIF o WebP.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Fitxer massa gran. Màxim 5 MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = ALLOWED_MIME[file.type]
    const filename = `${uuidv4()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return Response.json({ url: `/uploads/${filename}` })
  } catch (error) {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
