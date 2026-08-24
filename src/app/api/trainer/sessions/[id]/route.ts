import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations'
import { enqueueSessionReminders, cancelSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'
import { sendSessionCancelledEmail } from '@/lib/email'

async function guard(sessionId: number) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) }
  }

  const dbSession = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { trainerId: true, googleEventId: true, startTime: true, sessionDate: true, title: true, meetLink: true, batchId: true }
  })

  if (!dbSession) {
    return { error: NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 }) }
  }

  if (dbSession.trainerId !== session.userId) {
    return { error: NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }) }
  }

  return { session, dbSession }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = parseInt(id)
  if (isNaN(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  const auth = await guard(sessionId)
  if ('error' in auth) return auth.error

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      trainer: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, data: session })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = parseInt(id)
  if (isNaN(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  const auth = await guard(sessionId)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const validated = sessionSchema.partial().safeParse({
    ...body,
    ...(body.batchId !== undefined && { batchId: Number(body.batchId) }),
    trainerId: auth.session.userId,
  })

  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const { sessionDate, startTime, endTime, ...rest } = validated.data

  if (validated.data.batchId !== undefined && validated.data.batchId !== auth.dbSession.batchId) {
    const batch = await prisma.batch.findFirst({
      where: { id: validated.data.batchId, trainerId: auth.session.userId }
    })
    if (!batch) {
      return NextResponse.json({ success: false, message: 'Target batch not found or not owned by trainer' }, { status: 404 })
    }
  }

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      ...rest,
      ...(sessionDate !== undefined && { sessionDate: new Date(sessionDate) }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
    },
    include: { batch: { include: { enrollments: { include: { student: true } } } } },
  })

  if (updatedSession.status === 'CANCELLED') {
    await cancelSessionReminders(sessionId)
    if (auth.dbSession.googleEventId) {
      await enqueueCalendarSync(sessionId, 'cancel', auth.dbSession.googleEventId)
    }

    const sessionDateLabel = updatedSession.sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const startTimeLabel = updatedSession.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    for (const e of updatedSession.batch.enrollments.filter((en) => ['APPROVED', 'ACTIVE', 'ENROLLED'].includes(en.status) && en.student.isActive)) {
      await sendSessionCancelledEmail({
        studentEmail: e.student.email,
        studentName: e.student.name,
        sessionTitle: updatedSession.title,
        batchName: updatedSession.batch.name,
        sessionDate: sessionDateLabel,
        startTime: startTimeLabel,
      }).catch(() => {})
    }
  } else {
    const timeChanged = startTime !== undefined && auth.dbSession.startTime.getTime() !== updatedSession.startTime.getTime()
    const contentChanged = rest.title !== undefined || rest.description !== undefined

    if (timeChanged) await enqueueSessionReminders(sessionId, updatedSession.startTime)
    if ((timeChanged || contentChanged) && auth.dbSession.googleEventId) {
      await enqueueCalendarSync(sessionId, 'patch')
    }
  }

  return NextResponse.json({ success: true, data: updatedSession })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = parseInt(id)
  if (isNaN(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  const auth = await guard(sessionId)
  if ('error' in auth) return auth.error

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: { select: { name: true } },
      attendance: { include: { enrollment: { include: { student: { select: { name: true, email: true, isActive: true } } } } } },
    },
  })

  await cancelSessionReminders(sessionId)

  if (session) {
    const sessionDateLabel = session.sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const startTimeLabel = session.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    for (const attendance of session.attendance) {
      const student = attendance.enrollment.student
      if (!student.isActive) continue
      await sendSessionCancelledEmail({
        studentEmail: student.email,
        studentName: student.name,
        sessionTitle: session.title,
        batchName: session.batch.name,
        sessionDate: sessionDateLabel,
        startTime: startTimeLabel,
      }).catch(() => {})
    }
  }

  if (auth.dbSession.googleEventId) {
    await prisma.jobQueue.create({
      data: {
        type: 'sync_calendar_event',
        payload: { sessionId, action: 'cancel', googleEventId: auth.dbSession.googleEventId },
        runAfter: new Date(),
      },
    })
  }

  await prisma.session.delete({ where: { id: sessionId } })
  return NextResponse.json({ success: true, message: 'Session deleted' })
}
