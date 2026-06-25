import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations'
import { enqueueSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'

async function guard() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export async function GET() {
  const auth = await guard()
  if ('error' in auth) return auth.error

  const sessions = await prisma.session.findMany({
    where: { trainerId: auth.session.userId },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      trainer: { select: { id: true, name: true } },
    },
    orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json({ success: true, data: sessions })
}

export async function POST(req: NextRequest) {
  const auth = await guard()
  if ('error' in auth) return auth.error

  const body = await req.json()
  const validated = sessionSchema.safeParse({
    ...body,
    batchId: Number(body.batchId),
    trainerId: auth.session.userId,
  })

  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const batch = await prisma.batch.findFirst({
    where: { id: validated.data.batchId, trainerId: auth.session.userId },
    include: {
      enrollments: {
        where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
        include: { student: { select: { id: true, name: true, email: true, isActive: true } } },
      },
    },
  })

  if (!batch) {
    return NextResponse.json({ success: false, message: 'Batch not found' }, { status: 404 })
  }

  const { sessionDate, startTime, endTime, ...rest } = validated.data
  const session = await prisma.session.create({
    data: {
      ...rest,
      trainerId: auth.session.userId,
      sessionDate: new Date(sessionDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      trainer: { select: { id: true, name: true } },
    },
  })

  await enqueueSessionReminders(session.id, session.startTime)
  await enqueueCalendarSync(session.id, 'create')

  return NextResponse.json({ success: true, data: session }, { status: 201 })
}
