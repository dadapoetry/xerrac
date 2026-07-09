import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return Response.json({ error: 'Format no permès. Usa JPG, PNG, GIF, WebP o SVG.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Fitxer massa gran. Màxim 5 MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const nameParts = file.name.split('.')
    const ext = nameParts.length > 1 ? nameParts.pop() : 'jpg'
    const filename = `${uuidv4()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return Response.json({ url: `/uploads/${filename}` })
  } catch (error) {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
