import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err

  const body = await req.json()
  const { title, description, image, isActive, sortOrder } = body

  if (!title?.trim()) return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 })

  const slug = toSlug(title)

  const service = await prisma.service.create({
    data: {
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      image: image?.trim() || null,
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || 0,
    },
  })

  return NextResponse.json({ success: true, data: service })
}
