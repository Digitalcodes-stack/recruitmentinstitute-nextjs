import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const { title, description, author, image, rating, isActive } = body

  if (!author?.trim())
    return NextResponse.json({ success: false, message: 'Author is required' }, { status: 400 })

  const testimonial = await prisma.testimonial.update({
    where: { id: Number(id) },
    data: {
      title: title?.trim() || null,
      description: description?.trim() || null,
      author: author.trim(),
      image: image?.trim() || null,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      isActive: isActive !== false,
    },
  })
  return NextResponse.json({ success: true, data: testimonial })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const { isActive } = await req.json()

  const testimonial = await prisma.testimonial.update({
    where: { id: Number(id) },
    data: { isActive },
  })
  return NextResponse.json({ success: true, data: testimonial })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.testimonial.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true, message: 'Deleted' })
}
