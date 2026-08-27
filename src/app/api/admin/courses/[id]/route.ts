import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { courseSchema } from '@/lib/validations'

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
  const course = await prisma.course.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  })
  if (!course) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: course })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = courseSchema.partial().safeParse({
    ...body,
    ...(body.categoryId    != null && { categoryId:    Number(body.categoryId) }),
    ...(body.totalStudents != null && { totalStudents: Number(body.totalStudents) }),
    ...(body.rating !== '' && body.rating != null && { rating: Number(body.rating) }),
    ...(body.duration !== undefined && { duration: body.duration }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const course = await prisma.course.update({
    where: { id: parseInt(id) },
    data: validated.data,
  })
  return NextResponse.json({ success: true, data: course })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.course.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Course deleted' })
}
