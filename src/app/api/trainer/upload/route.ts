import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { uploadMediaFile } from '@/lib/gcs-upload'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized. Trainer login required.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Invalid file type. Only JPG, PNG, WEBP, and GIF allowed.' },
      { status: 400 }
    )
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ success: false, message: 'File too large. Maximum size is 10MB.' }, { status: 400 })
  }

  try {
    const url = await uploadMediaFile(file, 'trainers')

    // Automatically update the trainer's image field in the database
    await prisma.trainer.update({
      where: { id: session.userId },
      data: { image: url },
    })

    return NextResponse.json({ success: true, url, message: 'Photo uploaded and updated successfully!' })
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || 'Upload failed' },
      { status: 500 }
    )
  }
}
