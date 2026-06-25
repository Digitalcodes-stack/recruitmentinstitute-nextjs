import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { enrollmentSchema } from '@/lib/validations'

export async function GET() {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const data = await prisma.enrollment.findMany({
    where: { studentId: session.userId },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true, description: true, startDate: true } },
          trainer: { select: { id: true, name: true, specialization: true } },
        },
      },
    },
    orderBy: { requestedAt: 'desc' },
  })

  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const validated = enrollmentSchema.safeParse({
    studentId: session.userId,
    batchId: Number(body.batchId),
  })

  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const { studentId, batchId } = validated.data
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { course: { select: { id: true, title: true } } },
  })

  if (!batch) {
    return NextResponse.json({ success: false, message: 'Batch not found' }, { status: 404 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_batchId: { studentId, batchId } },
  })

  if (existing) {
    return NextResponse.json({ success: false, message: 'Enrollment request already exists' }, { status: 400 })
  }

  const count = await prisma.enrollment.count({
    where: { batchId, status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
  })
  if (count >= batch.capacity) {
    return NextResponse.json({ success: false, message: 'Batch is at full capacity' }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      batchId,
      status: 'PENDING',
      requestedAt: new Date(),
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      batch: { select: { id: true, name: true, capacity: true, course: { select: { id: true, title: true } } } },
    },
  })

  return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
}
