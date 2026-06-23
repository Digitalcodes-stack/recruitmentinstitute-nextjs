import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar', 'png', 'jpg', 'jpeg']

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'student')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXT.includes(ext))
    return NextResponse.json({ success: false, message: 'Unsupported file type' }, { status: 400 })

  if (file.size > 20 * 1024 * 1024)
    return NextResponse.json({ success: false, message: 'File too large. Max 20MB.' }, { status: 400 })

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assignments', String(session.userId))

  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, safeName), Buffer.from(bytes))

  const url = `/uploads/assignments/${session.userId}/${safeName}`
  return NextResponse.json({ success: true, url })
}
