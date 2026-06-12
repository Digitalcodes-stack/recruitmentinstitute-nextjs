import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'uploads'

  if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!allowed.includes(file.type))
    return NextResponse.json({ success: false, message: 'Invalid file type. Only JPG, PNG, WEBP, GIF, SVG allowed.' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ success: false, message: 'File too large. Max 5MB.' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)

  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, safeName), Buffer.from(bytes))

  const url = `/uploads/${folder}/${safeName}`
  return NextResponse.json({ success: true, url })
}
