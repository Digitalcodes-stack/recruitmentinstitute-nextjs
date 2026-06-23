import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { batchSchema } from '@/lib/validations'

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
  const batch = await prisma.batch.findUnique({
    where: { id: parseInt(id) },
    include: {
      course: { select: { id: true, title: true } },
      trainer: { select: { id: true, name: true } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
      sessions: { orderBy: { sessionDate: 'asc' } },
    },
  })
  if (!batch) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: batch })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = batchSchema.partial().safeParse({
    ...body,
    ...(body.courseId !== undefined && { courseId: Number(body.courseId) }),
    ...(body.trainerId !== undefined && { trainerId: Number(body.trainerId) }),
    ...(body.capacity !== undefined && { capacity: Number(body.capacity) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { startDate, endDate, ...rest } = validated.data
  const batch = await prisma.batch.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
  })
  return NextResponse.json({ success: true, data: batch })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  try {
    await prisma.batch.delete({ where: { id: parseInt(id) } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete batch: remove its enrollments and sessions first' },
        { status: 409 },
      )
    }
    throw e
  }
  return NextResponse.json({ success: true, message: 'Batch deleted' })
}
