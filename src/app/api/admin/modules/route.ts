import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { moduleSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const courseId = req.nextUrl.searchParams.get('courseId')
  const modules = await prisma.module.findMany({
    where: courseId ? { courseId: parseInt(courseId) } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { chapters: true } } },
  })
  return NextResponse.json({ success: true, data: modules })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = moduleSchema.safeParse({
    ...body,
    courseId: Number(body.courseId),
    sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const mod = await prisma.module.create({ data: validated.data })
  return NextResponse.json({ success: true, data: mod }, { status: 201 })
}
