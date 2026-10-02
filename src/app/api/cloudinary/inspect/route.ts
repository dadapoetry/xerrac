import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'No autoritzat.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const prefix = searchParams.get('prefix') || ''
  const cloud = process.env.CLOUDINARY_CLOUD
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloud || !apiKey || !apiSecret) {
    return Response.json(
      { error: 'Configuració de Cloudinary no disponible (falten CLOUDINARY_CLOUD, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET).' },
      { status: 400 }
    )
  }

  const auth = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const api = `https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload`
  const url = `${api}?prefix=${encodeURIComponent(prefix)}&max_results=100`

  try {
    const res = await fetch(url, { headers: { Authorization: auth } })
    const body = await res.json()
    if (!res.ok) {
      return Response.json({ status: res.status, error: body?.error?.message || 'Error de l\'Admin API' })
    }
    const resources = (body?.resources || []).map(
      (r: { public_id?: string; format?: string; version?: number; created_at?: string; bytes?: number }) => ({
        public_id: r.public_id,
        format: r.format,
        version: r.version,
        created_at: r.created_at,
        bytes: r.bytes,
      })
    )
    return Response.json({ prefix, count: resources.length, resources })
  } catch (e) {
    return Response.json({ status: 500, error: e instanceof Error ? e.message : 'Error de diagnòstic' })
  }
}