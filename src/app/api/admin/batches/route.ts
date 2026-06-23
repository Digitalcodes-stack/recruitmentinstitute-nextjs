import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { batchSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const batches = await prisma.batch.findMany({
    include: {
      course: { select: { id: true, title: true } },
      trainer: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json({ success: true, data: batches })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = batchSchema.safeParse({
    ...body,
    courseId: Number(body.courseId),
    trainerId: Number(body.trainerId),
    capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { startDate, endDate, ...rest } = validated.data
  const batch = await prisma.batch.create({
    data: {
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  })
  return NextResponse.json({ success: true, data: batch }, { status: 201 })
}
