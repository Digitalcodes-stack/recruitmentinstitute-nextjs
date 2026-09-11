import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { uploadMediaFile } from '@/lib/gcs-upload'

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

  if (file.size > 10 * 1024 * 1024)
    return NextResponse.json({ success: false, message: 'File too large. Max 10MB.' }, { status: 400 })

  try {
    const url = await uploadMediaFile(file, folder)
    return NextResponse.json({ success: true, url })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message || 'Upload failed' }, { status: 500 })
  }
}
