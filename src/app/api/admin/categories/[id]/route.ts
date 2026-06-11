import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9_]+$/).optional(),
})

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const category = await prisma.courseCategory.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { courses: true, faqs: true, experts: true } } },
  })
  if (!category) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: category })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  try {
    const category = await prisma.courseCategory.update({
      where: { id: parseInt(id) },
      data: validated.data,
    })
    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  try {
    await prisma.courseCategory.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Cannot delete — category has linked records' }, { status: 409 })
  }
}
