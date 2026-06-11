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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const { title, description, image, isActive, sortOrder } = body

  if (!title?.trim()) return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 })

  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: {
      title: title.trim(),
      slug: toSlug(title),
      description: description?.trim() || null,
      image: image?.trim() || null,
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || 0,
    },
  })

  return NextResponse.json({ success: true, data: service })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const { isActive } = await req.json()

  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: { isActive },
  })

  return NextResponse.json({ success: true, data: service })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  await prisma.service.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
