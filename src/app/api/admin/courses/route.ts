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

export async function GET() {
  const err = await guard()
  if (err) return err

  const courses = await prisma.course.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: courses })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = courseSchema.safeParse({
    ...body,
    categoryId:    Number(body.categoryId),
    totalStudents: Number(body.totalStudents ?? 0),
    rating:        body.rating !== '' && body.rating != null ? Number(body.rating) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const course = await prisma.course.create({ data: validated.data })
  return NextResponse.json({ success: true, data: course }, { status: 201 })
}
